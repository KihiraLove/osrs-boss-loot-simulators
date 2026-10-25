import { binomial, convolveDistributions, distributionOdds, repeatDistribution, validateDropCount } from "./distributions.mjs";

// Flattened subtables retain exact per-roll rates and separate stack outcomes.
export function createRewardTable(rewards) {
  const rates = new Map(), cumulative = [];
  let total = 0;
  for (const row of rewards) {
    const p = row[4] / row[5];
    rates.set(row[0], (rates.get(row[0]) ?? 0) + p);
    for (const extra of row[6] ?? []) rates.set(extra[0], (rates.get(extra[0]) ?? 0) + p);
    cumulative.push(total += p);
  }
  return {
    rateOf: id => rates.get(id) ?? 0,
    rollReward({ unit, add }) {
      const roll = unit() * total;
      let low = 0, high = rewards.length - 1;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (roll < cumulative[middle]) high = middle;
        else low = middle + 1;
      }
      add(rewards[low]);
      for (const extra of rewards[low][6] ?? []) add(extra);
    }
  };
}

// Caskets choose a roll count uniformly, then roll each reward independently.
export function rewardRollDistribution(p, minRolls, maxRolls) {
  const values = new Float64Array(maxRolls + 1);
  for (let rolls = minRolls; rolls <= maxRolls; rolls++) {
    const distribution = binomial(rolls, p);
    distribution.values.forEach((chance, index) => {
      values[distribution.from + index] += chance / (maxRolls - minRolls + 1);
    });
  }
  return { from: 0, values, expected: (minRolls + maxRolls) / 2 * p };
}

export function simulateCaskets(caskets, { minRolls, maxRolls, maxCaskets, label, rollReward, bonusReward, tertiary = [], rng = Math.random }) {
  validateDropCount(caskets, maxCaskets, label);
  if (typeof rng !== "function") throw new TypeError("RNG must be a function.");
  const unit = () => {
    const value = rng();
    if (typeof value !== "number" || !(value >= 0 && value < 1)) throw new RangeError("RNG must return a number in [0, 1).");
    return value;
  };
  const drops = {};
  const add = ([id, , min, max]) => {
    const quantity = min === max ? min : min + Math.floor(unit() * (max - min + 1));
    drops[id] = (drops[id] ?? 0) + quantity;
  };
  const context = { unit, add, pick: rows => rows[Math.floor(unit() * rows.length)] };
  let rewardRolls = 0;
  for (let casket = 0; casket < caskets; casket++) {
    const rolls = minRolls + Math.floor(unit() * (maxRolls - minRolls + 1));
    rewardRolls += rolls;
    for (let roll = 0; roll < rolls; roll++) rollReward(context);
    for (const item of tertiary) if (unit() < item.rate) add([item.id, item.name, 1, 1]);
    if (bonusReward) bonusReward(context);
  }
  return { caskets, rewardRolls, drops };
}

export function calculateCasketDry(caskets, received, { unique, rateOf, minRolls, maxRolls, maxCaskets, label, tertiary = [], bonusCount = 0, bonusRateOf = () => 0,
  rollGroups = [{ count: caskets, minRolls, maxRolls }] }) {
  validateDropCount(caskets, maxCaskets, label);
  validateDropCount(bonusCount, caskets, "Mimic caskets");
  if (!received || typeof received !== "object" || Array.isArray(received)) throw new TypeError("Enter received reward counts.");
  let groupedCaskets = 0, maxRegular = 0;
  for (const group of rollGroups) {
    validateDropCount(group.count, caskets, "Casket group");
    groupedCaskets += group.count;
    maxRegular += group.count * group.maxRolls;
  }
  if (groupedCaskets !== caskets) throw new RangeError("Casket groups must match the total.");
  const cache = new Map();
  function distributionFor(p, q) {
    const key = p + ":" + q;
    if (!cache.has(key)) {
      let distribution = binomial(bonusCount, q);
      let logNone = bonusCount ? bonusCount * Math.log1p(-q) : 0;
      for (const group of rollGroups) {
        if (!group.count) continue;
        const single = rewardRollDistribution(p, group.minRolls, group.maxRolls);
        distribution = convolveDistributions(distribution, repeatDistribution(single, group.count));
        logNone += group.count * Math.log(single.values[0]);
      }
      cache.set(key, { distribution, logNone });
    }
    return cache.get(key);
  }
  const atLeastOne = logNone => Math.max(0, -Math.expm1(logNone));
  const result = {};
  const tertiaryIds = new Set(tertiary.map(item => item.id));
  let total = 0, combinedRate = 0, combinedBonusRate = 0, bonusOnlyTotal = 0;
  for (const item of unique.filter(item => !tertiaryIds.has(item.id))) {
    const count = received[item.id] ?? 0;
    const p = rateOf(item.id), q = bonusRateOf(item.id);
    validateDropCount(count, (p ? maxRegular : 0) + (q ? bonusCount : 0), item.name);
    total += count;
    if (!p) bonusOnlyTotal += count;
    combinedRate += p;
    combinedBonusRate += q;
    const { distribution, logNone } = distributionFor(p, q);
    result[item.id] = { ...distributionOdds(distribution, count), atLeastOne: atLeastOne(logNone) };
  }
  validateDropCount(bonusOnlyTotal, bonusCount, "Combined Mimic-only rewards");
  let { distribution, logNone } = distributionFor(combinedRate, combinedBonusRate);
  let maxCollection = maxRegular + bonusCount;
  for (const item of tertiary) {
    const count = received[item.id] ?? 0;
    validateDropCount(count, caskets, item.name);
    const itemDistribution = binomial(caskets, item.rate);
    const itemLogNone = caskets ? caskets * Math.log1p(-item.rate) : 0;
    result[item.id] = { ...distributionOdds(itemDistribution, count), atLeastOne: atLeastOne(itemLogNone) };
    if (item.collection) {
      total += count;
      maxCollection += caskets;
      distribution = convolveDistributions(distribution, itemDistribution);
      logNone += itemLogNone;
    }
  }
  validateDropCount(total, maxCollection, "Combined collection-log rewards");
  result.anyUnique = { ...distributionOdds(distribution, total), atLeastOne: atLeastOne(logNone) };
  return result;
}
