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

  fromJSON(ops: TOpsItem[]) {
    const operator = new TextOperation();
    this.ops.forEach((op) => {
      if (this.isRetain(op)) {
        operator.retain(op as number);
      }
    });
  }
}
