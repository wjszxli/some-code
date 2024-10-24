import filterFieldState from "./filterFieldState";
import filterFormState from "./filterFormState";
import memoize from "./memoize";
import publishFieldState from "./publishFieldState";
import shallowEqual from "./shallowEqual";
import getIn from "./structure/getIn";
import setIn from "./structure/setIn2";
import {
  ChangeValue,
  Config,
  FieldConfig,
  FieldState,
  FieldSubscriber,
  FieldSubscription,
  FormState,
  FormSubscriber,
  FormSubscription,
  FormValuesShape,
  InternalFormState,
  InternalState,
  StateFilter,
  Subscriber,
  Subscribers,
  Subscription,
  Unsubscribe,
} from "./type";

const tripleEquals = (a: any, b: any): boolean => a === b;

function notify<T extends Object>(
  { entries }: Subscribers<T>,
  state: T,
  lastState?: T,
  filter?: StateFilter<T>,
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
          force || !notified,
          lastState,
        )
      ) {
        entry.notified = true;
      }
    }
  });
}

function notifySubscriber<T extends Object>(
  subscriber: Subscriber<T>,
  subscription: Subscription,
  state: T,
  filter: StateFilter<T>,
  force: any,
  lastState?: T
): boolean {
  const notification = filter(state, subscription, force, lastState);
  if (notification) {
    subscriber(notification);
    return true;
  }
  return false;
}

