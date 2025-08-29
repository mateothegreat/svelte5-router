import { mount } from "svelte";

import "./app.css";
import App from "./app.svelte";

const app = mount(App, {
  target: document.getElementById("app")!
});
