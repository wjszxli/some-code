import subscriptionFilter from "./subscriptionFilter";
import { formSubscriptionItems } from "./constants";
import { FormState, FormSubscription, FormValuesShape } from "./type";

const shallowEqualKeys = ["touched", "visited"];

export default function filterFormState<FormValues extends FormValuesShape>(
  state: FormState<FormValues>,
  previousState: FormState<FormValues>,
  subscription: FormSubscription,
  force: boolean
): FormState<FormValues> | null | undefined {
  const result: FormState<FormValues> = {} as FormState<FormValues>;

  const different =
    subscriptionFilter(
      result,
      state,
      subscription,
      formSubscriptionItems,
      shallowEqualKeys,
      previousState,
    ) || !previousState;

  return different || force ? result : undefined;
}
