import {
  defaults,
  FormPath,
  FormPathPattern,
  isEqual,
  isFn,
  Subscribable,
} from "@formily/shared";
import { IDirtyModelFactory, NormalRecord, StateDirtyMap } from "../type";
import { Draft, Immer, enableAllPlugins } from "immer";

enableAllPlugins();

type Recipe<State> = (state?: State) => any;

type ExtendsState = NormalRecord & { displayName?: string };

type Patch = {
  op: "replace" | "remove" | "add";
  path: (string | number)[];
  value?: any;
};

type ExtendsProps<State> = NormalRecord & {
  computeState?: (state: Draft<State>, prevState: State) => any;
  dirtyCheck?: (path: FormPathPattern, value: any, nextValue: any) => boolean;
};

const { produce } = new Immer({
  autoFreeze: false,
});

const applyPatches = (target: any, patches: Patch[]) => {
  patches.forEach(({ op, path, value }) => {
    if (op === "replace" || op === "add") {
      FormPath.setIn(target, path, value);
    } else if (op === "remove") {
      FormPath.deleteIn(target, path);
    }
  });
};

export const createModel = <
  State extends ExtendsState,
  Props extends ExtendsProps<State>
>(
  Factory: IDirtyModelFactory<State, Props>
) => {
  return class Model extends Subscribable {
    props: Props;
    displayName?: string;
    factory: InstanceType<IDirtyModelFactory<State, Props>>;
    cache: Map<any, any>;
    state: State;
    prevState: State;
    batching: boolean;
    dirtyStack: StateDirtyMap<State>[];
    dirtyCountStack: number[];
    patches: Patch[] = [];

    constructor(props: Props = {} as any) {
      super();
      this.props = defaults(Factory.defaultProps, props);
      this.displayName = Factory.displayName;
      this.factory = new Factory(this.props);
      this.cache = new Map();
      this.state = this.factory.state as any;
      this.state.displayName = this.displayName;
      this.prevState = this.state;
      this.batching = false;
      this.dirtyStack = [];
      this.dirtyCountStack = [];
    }

    getBaseState() {
      if (isFn(this.factory.getState)) {
        return this.factory.getState.call(this.factory, this.state);
      } else {
        return this.state;
      }
    }

    getState<T extends Recipe<State>>(
      recipe?: T
    ): T extends Recipe<State> ? ReturnType<T> : State {
      if (!isFn(recipe)) return this.getBaseState();
      return recipe(this.getBaseState());
    }

    getSourceState<T extends Recipe<State>>(
      recipe?: T
    ): T extends Recipe<State> ? ReturnType<T> : State {
      if (!isFn(recipe)) return this.state as any;
      return recipe(this.state);
    }

    get dirtys(): StateDirtyMap<State> {
      return this.dirtyStack[this.dirtyStack.length - 1] || {};
    }

    set dirtys(dirtys: StateDirtyMap<State>) {
      if (this.dirtyStack.length === 0) {
        this.dirtyStack.push({});
      }
      this.dirtyStack[this.dirtyStack.length - 1] = dirtys;
    }

    get dirtyCount() {
      return this.dirtyCountStack[this.dirtyCountStack.length - 1] || 0;
    }

    set dirtyCount(value) {
      if (this.dirtyCountStack.length === 0) {
        this.dirtyCountStack.push(0);
      }
      this.dirtyCountStack[this.dirtyCountStack.length - 1] = value;
    }

    getDirtysFromPatches(
      patches: Patch[],
      refresh?: boolean
    ): StateDirtyMap<State> {
      return patches.reduce(
        (buf: StateDirtyMap<State>, { path }) => {
          buf[path[0] as keyof StateDirtyMap<State>] = true;
          return buf;
        },
        refresh
          ? ({} as StateDirtyMap<State>)
          : this.batching
          ? this.dirtys
          : ({} as StateDirtyMap<State>)
      );
    }

    enterCalculateDirtys() {
      this.dirtyStack.push({});
      this.dirtyCountStack.push(0);
    }

    setSourceState(recipe?: Recipe<State>) {
      if (!isFn(recipe)) return this.state;
      recipe(this.state);
    }

    isDirty(key?: string) {
      if (key) {
        return this.dirtys[key];
      } else {
        return this.dirtyCount > 0;
      }
    }

    batch(callback?: () => void) {
      this.batching = true;
      this.enterCalculateDirtys();
      const prevState = this.state;
      if (isFn(callback)) {
        callback();
      }

      this.prevState = prevState;
      if (this.dirtyCount > 0) {
        this.notify(this.getState());
      }
      this.batching = false;
      this.existCalculateDirtys();
    }

    dirtyCheck(path: FormPathPattern, nextValue: any) {
      const currentValue = FormPath.getIn(this.state, path);
      if (isFn(this.factory.dirtyCheck)) {
        if (isFn(this.props.dirtyCheck)) {
          return (
            this.factory.dirtyCheck(path, currentValue, nextValue) &&
            this.props.dirtyCheck(path, currentValue, nextValue)
          );
        } else {
          return this.factory.dirtyCheck(path, currentValue, nextValue);
        }
      } else {
        if (isFn(this.props.dirtyCheck)) {
          return this.props.dirtyCheck(path, currentValue, nextValue);
        } else {
          return !isEqual(currentValue, nextValue);
        }
      }
    }

    existCalculateDirtys() {
      this.dirtyStack.pop();
      this.dirtyCountStack.pop();
    }

    setState(recipe?: Recipe<State>, silent: boolean = false) {
      if (!isFn(recipe)) return;
      const base = this.getBaseState();
      this.patches = [];
      this.prevState = base;
      this.factory.prevState = base;
      this.factory.state = base;
      this.factory?.beforeProduce?.();

      if (!this.batching) {
        this.enterCalculateDirtys();
      }

      produce(
        base,
        (draft) => {
          recipe(draft);
          if (isFn(this.props.computeState)) {
            this.props.computeState(draft, this.prevState);
          }
        },
        (patches) => {
          this.patches = this.patches.concat(patches);
        }
      );

      const produced = produce(
        base,
        (draft) => {
          applyPatches(draft, this.patches);
          const dirtys = this.getDirtysFromPatches(this.patches, true);
          if (isFn(this.factory.produce)) {
            this.factory.produce(draft, dirtys);
          }
        },
        (patches) => {
          patches.forEach((patch) => {
            const { path, value } = patch;
            if (this.dirtyCheck(path, value)) {
              this.patches.push(patch);
              this.dirtyCount++;
            }
          });
        }
      );

      this.factory.state = produced;
      this.state = produced;
      this.dirtys = this.getDirtysFromPatches(this.patches);
      this.patches = [];
      this.factory?.afterProduce?.();

      if (this.dirtyCount > 0 && !silent) {
        if (this.batching) {
          return;
        }
        this.notify(this.getState(), silent);
      }
      this.existCalculateDirtys();
    }
  };
};
