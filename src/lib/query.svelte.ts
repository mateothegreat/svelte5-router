export class QueryString {
  params: Record<string, string> = $state();

  constructor() {
    this.params = Object.fromEntries(new URLSearchParams(window.location.search));
  }

  get<T>(key: string, defaultValue: T): T {
    return this.params[key] as T || defaultValue;
  }

  set(key: string, value: string) {
    this.params[key] = value;
  }

  delete(key: string) {
    delete this.params[key];
  }

  clear() {
    this.params = {};
  }

  toString() {
    return Object.entries(this.params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }
}
