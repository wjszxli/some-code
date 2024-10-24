import { fieldSubscriptionItems } from "./constants";
import subscriptionFilter from "./subscriptionFilter";
import { FieldState, StateFilter } from "./type";

const shallowEqualKeys = ["data"];

const filterFieldState: StateFilter<FieldState> = (
  state,
  subscription,
  force,
  previousState
) => {
  const result: FieldState = {
    blur: state.blur,
    change: state.change,
    focus: state.focus,
    name: state.name,
  };

  const different =
    subscriptionFilter(
      result,
      state,
      subscription,
      fieldSubscriptionItems,
      shallowEqualKeys,
      previousState
    ) || !previousState;
  return different || force ? result : undefined;
};

export default filterFieldState;
