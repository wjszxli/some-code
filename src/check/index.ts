// @ts-nocheck

class Watcher {
  constructor(getter) {
    this.getter = getter;
    this.value = this.get();
  }

  get() {
    return this.getter();
  }

  update() {
    const newValue = this.get();
    if (newValue !== this.value) {
      console.log("View updated:", newValue);
      this.value = newValue;
    }
  }
}

class Reactive {
  constructor(data) {
    this.data = data;
    console.log("data", data);

    Object.keys(data).forEach((key) => {
      console.log("key", key);
      let value = data[key];
      const watchers = [];

      Object.defineProperty(this, key, {
        get() {
          if (currentWatcher) {
            watchers.push(currentWatcher);
          }
          return value;
        },
        set(newValue) {
          value = newValue;
          console.log('newValue', newValue)
          watchers.forEach((watcher) => watcher.update());
        },
      });
    });
  }
}

let currentWatcher = null;
const data = new Reactive({ message: "Hello, Vue.js!" });
const watcher = new Watcher(() => data.message);

data.message = "Hello, Vue with Dirty Checking!"; // 修改数据，触发更新
