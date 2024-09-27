import createForm from "..";

const onSubmitMock = () => {};

describe("FinalForm.registerField", () => {
  it("should fix up field that is created by mutators", () => {
    const form = createForm({
      onSubmit: onSubmitMock,
      initialValues: {
        foo: "bar",
      },
    });
    const spy = jest.fn();
    form.registerField("foo", spy, { value: true });
    expect(typeof spy.mock.calls[0][0].blur).toBe("function");
    // expect(typeof spy.mock.calls[0][0].focus).toBe("function");
    // expect(typeof spy.mock.calls[0][0].change).toBe("function");
  });
});

describe("FinalForm.creation", () => {
  it("should create a form with no initial values", () => {
    const form = createForm({ onSubmit: onSubmitMock });
    expect(form.getState().initialValues).toBeFalsy();
    expect(form.getState().values).toEqual({});
  });

  it("should create a form with initial values", () => {
    const initialValues = {
      foo: "bar",
      cat: 42,
    };
    const form = createForm({ onSubmit: onSubmitMock, initialValues });
    expect(form.getState().initialValues).not.toBe(initialValues);
    expect(form.getState().initialValues).toEqual(initialValues);
    expect(form.getState().values).not.toBe(initialValues);
    expect(form.getState().values).toEqual(initialValues);
  });
});
