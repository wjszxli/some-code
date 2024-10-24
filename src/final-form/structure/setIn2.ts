import { SetIn } from "../type";
import toPath from "./toPath";

type State = Record<string, any> | Array<any> | undefined | null;

const handleUndefinedState = (
  key: string,
  index: number,
  path: string[],
  value: any,
  destroyArrays: boolean,
  isArray: boolean
) => {
  const result = setInReCursor(
    undefined,
    index + 1,
    path,
    value,
    destroyArrays
  );
  if (result === undefined) return result;
  if (isArray) {
    const array: any = [];
    array[key] = result;
    return array;
  }
  return { [key]: result };
};

const setInReCursor = (
  current: State,
  index: number,
  path: string[],
  value: any,
  destroyArrays: boolean
): State => {
  if (index >= path.length) {
    return value;
  }

  const key = path[index];
  const isNumericKey = !isNaN(Number(key)); // 判断 key 是否为数字
  if (!isNumericKey) {
    if (current === undefined || current === null) {
      return handleUndefinedState(
        key,
        index,
        path,
        value,
        destroyArrays,
        false
      );
    }

    if (Array.isArray(current)) {
      throw new Error("Cannot set a non-numeric property on an array");
    }

    const result = setInReCursor(
      current[key],
      index + 1,
      path,
      value,
      destroyArrays
    );

    if (result === undefined) {
      const numKeys = Object.keys(current).length;
      if (current[key] === undefined && numKeys === 0) {
        return undefined; // 当前对象为空
      }
      if (current[key] != undefined && numKeys <= 1) {
        // @ts-ignore
        if (!isNaN(path[index - 1]) && !destroyArrays) {
          return {}; // 数字键为 NaN，并且 destroyArrays 为 false
        }
        return undefined; // 对象中只剩下一个 key
      }

      const { [key]: _removed, ...final } = current;
      return final;
    }

    return {
      ...current,
      [key]: result,
    };
  }
  // 处理数组类型
  const numericKey = Number(key);
  if (current === undefined || current === null) {
    return handleUndefinedState(key, index, path, value, destroyArrays, true);
  }
  if (!Array.isArray(current)) {
    throw new Error("Cannot set a numeric property on an object");
  }

  const result = setInReCursor(
    current[numericKey],
    index + 1,
    path,
    value,
    destroyArrays
  );

  const array = [...current];
  if (destroyArrays && result === undefined) {
    array.splice(numericKey, 1);
    return array.length === 0 ? undefined : array;
  } else {
    array[numericKey] = result;
  }

  return array;
};

const setIn: SetIn = (state, key, value, destroyArrays = false): Object => {
  if (state === undefined || state === null) {
    throw new Error(`Cannot call setIn() with ${String(state)} state`);
  }

  if (key === undefined || key === null) {
    throw new Error(`Cannot call setIn() with ${String(key)} key`);
  }

  const pathKey = toPath(key);
  // 调用递归函数
  return setInReCursor(state, 0, pathKey, value, destroyArrays) as Object;
};

export default setIn;
