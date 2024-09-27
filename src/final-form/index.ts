import filterFieldState from "./filterFieldState";
import memoize from "./memoize";
import publishFieldState from "./publishFieldState";
import shallowEqual from "./shallowEqual";
import getIn from "./structure/getIn";
import {
  Config,
  FieldConfig,
  FieldState,
  FormState,
  InternalFormState,
  InternalState,
  StateFilter,
  Subscriber,
  Subscribers,
  Subscription,
} from "./type";

const tripleEquals = (a: any, b: any): boolean => a === b;

function notify(
  { entries }: Subscribers,
  state: FormState | FieldState,
  lastState?: FormState | FieldState,
  filter?: StateFilter,
  force?: boolean
) {
  Object.keys(entries).forEach((key) => {
    const entry = entries[Number(key)];
    if (entry) {
      const { subscription, subscriber, notified } = entry;
      if (
        notifySubscriber(
          subscriber,
          subscription,
          state,
          // @ts-ignore
          filter,
          lastState,
          force || !notified
        )
      ) {
        entry.notified = true;
      }
    }
  });
}

function notifySubscriber(
  subscriber: Subscriber,
  subscription: Subscription,
  state: any,
  filter: StateFilter,
  force: any,
  lastState?: any
): boolean {
  const notification = filter(state, subscription, force, lastState);
  if (notification) {
    subscriber(notification);
    return true;
  }
  return false;
}

