let working = $state(false);

export const workerClient = {
  get working() {
    return working;
  },
  set working(value: boolean) {
    working = value;
  }
};
