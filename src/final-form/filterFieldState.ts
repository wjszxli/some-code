import { fieldSubscriptionItems } from "./constants";
import subscriptionFilter from "./subscriptionFilter";
import { FieldState, FieldSubscription } from "./type";

const shallowEqualKeys = ["data"];

const filterFieldState = (
  state: FieldState,
  subscription: FieldSubscription,
  force: boolean,
  previousState?: FieldState
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
      previousState,
      subscription,
      fieldSubscriptionItems,
      shallowEqualKeys
    ) || !previousState;
  return different || force ? result : undefined;
};

export default filterFieldState;
