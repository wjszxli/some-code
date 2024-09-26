type TOpsItem = number | string;

export class TextOperation {
  ops: TOpsItem[] = [];
  baseLength = 0;
  targetLength = 0;

  isRetain(n: TOpsItem): boolean {
    return typeof n === "number" && n > 0;
  }

  isInsert(str: TOpsItem): boolean {
    return typeof str === "string" && str.length > 0;
  }

  isDelete(n: TOpsItem): boolean {
    return typeof n === "number" && n < 0;
  }

  isNoop() {
    return (
      this.ops.length === 0 ||
      (this.ops.length === 1 && this.isRetain(this.ops[0]))
    );
  }

  getLastOp(): TOpsItem {
    return this.ops[this.ops.length - 1];
  }

  getStartIndex(operation: TextOperation): number {
    if (operation.isRetain(operation.ops[0])) return operation.ops[0] as number;
    return 0;
  }

  retain(n: number) {
    if (n === 0) return this;

    this.baseLength += n;
    this.targetLength += n;

    const lastOp = this.getLastOp();

    if (this.isRetain(lastOp)) {
      this.ops[this.ops.length - 1] = (lastOp as number) + n;
    } else {
      this.ops.push(n);
    }

    return this;
  }

  insert(str: string) {
    if (str.length === 0) return this;

    this.targetLength += str.length;
    const lastOp = this.getLastOp();

    if (this.isInsert(lastOp)) {
      this.ops[this.ops.length - 1] = (lastOp as string) + str;
    } else if (this.isDelete(lastOp)) {
      const lastTwoOps = this.ops[this.ops.length - 2];
      if (this.isInsert(lastTwoOps)) {
        this.ops[this.ops.length - 2] = (lastTwoOps as string) + str;
      } else {
        this.ops[this.ops.length] = this.ops[this.ops.length - 1];
        this.ops[this.ops.length - 2] = str;
      }
    } else {
      this.ops.push(str);
    }

    return this;
  }

  delete(ops: TOpsItem) {
    let n = 0;

    if (typeof ops === "number") {
      n = ops;
    }

    if (typeof ops === "string") {
      n = ops.length;
    }

    if (n === 0) return this;

    if (n > 0) n = -n;

    this.baseLength -= n;
    const lastOp = this.getLastOp();

    if (this.isDelete(lastOp)) {
      this.ops[this.ops.length - 1] = (lastOp as number) + n;
    } else {
      this.ops.push(n);
    }

    return this;
  }

  toJson() {
    return this.ops;
  }

  toString() {
    if (this.isNoop()) return "";

    return this.ops
      .map((op) => {
        if (this.isRetain(op)) {
          return `retain(${op})`;
        } else if (this.isInsert(op)) {
          return `insert('${op}')`;
        } else {
          return `delete(${-op})`;
        }
      })
      .join(", ");
  }

  static fromJSON(ops: TOpsItem[]) {
    const operator = new TextOperation();
    ops.forEach((op) => {
      if (operator.isRetain(op)) {
        operator.retain(op as number);
      } else if (operator.isInsert(op)) {
        operator.insert(op as string);
      } else if (operator.isDelete(op)) {
        operator.delete(op as number);
      } else {
        throw new Error("Invalid JSON operation");
      }
    });
    return operator;
  }

  getSimpleOp(operation: TextOperation) {
    const ops = operation.ops;
    switch (ops.length) {
      case 1:
        return ops[0];
        break;
      case 2:
        return operation.isRetain(ops[0])
          ? ops[1]
          : operation.isRetain(ops[1])
          ? ops[0]
          : 0;
        break;
      case 3:
        if (operation.isRetain(ops[0]) && operation.isRetain(ops[2])) {
          return ops[1];
        }
        break;
    }

    return 0;
  }

  invert(text: string) {
    let strIndex = 0;
    const inverse = new TextOperation();
    var ops = this.ops;
    for (var i = 0, l = ops.length; i < l; i++) {
      var op = ops[i];
      if (this.isRetain(op)) {
        inverse.retain(op as number);
        strIndex += op as number;
      } else if (this.isInsert(op)) {
        inverse.delete((op as string).length);
      } else {
        // delete op
        inverse.insert(text.slice(strIndex, strIndex - (op as number)));
        strIndex -= op as number;
      }
    }
    return inverse;
  }

  apply(text: string) {
    if (text.length !== this.baseLength) {
      throw new Error(
        "The operation's base length must be equal to the string's length."
      );
    }
    const newStr = [];
    let j = 0;
    let textIndex = 0;
    for (let i = 0; i < this.ops.length; i++) {
      const op = this.ops[i];
      if (this.isRetain(op)) {
        if (textIndex + (op as number) > text.length) {
          throw new Error(
            "Operation can't retain more characters than are left in the string."
          );
        }
        newStr[j++] = text.slice(textIndex, textIndex + (op as number));
        textIndex += op as number;
      } else if (this.isInsert(op)) {
        newStr[j++] = op;
      } else {
        textIndex -= op as number;
      }
    }

    if (textIndex !== text.length) {
      throw new Error("The operation didn't operate on the whole string.");
    }

    return newStr.join('');
  }

  shouldBeComposedWith(operation: TextOperation) {
    if (this.isNoop() || operation.isNoop()) {
      return true;
    }

    const simpleA = this.getSimpleOp(this);
    const simpleB = this.getSimpleOp(operation);

    if (!simpleA || !simpleB) {
      return false;
    }

    const startA = this.getStartIndex(this);
    const startB = this.getStartIndex(operation);

    if (this.isInsert(simpleA) && this.isInsert(simpleB)) {
      return startA + (simpleA as string).length === startB;
    }

    if (this.isDelete(simpleA) && this.isDelete(simpleB)) {
      return startB - (simpleB as number) === startA || startA === startB;
    }

    return false;
  }
}
