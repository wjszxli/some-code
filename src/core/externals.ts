import { FormPath, isEmpty, isValid } from "@formily/shared";
import { createFormInternals } from "./internals";
import {
  IField,
  IFieldRegistryProps,
  IFieldState,
  IFormState,
  IVirtualField,
  IVirtualFieldRegistryProps,
  LifeCycleTypes,
} from "./type";
import { VirtualField } from "./models/virtual-field";
import { Field } from "./models/field";

export const createFormExternals = (
  internals: ReturnType<typeof createFormInternals>
) => {
  const {
    form,
    init,
    getDataPath,
    heart,
    graph,
    getFormValuesIn,
    getFormInitialValuesIn,
  } = internals;

  function getFormState(callback?: (state?: IFormState) => any) {
    return form.getState(callback);
  }

  function pickNotEmpty(v1: any, v2: any) {
    if (!isEmpty(v1)) return v1;
    if (!isEmpty(v2)) return v2;
    if (isValid(v1)) return v1;
    if (isValid(v2)) return v2;
  }

  function registerField({
    path,
    name,
    value,
    initialValue,
    required,
    rules,
    editable,
    visible,
    display,
    computeState,
    dataType,
    props,
  }: IFieldRegistryProps<FormilyCore.FieldProps>) {
    let field: IField;
    const nodePath = FormPath.parse(path || name);
    const dataPath = getDataPath(nodePath);

    const createField = () => {
      const field = new Field({
        nodePath,
        dataPath,
        computeState,
        dataType,
      });

      heart.publish(LifeCycleTypes.ON_FIELD_WILL_INIT, field);
      graph.appendNode(field, nodePath, dataPath);

      // @ts-ignore
      field.batch((state: IFieldState<FormilyCore.FieldProps>) => {
        const formValue = getFormValuesIn(state?.name);
        const formInitialValue = getFormInitialValuesIn(state?.name);
        const syncValue = pickNotEmpty(value, formValue);
        const syncInitialValue = pickNotEmpty(initialValue, formInitialValue);

        if (isValid(syncInitialValue)) {
          console.log("state", state);
          if (state) {
            state.initialValue = syncInitialValue;
          }
        }

        // if (isValid(syncValue)) {
        //   state.value = syncValue;
        // } else {
        //   if (isValid(state.initialValue)) {
        //     state.value = state.initialValue;
        //   }
        // }
      });
      return field;
    };

    if (graph.exist(nodePath)) {
      field = graph.get(nodePath);
    } else {
      field = createField();
    }

    return field;
  }

  function registerVirtualField({
    name,
    path,
    display,
    visible,
    computeState,
    props,
  }: IVirtualFieldRegistryProps<FormilyCore.VirtualFieldProps>) {
    const nodePath = FormPath.parse(path || name);
    const dataPath = getDataPath(nodePath);

    const createField = () => {
      const field = new VirtualField({
        nodePath,
        dataPath,
        computeState,
      });

      heart.publish(LifeCycleTypes.ON_FIELD_WILL_INIT, field);

      return field;
    };

    const field: IVirtualField = createField();

    return field;
  }

  function getFormGraph() {
    return graph.map((node) => {
      return node.getState();
    });
  }

  const fromApi = {
    getFormState,
    registerVirtualField,
    getFormGraph,
    registerField,
  };

  init(fromApi);

  return fromApi;
};
