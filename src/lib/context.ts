import { getContext, setContext } from "svelte";
import type { Instance } from "./instance";

export class State<T> {
  instance: Instance;
}

let last: Symbol;

export const createContext = (instance: Instance): State<any> => {
  const key = Symbol();
  const ctx = new State();
  ctx.instance = instance;
  setContext(key, ctx);
  last = key;
  return ctx;
};

export const useContext = <T>(): State<T> => {
  const ctx = getContext<State<T>>(last);
  return ctx;
};
