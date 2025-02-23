let loggedIn = $state(localStorage.getItem("token") !== null);

export const setLoggedIn = (value: boolean) => {
  loggedIn = value;
  localStorage.setItem("token", value ? "true" : null);
};

export const getLoggedIn = () => {
  return loggedIn;
};
