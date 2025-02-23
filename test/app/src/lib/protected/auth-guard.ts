import type { Route } from "@mateothegreat/svelte5-router";

import BankAccount from "./bank-account.svelte";
import Denied from "./denied.svelte";

export const authGuard = async (route: Route): Promise<Route> => {
  console.log("authGuard (pre hook) fired for route:", route);
  return new Promise((resolve) => {
    console.log("...simulated some login/auth check...");
    // Crude example of checking if the user is logged in. A more
    // sophisticated example would use a real authentication system
    // and a server-side API.
    if (!localStorage.getItem("token")) {
      console.log("redirecting to denied");
      // By returning a new route, the user will be redirected to the
      // new route and then the post hook(s) will be executed:
      resolve({
        path: "/protected/denied",
        component: Denied
      });
    } else {
      setTimeout(() => {
        console.log("resolved with bankaccount");
        // By returning a new route, the user will be redirected to the
        // new route and then the post hook(s) will be executed:
        resolve({
          path: "/protected/bankaccount",
          component: BankAccount
        });
      });
    }
  });
}