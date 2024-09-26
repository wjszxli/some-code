import {
  IFormCreatorOptions,
  isVirtualField,
  LifeCycleTypes,
  env,
  IFormState,
} from "./type";
import { Form } from "./models/form";
import { FormHeart } from "./shared/lifecycle";
import {
  clone,
  defaults,
  FormPath,
  FormPathPattern,
  isFn,
  isValid,
} from "@formily/shared";
import { FormGraph } from "./shared/FormGraph";
import { FormValidator } from "@formily/validator";

export const createFormInternals = (options: IFormCreatorOptions = {}) => {
  const form = new Form();

  const env: env = {
    validateTimer: null,
    unmountTimer: null,
    syncFormStateTimer: null,
    onChangeTimer: null,
    graphChangeTimer: null,
    hostRendering: false,
    publishing: {},
    taskQueue: [],
    uploading: false,
    taskIndexes: {},
    realRemoveTags: [],
    lastShownStates: {},
    clearStatesPatterns: {},
    unmountRemoveNode: false,
    submittingTask: undefined,
  };

  const heart = new FormHeart({
    ...options,
    beforeNotify: (payload) => {
      env.publishing[payload.path || ""] = true;
    },
    afterNotify: (payload) => {
      env.publishing[payload.path || ""] = false;
    },
  });

  function matchStrategy(
    pattern: FormPathPattern,
    nodePath: FormPathPattern
  ): boolean {
    const matchPattern = FormPath.parse(pattern);
    const node = graph.get(nodePath);
    if (!node) return false;
    return node.getSourceState((state: any) =>
      matchPattern.matchAliasGroup(state.name, state.path)
    );
  }

  function getFormIn(path: FormPathPattern, key?: string) {
    // @ts-ignore
    return form.getState((state) =>
      // @ts-ignore
      FormPath.getIn(state[key], getDataPath(path))
    );
  }

  function getFormValuesIn(path: FormPathPattern) {
    return getFormIn(path, "values");
  }

  function notifyFormValuesChange() {
    if (isFn(options.onChange) && form.state.mounted && !form.state.unmounted) {
      // @ts-ignore
      clearTimeout(env.onChangeTimer);
      env.onChangeTimer = setTimeout(() => {
        if (form.state.unmounted) return;
        // @ts-ignore
        options.onChange(clone(getFormValuesIn("")));
      });
    }
    heart.publish(LifeCycleTypes.ON_FORM_VALUES_CHANGE, form);
  }

  function notifyFormInitialValuesChange() {
    heart.publish(LifeCycleTypes.ON_FORM_INITIAL_VALUES_CHANGE, form);
  }

  function onFormChange(published: IFormState) {
    const { dirtys } = form;

    if (dirtys.values) {
      notifyFormValuesChange();
    }
    if (dirtys.initialValues) {
      if (!env.uploading) {
        form.setState((state) => {
          // @ts-ignore
          state.values = defaults(published.initialValues, published.values);
        });
      }
      notifyFormInitialValuesChange();
    }
    if (dirtys.unmounted && published.unmounted) {
      heart.publish(LifeCycleTypes.ON_FORM_UNMOUNT, form);
    }
    if (dirtys.mounted && published.mounted) {
      heart.publish(LifeCycleTypes.ON_FORM_MOUNT, form);
    }
    if (dirtys.initialized) {
      heart.publish(LifeCycleTypes.ON_FORM_INIT, form);
    }
    heart.publish(LifeCycleTypes.ON_FORM_CHANGE, form);
    if (env.hostRendering) {
      // @ts-ignore
      env.hostRendering =
        dirtys.values || dirtys.initialValues || dirtys.editable;
    }
    return env.hostRendering;
  }

  // @ts-ignore
  function onGraphChange({ type, payload }) {
    heart.publish(LifeCycleTypes.ON_FORM_GRAPH_CHANGE, graph);
    if (type === "GRAPH_NODE_WILL_UNMOUNT") {
      validator.unregister(payload.path.toString());
    }
  }

  const graph = new FormGraph({
    matchStrategy,
  });

  const validator = new FormValidator({
    ...options,
    matchStrategy,
  });

  function getDataPath(path: FormPathPattern) {
    const newPath = FormPath.getPath(path);
    return newPath.reduce((path, key, index: number) => {
      if (index >= newPath.length - 1) return path.concat([key]);
      const realPath = newPath.slice(0, index + 1);
      const dataPath = path.concat([key]);
      const selected = graph.get(realPath);

      if (isVirtualField(selected)) {
        return path;
      }

      return dataPath;
    }, FormPath.getPath(""));
  }

  function init<T>(actions: T) {
    heart.publish(LifeCycleTypes.ON_FORM_WILL_INIT, form, actions);
    graph.appendNode(form);
    // @ts-ignore
    form.setState((state: IFormState) => {
      state.initialized = true;
      if (isValid(options.initialValues)) {
        state.initialValues = clone(options.initialValues);
      }
      if (isValid(options.values)) {
        state.values = clone(options.values);
      }
      if (!isValid(state.values)) {
        state.values = state.initialValues;
      }
      if (isValid(options.editable)) {
        // @ts-ignore
        state.editable = options.editable;
      }
    });
  }

  form.subscription = {
    notify: onFormChange,
  };
  graph.subscribe(onGraphChange);

  function getFormInitialValuesIn(path: FormPathPattern) {
    return getFormIn(path, "initialValues");
  }

  return {
    init,
    form,
    getDataPath,
    heart,
    graph,
    getFormValuesIn,
    getFormInitialValuesIn,
  };
};
