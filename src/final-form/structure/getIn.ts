import toPath from "./toPath";

const getIn = (state: Object, complexKey: string) => {
  const path = toPath(complexKey);
  let current = state;
  for (let i = 0; i < path.length; i++) {
    const key: any = path[i];
    if (
      current === undefined ||
      current === null ||
      typeof current !== "object" ||
      (Array.isArray(current) && isNaN(key))
    ) {
      return undefined;
    }
    // @ts-ignore
    current = current[key];
  }
  return current;
};

export default getIn;
