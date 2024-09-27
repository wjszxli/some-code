export type Subscriber = (value: any) => void;
export type Subscription = { [key: string]: boolean };
export type IsEqual = (a: any, b: any) => boolean;

export type DebugFunction = (
  state: FormState,
  fieldStates: { [key: string]: FieldState }
) => void;

export type StateFilter = (
  state: FormState,
  subscription: Subscription,
  force: boolean,
  previousState?: FormState
) => FormState;

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

export type Config = {
  debug?: DebugFunction;
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

export type InternalFormState = {
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

export type FormState = {
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
export type Subscribers = {
  index: number;
  entries: {
    [key: number]: {
      subscriber: Subscriber;
      notified: boolean;
      subscription: Subscription;
    };
  };
};

export interface InternalState {
  subscribers: Subscribers;
  fieldSubscribers: {
    [key: string]: Subscribers;
  };
  fields: {
    [key: string]: InternalFieldState;
  };
  lastFormState?: FormState;
  formState: InternalFormState;
}
