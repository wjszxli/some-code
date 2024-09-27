import publishFieldState from "../publishFieldState";

const check = (error?: any, initial?: any, value?: any, submitError?: any) => {
  const active = {};
  const blur = {};
  const change = {};
  const data = {};
  const focus = {};
  const name = "foo";
  const submitFailed = {};
  const submitSucceeded = {};
  const submitting = {};

  const result = publishFieldState(
    // @ts-ignore
    {
      initialValues: {
        foo: initial,
      },
      errors: {
        foo: error,
      },
      submitErrors: {
        foo: submitError,
      },
      // @ts-ignore
      submitFailed,
      // @ts-ignore
      submitSucceeded,
      // @ts-ignore
      submitting,
      values: {
        foo: value,
      },
    },
    {
      active,
      blur,
      change,
      data,
      focus,
      initial,
      isEqual: (a, b) => a === b,
      name,
      value,
    }
  );

  expect(result.active).toBe(active);
  expect(result.blur).toBe(blur);
  expect(result.change).toBe(change);
  expect(result.data).toBe(data);
  expect(result.focus).toBe(focus);
  expect(result.name).toBe(name);
  expect(result.error).toBe(error);
  expect(result.initial).toBe(initial);
  expect(result.value).toBe(value);
  expect(result.dirty).toBe(initial !== value);
  expect(result.pristine).toBe(initial === value);
  expect(result.submitError).toBe(submitError);
  expect(result.submitFailed).toBe(submitFailed);
  expect(result.submitSucceeded).toBe(submitSucceeded);
  expect(result.submitting).toBe(submitting);
  expect(result.valid).toBe(!error && !submitError);
  expect(result.invalid).toBe(!!(error || submitError));
};

describe("publishFieldState", () => {
  it("should show valid when no error", () => {
    check(undefined, undefined, undefined);
  });
});
