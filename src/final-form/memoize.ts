import shallowEqual from "./shallowEqual";

const memoize = (fn: Function) => {
  let lastArgs: any;
  let lastResult: any;
  return (...args: any[]) => {
    if (
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, index) => !shallowEqual(lastArgs[index], arg))
    ) {
      lastArgs = args;
      lastResult = fn(...args);
    }
    return lastResult;
  };
};

export default memoize;
