import { FormPath, FormPathPattern, isFn } from "@formily/shared";
import { ValidateNodeResult, ValidatePatternRules } from "@formily/validator";
import { VirtualField } from "./models/virtual-field";
import { Field } from "./models/field";
import { Draft } from "immer";
import { FormLifeCycle } from "./shared/lifecycle";

export enum LifeCycleTypes {
  /**
   * Form LifeCycle
   **/

  ON_FORM_WILL_INIT = "onFormWillInit",
  ON_FORM_INIT = "onFormInit",
  ON_FORM_CHANGE = "onFormChange", //ChangeType精准控制响应
  ON_FORM_MOUNT = "onFormMount",
  ON_FORM_UNMOUNT = "onFormUnmount",
  ON_FORM_SUBMIT = "onFormSubmit",
  ON_FORM_RESET = "onFormReset",
  ON_FORM_SUBMIT_START = "onFormSubmitStart",
  ON_FORM_SUBMIT_END = "onFormSubmitEnd",
  ON_FORM_SUBMIT_VALIDATE_START = "onFormSubmitValidateStart",
  ON_FORM_SUBMIT_VALIDATE_SUCCESS = "onFormSubmitValidateSuccess",
  ON_FORM_SUBMIT_VALIDATE_FAILED = "onFormSubmitValidateFailed",
  ON_FORM_ON_SUBMIT_SUCCESS = "onFormOnSubmitSuccess",
  ON_FORM_ON_SUBMIT_FAILED = "onFormOnSubmitFailed",
  ON_FORM_VALUES_CHANGE = "onFormValuesChange",
  ON_FORM_INITIAL_VALUES_CHANGE = "onFormInitialValuesChange",
  ON_FORM_VALIDATE_START = "onFormValidateStart",
  ON_FORM_VALIDATE_END = "onFormValidateEnd",
  ON_FORM_INPUT_CHANGE = "onFormInputChange",
  ON_FORM_HOST_RENDER = "onFormHostRender",
  /**
   * FormGraph LifeCycle
   **/
  ON_FORM_GRAPH_CHANGE = "onFormGraphChange",

  /**
   * Field LifeCycle
   **/

  ON_FIELD_WILL_INIT = "onFieldWillInit",
  ON_FIELD_INIT = "onFieldInit",
  ON_FIELD_CHANGE = "onFieldChange",
  ON_FIELD_INPUT_CHANGE = "onFieldInputChange",
  ON_FIELD_VALUE_CHANGE = "onFieldValueChange",
  ON_FIELD_INITIAL_VALUE_CHANGE = "onFieldInitialValueChange",
  ON_FIELD_VALIDATE_START = "onFieldValidateStart",
  ON_FIELD_VALIDATE_END = "onFieldValidateEnd",
  ON_FIELD_MOUNT = "onFieldMount",
  ON_FIELD_UNMOUNT = "onFieldUnmount",
}

export type IFormValidateResult = ValidateNodeResult;

export interface IFormCreatorOptions {
  initialValues?: {};
  values?: {};
  lifecycles?: FormLifeCycle[];
  editable?: boolean | ((name: string) => boolean);
  validateFirst?: boolean;
  onChange?: (values: IFormState["values"]) => void;
  onSubmit?: (values: IFormState["values"]) => any | Promise<any>;
  onReset?: () => void;
  onValidateFailed?: (validated: IFormValidateResult) => void;
}

export type NormalRecord = { [key: string]: any };

export type StateDirtyMap<P> = {
  [key in keyof P]?: boolean;
};

export type FormLifeCyclePayload<T> = (
  params: {
    type: string;
    payload: T;
  },
  context: any
) => void;

export interface IModelSpec<
  State extends NormalRecord,
  Props extends NormalRecord
> {
  state?: Partial<State>;
  props?: Props;
  prevState?: Partial<State>;
  getState?: (state?: State) => any;
  beforeProduce?: () => void;
  afterProduce?: () => void;
  dirtyCheck?: (path: FormPathPattern, value: any, nextValue: any) => boolean;
  produce?: (draft: Draft<State>, dirtys: StateDirtyMap<State>) => void;
}

export interface IDirtyModelFactory<
  State extends NormalRecord,
  Props extends NormalRecord
> {
  new (props: Props): IModelSpec<Partial<State>, Props>;
  defaultProps?: Props;
  displayName?: string;
}

export interface IFormState<FormProps = any> {
  valid: boolean;
  invalid: boolean;
  loading: boolean;
  validating: boolean;
  modified: boolean;
  submitting: boolean;
  initialized: boolean;
  editable: boolean | ((name: string) => boolean);
  errors: Array<{
    path: string;
    messages: string[];
  }>;
  warnings: Array<{
    path: string;
    messages: string[];
  }>;
  values: any;
  initialValues: any;
  mounted: boolean;
  unmounted: boolean;
  props: FormProps;
  [key: string]: any;
}

export type IFormStateProps = {};

export type FormLifeCycleHandler<T> = (payload: T, context: any) => void;

export interface FormGraphNodeRef {
  parent?: FormGraphNodeRef;
  path: FormPath;
  dataPath?: FormPath;
  children: FormPath[];
}

