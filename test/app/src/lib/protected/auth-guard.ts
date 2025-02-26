import { goto, type Route } from "@mateothegreat/svelte5-router";

export const authGuard = async (route: Route): Promise<boolean> => {
  console.log("authGuard (pre hook) fired for route:", route);
  console.log("...simulated some login/auth check...");
  // Crude example of checking if the user is logged in. A more
  // sophisticated example would use a real authentication system
  // and a server-side API.
  if (!localStorage.getItem("token")) {
    console.warn("redirecting to denied");
    goto("/protected/denied");
    return false;
  } else {
    console.log("resolved with bankaccount");
    // goto("/protected/bankaccount");
    return true;
  }
}