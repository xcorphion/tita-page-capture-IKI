export function getPearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((prev, curr, i) => prev + (curr * y[i]), 0);
    const sumX2 = x.reduce((a, b) => a + (b * b), 0);
    const sumY2 = y.reduce((a, b) => a + (b * b), 0);
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    if (denominator === 0) return 0;
    return numerator / denominator;
}

export function getCohensD(groupA, groupB) {
    if (groupA.length < 2 || groupB.length < 2) return 0;
    const meanA = groupA.reduce((a, b) => a + b, 0) / groupA.length;
    const meanB = groupB.reduce((a, b) => a + b, 0) / groupB.length;
    const varA = groupA.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / (groupA.length - 1);
    const varB = groupB.reduce((a, b) => a + Math.pow(b - meanB, 2), 0) / (groupB.length - 1);
    const pooledStd = Math.sqrt(((groupA.length - 1) * varA + (groupB.length - 1) * varB) / (groupA.length + groupB.length - 2));
    if (pooledStd === 0) return 0;
    return Math.abs(meanA - meanB) / pooledStd;
}

export function getTerciles(data, criterionKey, valueKey) {
    const sorted = [...data].sort((a, b) => a[criterionKey] - b[criterionKey]);
    const n = sorted.length;
    const third = Math.floor(n / 3);
    if (third === 0) return { superior: [], inferior: [] };
    const inferior = sorted.slice(0, third).map(d => d[valueKey]);
    const superior = sorted.slice(n - third).map(d => d[valueKey]);
    return { superior, inferior };
}
