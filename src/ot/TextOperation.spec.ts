import { TextOperation } from "./TextOperation";
import { randomOperation, randomString } from "./utils";

describe("TextOperation", () => {
  it("should increase baseLength and targetLength by n when n is positive", () => {
    const operation = new TextOperation();
    expect(operation.baseLength).toBe(0);
    expect(operation.targetLength).toBe(0);

    const n = 5;

    operation.retain(n);

    expect(operation.baseLength).toBe(n);
    expect(operation.targetLength).toBe(n);

    operation.insert("abc");

    expect(operation.baseLength).toBe(n);
    expect(operation.targetLength).toBe(n + 3);

    const retainStep = 2;
    operation.retain(retainStep);
    expect(operation.baseLength).toBe(n + retainStep);
    expect(operation.targetLength).toBe(n + 3 + retainStep);

    operation.delete(2);

    expect(operation.baseLength).toBe(n + retainStep + 2);
    expect(operation.targetLength).toBe(n + 3 + retainStep);
  });

  it("should TextOperation is chaining operator", () => {
    const operation = new TextOperation();

    const retainStep = 5;
    const insertText = "def";

    operation
      .retain(retainStep)
      .retain(0)
      .insert("lorem")
      .insert("")
      .delete("abc")
      .delete(3)
      .delete(0)
      .delete("");

    expect(operation.ops.length).toBe(3);
  });

  it("test empty ops", () => {
    const operator = new TextOperation();
    operator.retain(0);
    operator.insert("");
    operator.delete("");

    expect(0).toEqual(operator.baseLength);
  });

  it("test two operations if equals", () => {
    const operation1 = new TextOperation()
      .delete(1)
      .insert("lo")
      .retain(2)
      .retain(3);

    const operation2 = new TextOperation()
      .delete(-1)
      .insert("l")
      .insert("o")
      .retain(5);

    expect(operation1).toEqual(operation2);

    operation1.delete(1);
    operation2.retain(1);
    expect(operation1).not.toEqual(operation2);
  });

  it("test ops merge", () => {
    const last = (arr: any) => {
      return arr[arr.length - 1];
    };

    const operation = new TextOperation();

    expect(0).toEqual(operation.baseLength);
    operation.retain(2);

    expect(1).toEqual(operation.ops.length);
    expect(2).toEqual(last(operation.ops));

    operation.retain(3);

    expect(1).toEqual(operation.ops.length);
    expect(5).toEqual(last(operation.ops));

    const text1 = "abc";
    operation.insert(text1);
    expect(2).toEqual(operation.ops.length);
    expect(text1).toEqual(last(operation.ops));

    const text2 = "def";
    operation.insert(text2);
    expect(2).toEqual(operation.ops.length);
    expect(text1 + text2).toEqual(last(operation.ops));

    const text3 = "d";
    operation.delete(text3);
    expect(3).toEqual(operation.ops.length);
    expect(-1).toEqual(last(operation.ops));

    operation.delete(text3);
    expect(3).toEqual(operation.ops.length);
    expect(-2).toEqual(last(operation.ops));
  });
});
