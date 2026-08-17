function merge<A extends object | undefined, B extends object | undefined>(a: A, b: B) {
  if (a && !b) return a;
  else if (!a && b) return b;
  else if (a || b) return { ...a, ...b };
  else return undefined;
}

export function mergeObjects(...objects: (object | undefined)[]): object | undefined {
  return objects.reduce((acc, obj) => merge(acc, obj), undefined);
}
