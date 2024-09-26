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

  it("test is noop", () => {
    const operator = new TextOperation();
    expect(true).toEqual(operator.isNoop());

    operator.retain(5);
    expect(true).toEqual(operator.isNoop());

    operator.retain(3);
    expect(true).toEqual(operator.isNoop());

    operator.insert("abc");
    expect(false).toEqual(operator.isNoop());
  });

  it("test to string", () => {
    const operator = new TextOperation();
    operator.retain(2);

    expect("").toEqual(operator.toString());

    operator.insert("lorem");
    operator.delete("ipsum");
    operator.retain(5);

    expect("retain(2), insert('lorem'), delete(5), retain(5)").toEqual(
      operator.toString()
    );
  });

  it("test random operation", () => {
    const text = randomString(50);
    const operator = randomOperation(text);
    expect(text.length).toEqual(operator.baseLength);
  });

  it("test is to json", () => {
    const text = randomString(50);
    const operator = randomOperation(text);
    expect(operator).toEqual(TextOperation.fromJSON(operator.toJson()));
  });

  it("test from json", () => {
    const ops = [2, -1, -1, "cde"];
    const operator = TextOperation.fromJSON(ops);
    expect(3).toEqual(operator.ops.length);
    expect(4).toEqual(operator.baseLength);
    expect(5).toEqual(operator.targetLength);
  });

  it("testShouldBeComposedWith", () => {
    const make = () => {
      return new TextOperation();
    };

    let operator1 = make().retain(3);
    let operator2 = make().retain(1).insert("tag").retain(2);

    expect(true).toEqual(operator1.shouldBeComposedWith(operator2));
    expect(true).toEqual(operator2.shouldBeComposedWith(operator1));

    operator1 = make().retain(1).insert("a").retain(2);
    operator2 = make().retain(2).insert("b").retain(2);
    let result = operator1.shouldBeComposedWith(operator2);
    expect(true).toEqual(result);
    operator1.delete(3);
    result = operator1.shouldBeComposedWith(operator2);
    expect(false).toEqual(result);

    operator1 = make().retain(1).insert("b").retain(2);
    operator2 = make().retain(1).insert("a").retain(3);
    result = operator1.shouldBeComposedWith(operator2);
    expect(false).toEqual(result);

    operator1 = make().retain(4).delete(3).retain(10);
    operator2 = make().retain(2).delete(2).retain(10);
    result = operator1.shouldBeComposedWith(operator2);
    expect(true).toEqual(result);

    operator1 = make().retain(4).delete(7).retain(3);
    result = operator1.shouldBeComposedWith(operator2);
    expect(true).toEqual(result);

    operator2 = make().retain(2).delete(9).retain(3);
    result = operator1.shouldBeComposedWith(operator2);
    expect(false).toEqual(result);
  });

  it("test should be composed with inverted", () => {
    const text = randomString(50);
    const operator1 = randomOperation(text);
    const operator1Inv = operator1.invert(text);
    const afterOperator1 = operator1Inv.apply(text);
    const operator2 = randomOperation(afterOperator1);
    const operator2Inv = operator2.invert(afterOperator1);
    // expect(operator1.shouldBeComposedWith(operator2Inv)).toEqual(operator2Inv.shouldBeComposedWithInverted(operator1Inv));
  });
});
