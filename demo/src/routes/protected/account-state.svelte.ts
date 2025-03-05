let token = $state(localStorage.getItem("token"));

export const client = {
  get loggedIn() {
    return token !== null;
  },
  set loggedIn(value: boolean) {
    token = value ? "true" : null;
    console.log("token", token);
    if (value) {
      localStorage.setItem("token", "true");
    } else {
      localStorage.removeItem("token");
    }
  }
};
