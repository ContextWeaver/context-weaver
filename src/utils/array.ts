// RPG Event Generator v3.0.0 - Array Utility Functions
// Centralized array manipulation and processing helpers

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates from array of objects by key
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Group array items by key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Sort array by multiple criteria
 */
export function sortBy<T>(array: T[], ...keyFns: ((item: T) => any)[]): T[] {
  return [...array].sort((a, b) => {
    for (const keyFn of keyFns) {
      const aVal = keyFn(a);
      const bVal = keyFn(b);

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Partition array into two groups based on predicate
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach(item => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
}

/**
 * Find item in array by predicate, or return default value
 */
export function findOrDefault<T>(
  array: T[],
  predicate: (item: T) => boolean,
  defaultValue: T
): T {
  return array.find(predicate) ?? defaultValue;
}

/**
 * Get random sample from array
 */
export function sample<T>(array: T[], count: number = 1): T[] {
  if (count >= array.length) return [...array];

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Create chunks of specified size from array
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((flat, array) => flat.concat(array), []);
}

/**
 * Deep flatten nested arrays
 */
export function flattenDeep<T>(arrays: any[]): T[] {
  return arrays.reduce((flat: any[], item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, []);
}

/**
 * Create sliding window of specified size
 */
export function slidingWindow<T>(array: T[], size: number): T[][] {
  const windows: T[][] = [];
  for (let i = 0; i <= array.length - size; i++) {
    windows.push(array.slice(i, i + size));
  }
  return windows;
}

/**
 * Calculate intersection of multiple arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];

  return arrays.reduce((result, array) => {
    return result.filter(item => array.includes(item));
  });
}

/**
 * Calculate union of multiple arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(flatten(arrays));
}

/**
 * Calculate difference between arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

/**
 * Move item from one index to another
 */
export function move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const newArray = [...array];
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
}

/**
 * Rotate array by specified number of positions
 */
export function rotate<T>(array: T[], positions: number): T[] {
  const len = array.length;
  const normalizedPositions = ((positions % len) + len) % len;
  return [...array.slice(-normalizedPositions), ...array.slice(0, -normalizedPositions)];
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Get last element of array safely
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Get first element of array safely
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Remove item from array by value
 */
export function remove<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index > -1) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array];
}