export interface IVirtualFieldState<
  FieldProps = FormilyCore.VirtualFieldProps
> {
  name: string;
  path: string;
  displayName?: string;
  initialized: boolean;
  visible: boolean;
  display: boolean;
  mounted: boolean;
  unmounted: boolean;
  props: FieldProps;
  [key: string]: any;
}

export interface IVirtualFieldRegistryProps<FieldProps = any> {
  name?: FormPathPattern;
  path?: FormPathPattern;
  display?: boolean;
  visible?: boolean;
  computeState?: (
    draft: IVirtualFieldState,
    prevState: IVirtualFieldState
  ) => void;
  props?: FieldProps;
}

export interface IFieldState<FieldProps = any> {
  displayName: string;
  dataType: string;
  name: string;
  path: string;
  initialized: boolean;
  pristine: boolean;
  valid: boolean;
  touched: boolean;
  invalid: boolean;
  visible: boolean;
  display: boolean;
  editable: boolean;
  selfEditable: boolean;
  formEditable: boolean | ((name: string) => boolean);
  loading: boolean;
  modified: boolean;
  inputed: boolean;
  active: boolean;
  visited: boolean;
  validating: boolean;
  values: any[];
  errors: string[];
  effectErrors: string[];
  ruleErrors: string[];
  warnings: string[];
  effectWarnings: string[];
  ruleWarnings: string[];
  value: any;
  visibleCacheValue: any;
  initialValue: any;
  rules: ValidatePatternRules[];
  required: boolean;
  mounted: boolean;
  unmounted: boolean;
  unmountRemoveValue: boolean;
  props: FieldProps;
  [key: string]: any;
}

export type VirtualFieldStateDirtyMap = StateDirtyMap<IFieldState>;

export type FormGraphProps = {
  matchStrategy?: (
    pattern: FormPathPattern,
    nodePath: FormPathPattern
  ) => boolean;
};

export interface IVirtualFieldStateProps {
  dataPath?: FormPathPattern;
  nodePath?: FormPathPattern;
  computeState?: (
    draft: IVirtualFieldState,
    prevState: IVirtualFieldState
  ) => void;
}

export type IVirtualField = InstanceType<typeof VirtualField>;

export const isVirtualField = (target: any): target is IVirtualField =>
  target &&
  target.displayName === "VirtualFieldState" &&
  isFn(target.getState) &&
  isFn(target.setState);

export interface IFormState<FormProps = any> {
  valid: boolean;
  invalid: boolean;
  loading: boolean;
  validating: boolean;
  modified: boolean;
  submitting: boolean;
  initialized: boolean;
  editable: boolean | ((name: string) => boolean);
  errors: Array<{
    path: string;
    messages: string[];
  }>;
  warnings: Array<{
    path: string;
    messages: string[];
  }>;
  values: any;
  initialValues: any;
  mounted: boolean;
  unmounted: boolean;
  props: FormProps;
}

export interface IFieldRegistryProps<FieldProps = FormilyCore.FieldProps> {
  path?: FormPathPattern
  name?: FormPathPattern
  value?: any
  values?: any[]
  initialValue?: any
  props?: FieldProps
  rules?: ValidatePatternRules[] | ValidatePatternRules
  required?: boolean
  editable?: boolean
  unmountRemoveValue?: boolean
  visible?: boolean
  display?: boolean
  dataType?: string
  computeState?: (draft: IFieldState, prevState: IFieldState) => void
}

export type env = {
  validateTimer: NodeJS.Timer | null;
  unmountTimer: NodeJS.Timer | null;
  syncFormStateTimer: NodeJS.Timer | null;
  onChangeTimer: NodeJS.Timer | null;
  graphChangeTimer: NodeJS.Timer | null;
  hostRendering: boolean;
  publishing: Record<string, boolean>;
  taskQueue: any[];
  uploading: boolean;
  taskIndexes: Record<string, number>;
  realRemoveTags: string[];
  lastShownStates: Record<string, any>;
  clearStatesPatterns: any;
  unmountRemoveNode: boolean;
  submittingTask: any;
};

export type IField = InstanceType<typeof Field>;

export interface IFieldStateProps {
  nodePath?: FormPathPattern;
  dataPath?: FormPathPattern;
  dataType?: string;
  getEditable?: () => boolean | ((name: string) => boolean);
  getValue?: (name: FormPathPattern) => any;
  getInitialValue?: (name: FormPathPattern) => any;
  setValue?: (name: FormPathPattern, value: any) => void;
  removeValue?: (name: FormPathPattern) => void;
  setInitialValue?: (name: FormPathPattern, initialValue: any) => void;
  supportUnmountClearStates?: (path: FormPathPattern) => boolean;
  computeState?: (draft: IFieldState, prevState: IFieldState) => void;
  unControlledValueChanged?: () => void;
}

export type FormGraphMatcher<T> = (node: T, path: FormPath) => void | boolean;

export type FormGraphEacher<T> = (node: T, path: FormPath) => void;

export type FieldStateDirtyMap = StateDirtyMap<IFieldState>;
