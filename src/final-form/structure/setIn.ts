import toPath from "./toPath";

type State = Object | Array<any> | undefined;

/**
 * 根据路径 path，逐层深入对象或数组，设置新的值
 * @param {*} current 当前处理的对象、数组或值（可以是 `undefined`、`null`）
 * @param {*} index 当前处理路径中的第几层索引
 * @param {*} path 路径的数组形式（从 `toPath` 函数获得）
 * @param {*} value 最终要设置的值
 * @param {*} destroyArrays 决定在设置新值时是否销毁数组中的元素
 * @returns 
 */
const setInReCursor = (current: State,index: number, path: string[], value: any, destroyArrays: boolean):State => {
  // 当 `index` 达到 `path` 数组的长度时，表示已经遍历到路径的最后一层，此时返回新的值 `value`，即递归终止条件
  if (index >= path.length){
    return value;
  }

  const key = path[index]
  // 如果 `key` 不是数字，则将其视为对象的属性名进行操作
  // @ts-ignore
  if (isNaN(key)) {
    // 如果当前 `current` 为 `undefined` 或 `null`，则继续递归，并尝试创建一个新的对象
    if (current === undefined || current === null)  {
      const result = setInReCursor(undefined, index + 1, path, value, destroyArrays)
      return result === undefined ? undefined: {[key]:result}
    }

    // 如果 `current` 是数组，但 `key` 不是数字，则抛出错误，因为不能为数组设置非数字的键
    if (Array.isArray(current)) {
      throw new Error("Cannot set a non-numeric property on an array");
    }

    // @ts-ignore
    const result = setInReCursor(current[key], index + 1, path, value, destroyArrays)

    // 如果 `result` 为 `undefined`，意味着应该删除当前的 `key`。通过对对象进行浅拷贝并删除相应键，来确保不可变操作
    if (result === undefined) {
      const numKeys = Object.keys(current).length;
      // @ts-ignore
      if (current[key] === undefined && numKeys === 0) {
        // object was already empty
        return undefined;
      }
      // @ts-ignore
      if (current[key] !== undefined && numKeys <= 1) {
        // only key we had was the one we are deleting
        // @ts-ignore
        if (!isNaN(path[index - 1]) && !destroyArrays) {
          // we are in an array, so return an empty object
          return {};
        } else {
          return undefined;
        }
      }
      // @ts-ignore
      const { [key]: _removed, ...final } = current;
      return final;
    }
    // 如果当前对象存在，则使用新的结果来更新对象中对应的键值
    return {
      ...current,
      [key]: result,
    };
  }
  // 如果是数字，则将其视为数组的索引
  const numericKey = Number(key);
  // 如果 `current` 为 `undefined` 或 `null`，且路径中的 `key` 是数字，则创建一个新的数组，并将结果放在相应的索引位置
  if (current === undefined || current === null) {
    const result = setInReCursor(
      undefined,
      index + 1,
      path,
      value,
      destroyArrays,
    );

    // if nothing returned, delete it
    if (result === undefined) {
      return undefined;
    }

    const array = [];
    array[numericKey] = result;
    return array;
  }

  // 如果当前 `current` 不是数组但 `key` 是数字，则抛出错误，因为不能为非数组对象设置数字属性
    if (!Array.isArray(current)) {
      throw new Error("Cannot set a numeric property on an object");
    }

    const existingValue = current[numericKey];
    const result = setInReCursor(
      existingValue,
      index + 1,
      path,
      value,
      destroyArrays,
    );

  // 如果 `destroyArrays` 为 `true` 且 `result` 为 `undefined`，则删除数组中相应索引的元素
  const array = [...current];
  if (destroyArrays && result === undefined) {
    array.splice(numericKey, 1);
    if (array.length === 0) {
      return undefined;
    }
  } else {
    array[numericKey] = result;
  }
  return array;
}

const setIn = (state:Object, key:string, value: any, destroyArrays = false) => {
  if (state === undefined || state === null) {
    throw new Error(`Cannot call setIn() with ${String(state)} state`);
  }
  if (key === undefined || key === null) {
    throw new Error(`Cannot call setIn() with ${String(key)} key`);
  }
  const pathKey = toPath(key);
  return setInReCursor(state, 0, pathKey, value, destroyArrays);
};

export default setIn;
