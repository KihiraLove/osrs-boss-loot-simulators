export function convolveDistributions(a, b) {
  const values = new Float64Array(a.values.length + b.values.length - 1);
  for (let i = 0; i < a.values.length; i++) {
    if (!a.values[i]) continue;
    for (let j = 0; j < b.values.length; j++) values[i + j] += a.values[i] * b.values[j];
  }
  return { from: a.from + b.from, values, expected: a.expected + b.expected };
}

export function distributionOdds(distribution, count) {
  let fewer = 0, exact = 0;
  distribution.values.forEach((probability, index) => {
    const value = distribution.from + index;
    if (value < count) fewer += probability;
    else if (value === count) exact += probability;
  });
  const clamp = value => Math.max(0, Math.min(1, value));
  return { count, expected: distribution.expected, fewer: clamp(fewer), exact: clamp(exact), more: clamp(1 - fewer - exact) };
}
