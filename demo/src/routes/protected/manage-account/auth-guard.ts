import { goto, type Route } from "@mateothegreat/svelte5-router";

export const authGuard = async (route?: Route): Promise<boolean> => {
  console.log("simulating some login/auth check...");
  // Crude example of checking if the user is logged in. A more
  // sophisticated example would use a real authentication system
  // and a server-side API.
  if (!localStorage.getItem("token")) {
    console.warn("redirecting to denied");
    goto("/protected/denied");
    return false;
  }
  console.log("user is logged in, continuing to route", route);
  // If the user is logged in, return true so that the router can
  // continue it's navigation to the requested route.
  return true;
};
