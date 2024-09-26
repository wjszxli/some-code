import produce from "immer";

const state = {
  user: {
    name: "Alice",
    age: 30,
  },
};

const newState = produce(state, (draft) => {
  draft.user.name = "Bob";
});

console.log('newState', newState)
