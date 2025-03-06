let _state: {
  mode: "hash" | "path";
} = $state({
  mode: (localStorage.getItem("mode") as "hash" | "path") || "path"
});

export const session = {
  set mode(value: "hash" | "path") {
    localStorage.setItem("mode", value);
    _state = {
      ..._state,
      mode: value
    };
    if (value === "hash") {
      window.history.pushState({}, "", `/#/`);
    } else {
      window.history.pushState({}, "", "/");
    }
  },
  get mode() {
    return _state.mode;
  }
};
