import { createForm } from "..";

const testValues = { aa: 111, bb: 222 };

describe("createForm", () => {
  test("values", () => {
    const form = createForm({
      values: testValues,
    });
    expect(form.getFormState((state) => state?.values)).toEqual(testValues);
    expect(form.getFormState((state) => state?.initialized)).toEqual(true);
    expect(form.getFormGraph()).toMatchSnapshot();
  });

  test("initialValues on init", () => {
    const form = createForm({
      initialValues: testValues
    })
    const aa = form.registerField({ path: 'aa' })
    const bb = form.registerField({ path: 'bb' })

    expect(form.getFormState(state => state?.values)).toEqual(testValues)
    expect(form.getFormState(state => state?.initialValues)).toEqual(testValues)
    expect(form.getFormState(state => state?.initialized)).toEqual(true)
    expect(aa.getState(state => state?.value)).toEqual(testValues.aa)
    expect(bb.getState(state => state?.value)).toEqual(testValues.bb)
    expect(form.getFormGraph()).toMatchSnapshot()

  });
});
