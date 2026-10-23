import { ITEMS } from "./chest-data.mjs";
import { binomial } from "../bosses/phosani/dry-calc.mjs";
import { distributionOdds } from "./distributions.mjs";

export const MAX_OPENINGS = 1_000_000;
export function validateOpenings(count) {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_OPENINGS) {
    throw new RangeError("Completed openings must be a whole number from 0 to 1,000,000.");
  }
}

function optionsFor(config, options) {
  if (!options || typeof options !== "object") throw new TypeError("Invalid chest settings");
  const { fishingLevel = 99, members = true, rng = Math.random } = options;
  if (config.fishing && (!Number.isInteger(fishingLevel) || fishingLevel < 1 || fishingLevel > 99)) throw new RangeError("Fishing level must be from 1 to 99.");
  if (config.members && typeof members !== "boolean") throw new TypeError("Members world must be enabled or disabled.");
  if (typeof rng !== "function") throw new TypeError("Invalid random generator");
  return { fishingLevel, members, rng };
}

function roll(node, drops, rng) {
  if (node.id) {
    const amount = Math.floor((node.min + (node.max === node.min ? 0 : Math.floor(rng() * (node.max - node.min + 1)))) * node.scale);
    drops[node.id] = (drops[node.id] ?? 0) + amount;
    return;
  }
  for (let i = 0; i < node.rolls; i++) {
    const ticket = rng() * node.total;
    let cumulative = 0;
    const entry = node.entries.find(entry => (cumulative += entry.weight) > ticket);
    for (const reward of entry.rewards) roll(reward, drops, rng);
  }
}

// Compute a tracked item's one-opening distribution from the same reward tree
// used by the simulator, so pre-roll failures and bundled quantities stay in sync.
function combine(a, b) {
  const result = new Map();
  for (const [x, p] of a) for (const [y, q] of b) result.set(x + y, (result.get(x + y) ?? 0) + p * q);
  return result;
}
function itemDistribution(nodes, id) {
  let result = new Map([[0, 1]]);
  for (const node of nodes) {
    let next = new Map();
    if (node.id) {
      if (node.id !== id) next.set(0, 1);
      else for (let n = node.min; n <= node.max; n++) {
        const quantity = Math.floor(n * node.scale);
        next.set(quantity, (next.get(quantity) ?? 0) + 1 / (node.max - node.min + 1));
      }
    } else {
      for (const entry of node.entries) {
        if (!entry.weight) continue;
        for (const [count, p] of itemDistribution(entry.rewards, id)) next.set(count, (next.get(count) ?? 0) + p * entry.weight / node.total);
      }
      const once = next;
      for (let i = 1; i < node.rolls; i++) next = combine(next, once);
    }
    result = combine(result, next);
  }
  return result;
}

export function createChestCalculator(config) {
  const DRY_ITEMS = config.dryIds.map(id => ITEMS[id]);
  function dropInfo(id, options = {}) {
    if (!config.dryIds.includes(id)) throw new RangeError("Unknown tracked chest reward");
    const settings = optionsFor(config, options);
    const distribution = itemDistribution(config.rewards(settings), id);
    const rewards = [...distribution].filter(([count, chance]) => count > 0 && chance > 0);
    if (rewards.length > 1) throw new Error("Tracked chest rewards must have a fixed bundle size.");
    return { quantity: rewards[0]?.[0] ?? 1, chance: rewards[0]?.[1] ?? 0 };
  }
  function simulate(openings, options = {}) {
    validateOpenings(openings);
    const settings = optionsFor(config, options);
    const rng = () => {
      const value = settings.rng();
      if (typeof value !== "number" || !(value >= 0 && value < 1)) throw new RangeError("Random values must be from 0 inclusive to 1 exclusive.");
      return value;
    };
    const rewards = config.rewards(settings), drops = {};
    for (let i = 0; i < openings; i++) for (const node of rewards) roll(node, drops, rng);
    return { openings, drops };
  }
  function calculateDry(openings, received = {}, options = {}) {
    validateOpenings(openings);
    optionsFor(config, options);
    if (!received || typeof received !== "object") throw new TypeError("Missing reward counts");
    const result = {}, information = {};
    for (const item of DRY_ITEMS) {
      const { quantity, chance } = dropInfo(item.id, options);
      information[item.id] = { quantity, chance };
      const count = received[item.id] ?? 0;
      if (!Number.isSafeInteger(count) || count < 0 || count > openings * quantity || (chance === 0 && count > 0)) {
        throw new RangeError("Enter a possible quantity for " + item.name + " across these openings.");
      }
      const odds = distributionOdds(binomial(openings, chance), Math.ceil(count / quantity));
      if (count % quantity !== 0) { odds.exact = 0; odds.more = Math.max(0, 1 - odds.fewer); }
      result[item.id] = { ...odds, count, expected: openings * chance * quantity,
        atLeastOne: openings === 0 ? 0 : -Math.expm1(openings * Math.log1p(-chance)) };
    }
    for (const group of config.exclusive ?? []) {
      if (group.reduce((sum, id) => sum + (received[id] ?? 0) / information[id].quantity, 0) > openings) {
        throw new RangeError("These rewards share one roll; their total cannot exceed completed openings.");
      }
    }
    return result;
  }
  return { config, ITEMS, DRY_ITEMS, MAX_OPENINGS, dropInfo, simulate, calculateDry };
}