function createForm(config: Config) {
  if (!config) {
    throw new Error("No config specified");
  }

  let {
    debug,
    destroyOnUnregister,
    keepDirtyOnReinitialize,
    initialValues,
    // mutators,
    onSubmit,
    validate,
    validateOnBlur,
  } = config;

  const state: InternalState = {
    subscribers: { index: 0, entries: {} },
    fieldSubscribers: {},
    fields: {},
    lastFormState: undefined,
    formState: {
      asyncErrors: {},
      dirtySinceLastSubmit: false,
      modifiedSinceLastSubmit: false,
      errors: {},
      initialValues: initialValues && { ...initialValues },
      // invalid: false,
      pristine: true,
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      resetWhileSubmitting: false,
      valid: true,
      validating: 0,
      values: initialValues ? { ...initialValues } : {},
    },
  };
  let inBatch = 0;
  let validationPaused = false;
  let preventNotificationWhileValidationPaused = false;

  const hasAnyError = (errors: Object): boolean => {
    return Object.keys(errors).some((key) => {
      // @ts-ignore
      const value = errors[key];

      if (value && typeof value === "object" && !(value instanceof Error)) {
        return hasAnyError(value);
      }

      return typeof value !== "undefined";
    });
  };

  function convertToExternalFormState({
    // 保证类型安全
    active,
    dirtySinceLastSubmit,
    modifiedSinceLastSubmit,
    error,
    errors,
    initialValues,
    pristine,
    submitting,
    submitFailed,
    submitSucceeded,
    submitError,
    submitErrors,
    valid,
    validating,
    values,
  }: InternalFormState) {
    return {
      active,
      dirty: !pristine,
      dirtySinceLastSubmit,
      modifiedSinceLastSubmit,
      error,
      errors,
      hasSubmitErrors: !!(
        submitError ||
        (submitErrors && hasAnyError(submitErrors))
      ),
      hasValidationErrors: !!(error || hasAnyError(errors)),
      invalid: !valid,
      initialValues,
      pristine,
      submitting,
      submitFailed,
      submitSucceeded,
      submitError,
      submitErrors,
      valid,
      validating: validating > 0,
      values,
    };
  }

  const calculateNextFormState = () => {
    const { fields, formState, lastFormState } = state;
    const safeFields = { ...fields };
    const safeFieldKeys = Object.keys(safeFields);
    let foundDirty = false;

    // @ts-ignore
    const dirtyFields = safeFieldKeys.reduce((result, key) => {
      const dirty = !safeFields[key].isEqual(
        getIn(formState.values, key),
        getIn(formState.initialValues || {}, key)
      );
      if (dirty) {
        foundDirty = true;
        // @ts-ignore
        result[key] = dirty;
      }
      return result;
    }, {});

    const dirtyFieldsSinceLastSubmit = safeFieldKeys.reduce((result, key) => {
      // istanbul ignore next
      const nonNullLastSubmittedValues = formState.lastSubmittedValues || {};
      if (
        !safeFields[key].isEqual(
          getIn(formState.values, key),
          getIn(nonNullLastSubmittedValues, key)
        )
      ) {
        // @ts-ignore
        result[key] = true;
      }
      return result;
    }, {});
    formState.pristine = !foundDirty;

    formState.dirtySinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      Object.values(dirtyFieldsSinceLastSubmit).some((value) => value)
    );

    formState.modifiedSinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      Object.keys(safeFields).some(
        (value) => safeFields[value].modifiedSinceLastSubmit
      )
    );
    const nextFormState = convertToExternalFormState(formState);
    const { modified, touched, visited } = safeFieldKeys.reduce(
      (result, key) => {
        // @ts-ignore
        result.modified[key] = safeFields[key].modified;
        // @ts-ignore
        result.touched[key] = safeFields[key].touched;
        // @ts-ignore
        result.visited[key] = safeFields[key].visited;
        return result;
      },
      { modified: {}, touched: {}, visited: {} }
    );
    // @ts-ignore
    nextFormState.dirtyFields =
      lastFormState && shallowEqual(lastFormState.dirtyFields, dirtyFields)
        ? lastFormState.dirtyFields
        : dirtyFields;
    // @ts-ignore
    nextFormState.dirtyFieldsSinceLastSubmit =
      lastFormState &&
      shallowEqual(
        lastFormState.dirtyFieldsSinceLastSubmit,
        dirtyFieldsSinceLastSubmit
      )
        ? lastFormState.dirtyFieldsSinceLastSubmit
        : dirtyFieldsSinceLastSubmit;
    // @ts-ignore
    nextFormState.modified =
      lastFormState && shallowEqual(lastFormState.modified, modified)
        ? lastFormState.modified
        : modified;
    // @ts-ignore
    nextFormState.touched =
      lastFormState && shallowEqual(lastFormState.touched, touched)
        ? lastFormState.touched
        : touched;
    // @ts-ignore
    nextFormState.visited =
      lastFormState && shallowEqual(lastFormState.visited, visited)
        ? lastFormState.visited
        : visited;
    return lastFormState && shallowEqual(lastFormState, nextFormState)
      ? lastFormState
      : nextFormState;
  };

  const notifyFieldListeners = (name?: string) => {
    if (inBatch) {
      return;
    }
    const { fields, fieldSubscribers, formState } = state;
    const safeFields = { ...fields };
    const notifyField = (name: string) => {
      const field = safeFields[name];
      const fieldState = publishFieldState(formState, field);
      const { lastFieldState } = field;
      field.lastFieldState = fieldState;
      const fieldSubscriber = fieldSubscribers[name];
      if (fieldSubscriber) {
        notify(
          fieldSubscriber,
          fieldState,
          lastFieldState,
          // @ts-ignore
          filterFieldState,
          lastFieldState === undefined
        );
      }
    };

    if (name) {
      notifyField(name);
    } else {
      Object.keys(safeFields).forEach(notifyField);
    }
  };

  let notifying = false;
  let scheduleNotification = false;
  const notifyFormListeners = () => {
    if (notifying) {
      scheduleNotification = true;
    } else {
      notifying = true;
      if (
        !inBatch &&
        !(validationPaused && preventNotificationWhileValidationPaused)
      ) {
        const { lastFormState } = state;
        const nextFormState = calculateNextFormState();
        if (nextFormState !== lastFormState) {
          state.lastFormState = nextFormState;
          notify(
            state.subscribers,
            nextFormState,
            lastFormState
            // filterFormState
          );
        }
      }
    }
    notifying = false;
    if (scheduleNotification) {
      scheduleNotification = false;
      notifyFormListeners();
    }
  };

  const api = {
    blur: (name: string) => {
      const { fields, formState } = state;
      const previous = fields[name];
    },
    getState: () => calculateNextFormState(),
    registerField: (
      name: string,
      subscriber: Subscriber,
      subscription: Subscription,
      fieldConfig?: FieldConfig
    ) => {
      // 初始化字段订阅
      if (!state.fieldSubscribers[name]) {
        state.fieldSubscribers[name] = { index: 0, entries: {} };
      }
      // 获取当前字段下标
      const index = state.fieldSubscribers[name].index++;
      // 保存字段订阅的回调
      state.fieldSubscribers[name].entries[index] = {
        subscriber: memoize(subscriber),
        subscription,
        notified: false,
      };

      // 如果字段不存在，则进行初始化
      const field = state.fields[name] || {
        active: false,
        afterSubmit: fieldConfig && fieldConfig.afterSubmit,
        beforeSubmit: fieldConfig && fieldConfig.beforeSubmit,
        data: (fieldConfig && fieldConfig.data) || {},
        isEqual: (fieldConfig && fieldConfig.isEqual) || tripleEquals,
        lastFieldState: undefined,
        modified: false,
        modifiedSinceLastSubmit: false,
        name,
        touched: false,
        valid: true,
        validateFields: fieldConfig && fieldConfig.validateFields,
        validators: {},
        validating: false,
        visited: false,
      };
      field.blur = field.blur || (() => api.blur(name));
      field.change = field.change;
      field.focus = field.focus;
      state.fields[name] = field;
      const silent = fieldConfig && fieldConfig.silent;
      const notify = () => {
        if (silent && state.fields[name]) {
          // notifyFieldListeners(name);
        } else {
          notifyFormListeners();
          notifyFieldListeners();
        }
      };
      let haveValidator = false;
      if (haveValidator) {
        // runValidation(undefined, notify);
      } else {
        notify();
      }
      return () => {};
    },
  };

  return api;
}

export default createForm;
