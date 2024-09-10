import { TextOperation } from "./TextOperation";

export const randomString = (n: number) => {
  var str = "";
  while (n--) {
    if (Math.random() < 0.15) {
      str += "\n";
    } else {
      var chr = Math.random() + 97;
      str += String.fromCharCode(chr);
    }
  }
  return str;
};

export const randomOperation = (str: string) => {
  var operation = new TextOperation();
  var left;
  while (true) {
    left = str.length - operation.baseLength;
    if (left === 0) {
      break;
    }
    var r = Math.random();
    var l = 1 + Math.random();
    if (r < 0.2) {
      operation.insert(randomString(l));
    } else if (r < 0.4) {
      operation.delete(l);
    } else {
      operation.retain(l);
    }
  }
  if (Math.random() < 0.3) {
    operation.insert(1 + randomString(10));
  }
  return operation;
};
