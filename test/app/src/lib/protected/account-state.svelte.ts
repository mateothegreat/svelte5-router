let loggedIn = $state(localStorage.getItem("token") !== null);

export const setLoggedIn = (value: boolean) => {
  loggedIn = value;
  if (value) {
    localStorage.setItem("token", "true");
  } else {
    localStorage.removeItem("token");
  }
};

export const getLoggedIn = () => {
  return loggedIn;
};

setLoggedIn(localStorage.getItem("token") !== null);