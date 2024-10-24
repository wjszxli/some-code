export type Subscriber<V> = (value: V) => void;
export type Subscription = { [key: string]: boolean };
export type IsEqual = (a: any, b: any) => boolean;

export type DebugFunction<FormValues extends FormValuesShape> = (
  state: FormState<FormValues>,
  fieldStates: { [key: string]: FieldState }
) => void;

export type FormValuesShape = {
  [key: string]: any;
};

export type StateFilter<T> = (
  state: T,
  subscription: Subscription,
  force: boolean,
  previousState?: T
) => T | undefined;

export type FieldSubscription = {
  active?: boolean;
  data?: boolean;
  dirty?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: boolean;
  initial?: boolean;
  invalid?: boolean;
  length?: boolean;
  modified?: boolean;
  modifiedSinceLastSubmit?: boolean;
  pristine?: boolean;
  submitError?: boolean;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  value?: boolean;
  visited?: boolean;
};

export type FormApi = {
  batch: (fn: () => void) => void;
  blur: (name: string) => void;
  //   change: (name: string, value: ?any) => void;
  destroyOnUnregister: boolean;
  focus: (name: string) => void;
  initialize: (data: Object | ((values: Object) => Object)) => void;
  isValidationPaused: () => boolean;
  //   getFieldState: (field: string) => ?FieldState;
  getRegisteredFields: () => string[];
  // getState: () => FormState<FormValues>,
  // mutators: { [string]: (...args: any[]) => any },
  pauseValidation: () => void;
  // registerField: RegisterField,
  reset: (initialValues?: Object) => void;
  resetFieldState: (name: string) => void;
  restart: (initialValues?: Object) => void;
  resumeValidation: () => void;
  // setConfig: (name: ConfigKey, value: any) => void,
  // submit: () => ?Promise<?Object>,
  // subscribe: (
  //   subscriber: FormSubscriber<FormValues>,
  //   subscription: FormSubscription,
  // ) => Unsubscribe,
};

export type Config<FormValues extends FormValuesShape> = {
  debug?: DebugFunction<FormValues>;
  destroyOnUnregister?: boolean;
  initialValues?: FormValues;
  keepDirtyOnReinitialize?: boolean;
  //   mutators?: { [key: string]: Mutator<FormValues> };
  onSubmit: (
    values: FormValues,
    form: FormApi,
    callback?: (errors?: Object) => Object
  ) => Object | Promise<Object> | void;
  validate?: (values: Object) => Object | Promise<Object>;
  validateOnBlur?: boolean;
};

export type FieldValidator = (
  allValues: Object,
  value?: any,
  meta?: FieldState
) => any | Promise<any>;

export type FieldState = {
  active?: boolean;
  blur: () => void;
  change: (value: any) => void;
  data?: Object;
  dirty?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: any;
  focus: () => void;
  initial?: any;
  invalid?: boolean;
  length?: number;
  modified?: boolean;
  modifiedSinceLastSubmit?: boolean;
  name: string;
  pristine?: boolean;
  submitError?: any;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  value?: any;
  visited?: boolean;
};

export type InternalFieldState = {
  active: boolean;
  afterSubmit?: () => void;
  beforeSubmit?: () => void | false;
  blur: () => void;
  change: (value: any) => void;
  data: Object;
  focus: () => void;
  isEqual: IsEqual;
  lastFieldState?: FieldState;
  length?: any;
  modified: boolean;
  modifiedSinceLastSubmit: boolean;
  name: string;
  touched: boolean;
  validateFields?: string[];
  validators: {
    [key: number]: FieldValidator;
  };
  valid: boolean;
  validating: boolean;
  visited: boolean;
};

export type FieldConfig = {
  afterSubmit?: () => void;
  beforeSubmit?: () => void | false;
  data?: any;
  defaultValue?: any;
  getValidator?: FieldValidator;
  initialValue?: any;
  isEqual?: IsEqual;
  silent?: boolean;
  validateFields?: string[];
};

export type InternalFormState<FormValues extends FormValuesShape> = {
  active?: string;
  asyncErrors: Object;
  dirtySinceLastSubmit: boolean;
  modifiedSinceLastSubmit: boolean;
  error?: any;
  errors: Object;
  initialValues?: Object;
  lastSubmittedValues?: Object;
  pristine: boolean;
  resetWhileSubmitting: boolean;
  submitError?: any;
  submitErrors?: Object;
  submitFailed: boolean;
  submitSucceeded: boolean;
  submitting: boolean;
  valid: boolean;
  validating: number;
  values: FormValues;
};

export type FormValues = {
  [key: string]: any;
};

export type FormState<FormValues extends FormValuesShape> = {
  // 所有的值都可选的，因为必须被订阅
  active?: string;
  dirty?: boolean;
  dirtyFields?: { [key: string]: boolean };
  dirtyFieldsSinceLastSubmit?: { [key: string]: boolean };
  dirtySinceLastSubmit?: boolean;
  error?: any;
  errors?: Object;
  hasSubmitErrors?: boolean;
  hasValidationErrors?: boolean;
  initialValues?: FormValues;
  invalid?: boolean;
  modified?: { [key: string]: boolean };
  modifiedSinceLastSubmit?: boolean;
  pristine?: boolean;
  submitError?: any;
  submitErrors?: Object;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: { [key: string]: boolean };
  valid?: boolean;
  validating?: boolean;
  values?: FormValues;
  visited?: { [key: string]: boolean };
};
export type Subscribers<T extends Object> = {
  index: number;
  entries: {
    [key: number]: {
      subscriber: Subscriber<T>;
      notified: boolean;
      subscription: Subscription;
    };
  };
};

export type InternalState<FormValues extends FormValuesShape> = {
  subscribers: Subscribers<FormState<FormValues>>;
  lastFormState?: FormState<FormValues>;
  fieldSubscribers: {
    [key: string]: Subscribers<FieldState>;
  };
  fields: {
    [key: string]: InternalFieldState;
  };
  formState: InternalFormState<FormValues>;
};

export type FormSubscription = {
  active?: boolean;
  dirty?: boolean;
  dirtyFields?: boolean;
  dirtyFieldsSinceLastSubmit?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: boolean;
  errors?: boolean;
  hasSubmitErrors?: boolean;
  hasValidationErrors?: boolean;
  initialValues?: boolean;
  invalid?: boolean;
  modified?: boolean;
  modifiedSinceLastSubmit?: boolean;
  pristine?: boolean;
  submitError?: boolean;
  submitErrors?: boolean;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  values?: boolean;
  visited?: boolean;
};

export type Unsubscribe = () => void;

export type FormSubscriber<FormValues extends FormValuesShape> = Subscriber<
  FormState<FormValues>
>;

export type MutableState<FormValues extends FormValuesShape> = {
  fieldSubscribers: { [key: string]: Subscribers<FieldState> };
  fields: {
    [key: string]: InternalFieldState;
  };
  formState: InternalFormState<FormValues>;
  lastFormState?: FormState<FormValues>;
};

export type ChangeValue<FormValues extends FormValuesShape> = (
  state: MutableState<FormValues>,
  name: string,
  mutate: (value: any) => any
) => void;

export type SetIn = (
  state: Record<string, any> | Array<any>,
  key: string,
  value: any,
  destroyArrays?: boolean
) => Object;

export type FieldSubscriber = Subscriber<FieldState>;
