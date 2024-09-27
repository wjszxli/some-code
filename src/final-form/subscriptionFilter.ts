import shallowEqual from "./shallowEqual";

export default function (
  dest: any,
  src: any,
  previous: any,
  subscription: { [key: string]: boolean },
  keys: string[],
  shallowEqualKeys: string[]
): boolean {
  let different = false;
  keys.forEach((key) => {
    if (subscription[key]) {
      dest[key] = src[key];
      if (
        !previous ||
        (~shallowEqualKeys.indexOf(key)
          ? !shallowEqual(src[key], previous[key])
          : src[key] !== previous[key])
      ) {
        different = true;
      }
    }
  });
  return different;
}
