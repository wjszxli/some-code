const shallowEqual = (a: any, b: any) => {
  if (a === b) return true;

  if (typeof a !== "object" || !a || typeof b !== "object" || !b) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b);
  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx];
    if (!bHasOwnProperty(key) || a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};

export default shallowEqual;