function createForm<FormValues extends FormValuesShape>(
  config: Config<FormValues>
) {
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

  const state: InternalState<FormValues> = {
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
      values: initialValues ? { ...initialValues } : ({} as FormValues),
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

  function convertToExternalFormState<FormValues extends FormValuesShape>({
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
  }: InternalFormState<FormValues>) {
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

  /**
   * 用于计算和生成表单的下一个状态（nextFormState）
   * 通过比较当前的表单数据与上一次的提交状态以及初始状态，来更新表单的状态信息，如字段的脏（dirty）状态、修改状态、访问状态等
   * calculateNextFormState 函数的主要作用是计算表单的下一个状态，并确保在不必要时不进行更新。
   * 它通过比较当前的表单值、字段状态、上次提交值和初始值，更新脏字段、已修改字段、已访问字段等信息，从而确保表单状态始终保持最新且准确。
   * @returns
   */
  const calculateNextFormState = (): FormState<FormValues> => {
    const { fields, formState, lastFormState } = state;
    const safeFields = { ...fields };
    const safeFieldKeys = Object.keys(safeFields);
    //  用于标记是否存在脏字段
    let foundDirty = false;

    /**
     * 通过 reduce 函数，遍历每个字段，检查该字段的当前值（formState.values[key]）是否与其初始值（formState.initialValues[key]）不同。
     * isEqual 是一个比较函数，返回布尔值，表示字段是否发生变化
     */
    // @ts-ignore
    const dirtyFields = safeFieldKeys.reduce((result, key) => {
      const dirty = !safeFields[key].isEqual(
        getIn(formState.values, key),
        getIn(formState.initialValues || {}, key)
      );
      // 如果字段的值与初始值不相等，则该字段为“脏字段”（dirty），并将其添加到 dirtyFields 对象中
      if (dirty) {
        foundDirty = true;
        // @ts-ignore
        result[key] = dirty;
      }
      return result;
    }, {});

    /**
     * 计算自上次提交以来的脏字段，通过与 formState.lastSubmittedValues（上次提交时的表单值）进行比较，检查每个字段是否发生变化。如果发生变化，则该字段被标记为“脏字段”
     */
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
    // 如果存在脏字段（foundDirty 为 true），则表单不是“原始状态”（pristine = false），否则是“原始状态”（pristine = true）
    formState.pristine = !foundDirty;

    // 如果有字段在自上次提交以来发生了变化，则 dirtySinceLastSubmit 设置为 true，否则为 false
    formState.dirtySinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      Object.values(dirtyFieldsSinceLastSubmit).some((value) => value)
    );

    // 如果任何字段的 modifiedSinceLastSubmit 为 true，则表单被视为自上次提交以来已经修改过
    formState.modifiedSinceLastSubmit = !!(
      formState.lastSubmittedValues &&
      Object.keys(safeFields).some(
        (value) => safeFields[value].modifiedSinceLastSubmit
      )
    );

    // 将表单状态转换为外部形式
    const nextFormState = convertToExternalFormState(formState);
    // 更新字段的 modified、touched 和 visited 状态
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
    // 下面使用 shallowEqual 比较上一次表单状态与当前计算的状态，如果相同，则使用上一次状态，否则更新为当前状态
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
    // 比较 lastFormState 和 nextFormState。如果两者相等，则返回 lastFormState，否则返回更新后的 nextFormState
    return lastFormState && shallowEqual(lastFormState, nextFormState)
      ? lastFormState
      : (nextFormState as FormState<FormValues>);
  };

  // 通知表单字段的监听器（fieldListeners），以便在表单状态发生变化时，相关字段能够得到通知和更新
  const notifyFieldListeners = (name?: string) => {
    if (inBatch) {
      // 不应立即通知监听器（要等到批处理完成后再通知）
      return;
    }
    // fields: 存储表单中各个字段的状态
    // fieldSubscribers: 存储各字段的订阅者（监听器），即监听特定字段状态变化的回调函数
    // formState: 整个表单的状态
    const { fields, fieldSubscribers, formState } = state;
    // safeFields 是一个对 fields 对象的浅拷贝，目的是避免直接修改 fields，以确保原始对象的安全性（防止副作用）
    const safeFields = { ...fields };
    // 通知单个字段的监听器
    const notifyField = (name: string) => {
      const field = safeFields[name];
      // 根据当前的 formState 和特定字段 field 生成一个最新的 fieldState，即该字段的当前状态。包含字段的值、错误、验证状态等信息。
      const fieldState = publishFieldState(formState, field);
      const { lastFieldState } = field;
      // 将当前字段状态更新为新的 fieldState，并将其保存到 lastFieldState 中，以便下次对比
      field.lastFieldState = fieldState;
      // 获取字段的订阅者（监听器）
      const fieldSubscriber = fieldSubscribers[name];
      if (fieldSubscriber) {
        // 通知订阅者
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
            lastFormState,
            // @ts-ignore
            filterFormState
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

  const changeValue: ChangeValue<FormValues> = (
    state,
    name: string,
    mutate: any
  ) => {
    const before = getIn(state.formState.values, name);
    const after = mutate(before);
    state.formState.values = setIn(
      state.formState.values,
      name,
      after
    ) as FormValues;
  };

  const api = {
    blur: (name: string) => {
      const { fields, formState } = state;
      const previous = fields[name];
    },
    getState: () => calculateNextFormState(),
    change: (name: string, value?: any) => {
      const { fields, formState } = state;
      if (getIn(formState.values, name) !== value) {
        changeValue(state, name, () => value);
        const previous = fields[name];
        if (previous) {
          fields[name] = {
            ...previous,
            modified: true,
            modifiedSinceLastSubmit: !!formState.lastSubmittedValues,
          };
        }
        // if (validateOnBlur) {
        notifyFieldListeners();
        notifyFormListeners();
        // } else {
        // runValidation(name, () => {
        //   notifyFieldListeners();
        //   notifyFormListeners();
        // });
        // }
      }
    },
    registerField: (
      name: string,
      subscriber: FieldSubscriber,
      subscription: FieldSubscription,
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
      field.change = field.change || ((value) => api.change(name, value));
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
      if (fieldConfig) {
        const noValueInFormState =
          getIn(state.formState.values, name) === undefined;
        if (
          fieldConfig.initialValue !== undefined &&
          (noValueInFormState ||
            getIn(state.formState.values, name) ===
              // @ts-ignore
              getIn(state.formState.initialValues, name))
        ) {
          state.formState.initialValues = setIn(
            state.formState.initialValues || {},
            name,
            fieldConfig.initialValue
          );

          state.formState.values = setIn(
            state.formState.values,
            name,
            fieldConfig.initialValue
          ) as FormValues;
        }

        if (
          fieldConfig.defaultValue !== undefined &&
          fieldConfig.initialValue === undefined &&
          getIn(state.formState.values, name) === undefined &&
          noValueInFormState
        ) {
          state.formState.values = setIn(
            state.formState.values,
            name,
            fieldConfig.defaultValue
          ) as FormValues;
        }
      }
      let haveValidator = false;
      if (haveValidator) {
        // runValidation(undefined, notify);
      } else {
        notify();
      }
      return () => {};
    },
    getFieldState: (name: string) => {
      const field = state.fields[name];
      return field && field.lastFieldState;
    },
    subscribe: (
      subscriber: FormSubscriber<FormValues>,
      subscription: FormSubscription
    ): Unsubscribe => {
      if (!subscriber) {
        throw new Error("No callback given.");
      }
      if (!subscription) {
        throw new Error(
          "No subscription provided. What values do you want to listen to?"
        );
      }

      const memoized = memoize(subscriber);
      const { subscribers } = state;
      const index = subscribers.index++;
      subscribers.entries[index] = {
        subscriber: memoized,
        subscription,
        notified: false,
      };
      const nextFormState = calculateNextFormState();
      notifySubscriber(
        memoized,
        subscription,
        nextFormState,
        // @ts-ignore
        filterFormState,
        true,
        nextFormState,
      );
      return () => {
        delete subscribers.entries[index];
      };
    },
  };

  return api;
}

export default createForm;
