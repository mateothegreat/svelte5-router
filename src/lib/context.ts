import { getContext, setContext } from "svelte";
import type { Instance } from "./instance";

export class Routers {
  [key: string]: Instance;
}

export const ROUTER_KEY = Symbol();

export const createContext = (instance: Instance): Routers => {
  const ctx = new Routers();
  ctx[instance.base] = instance;
  setContext(ROUTER_KEY, ctx);
  return ctx;
};

export const useContext = (): Routers => {
  const ctx = getContext<Routers>(ROUTER_KEY);
  return ctx;
};
