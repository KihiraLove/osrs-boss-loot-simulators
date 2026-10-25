export function validateDropCount(count, max, label = "Drop count") {
  if (!Number.isSafeInteger(count) || count < 0 || count > max) {
    throw new RangeError(label + " must be a whole number from 0 to " + max.toLocaleString("en-US") + ".");
  }
  return count;
}

// Start at the mode, then normalize relative probabilities. This avoids
// underflow at P(0) and stores only the numerically significant support.
export function binomial(n, p, { maxTrials = Number.MAX_SAFE_INTEGER, deviations = 10, padding = 15 } = {}) {
  validateDropCount(n, maxTrials, "Trials");
  if (typeof p !== "number" || !(p >= 0 && p <= 1)) throw new RangeError("Invalid probability.");
  if (!Number.isFinite(deviations) || deviations <= 0 || !Number.isFinite(padding) || padding < 0) throw new RangeError("Invalid distribution support.");
  if (n === 0 || p === 0) return { from: 0, values: Float64Array.of(1), expected: 0 };
  if (p === 1) return { from: n, values: Float64Array.of(1), expected: n };
  const expected = n * p, radius = Math.ceil(deviations * Math.sqrt(n * p * (1 - p)) + padding);
  const from = Math.max(0, Math.floor(expected - radius));
  const to = Math.min(n, Math.ceil(expected + radius));
  const mode = Math.max(from, Math.min(to, Math.floor((n + 1) * p)));
  const values = new Float64Array(to - from + 1);
  values[mode - from] = 1;
  for (let k = mode - 1; k >= from; k--) values[k - from] = values[k + 1 - from] * (k + 1) / (n - k) * (1 - p) / p;
  for (let k = mode + 1; k <= to; k++) values[k - from] = values[k - 1 - from] * (n - k + 1) / k * p / (1 - p);
  let total = 0;
  for (const value of values) total += value;
  for (let i = 0; i < values.length; i++) values[i] /= total;
  return { from, values, expected };
}

export function convolveDistributions(a, b) {
  if (a.from === 0 && a.values.length === 1 && a.values[0] === 1) return { ...b };
  if (b.from === 0 && b.values.length === 1 && b.values[0] === 1) return { ...a };
  const values = new Float64Array(a.values.length + b.values.length - 1);
  for (let i = 0; i < a.values.length; i++) {
    if (!a.values[i]) continue;
    for (let j = 0; j < b.values.length; j++) values[i + j] += a.values[i] * b.values[j];
  }
  return { from: a.from + b.from, values, expected: a.expected + b.expected };
}

// Repeat a discrete reward distribution using exponentiation by squaring.
// Keep small supports intact so even several ultra-rares retain nonzero odds.
// Trimming at most 1e-15 from each tail of larger convolutions keeps large
// casket counts practical while preserving the analytically known mean.
export function repeatDistribution(distribution, count) {
  validateDropCount(count, Number.MAX_SAFE_INTEGER, "Trials");
  function trim(dist) {
    let first = 0, last = dist.values.length - 1, lower = 0, upper = 0;
    const trimTails = dist.values.length > 256;
    while (trimTails && first < last && lower + dist.values[first] <= 1e-15) lower += dist.values[first++];
    while (trimTails && last > first && upper + dist.values[last] <= 1e-15) upper += dist.values[last--];
    const values = dist.values.slice(first, last + 1);
    let mass = 0;
    for (const value of values) mass += value;
    for (let i = 0; i < values.length; i++) values[i] /= mass;
    return { from: dist.from + first, values, expected: dist.expected };
  }
  let result = { from: 0, values: Float64Array.of(1), expected: 0 };
  let power = distribution, remaining = count;
  while (remaining > 0) {
    if (remaining % 2) result = trim(convolveDistributions(result, power));
    remaining = Math.floor(remaining / 2);
    if (remaining) power = trim(convolveDistributions(power, power));
  }
  return result;
}

export function distributionOdds(distribution, count, transform) {
  let fewer = 0, exact = 0, expected = transform ? 0 : distribution.expected;
  distribution.values.forEach((probability, index) => {
    const value = transform ? transform(distribution.from + index) : distribution.from + index;
    if (transform) expected += value * probability;
    if (value < count) fewer += probability;
    else if (value === count) exact += probability;
  });
  const clamp = value => Math.max(0, Math.min(1, value));
  return { count, expected, fewer: clamp(fewer), exact: clamp(exact), more: clamp(1 - fewer - exact) };
}
