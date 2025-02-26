import { goto, type Route } from "@mateothegreat/svelte5-router";

export const authGuard = async (route: Route): Promise<boolean> => {
  console.log("simulating some login/auth check...");
  // Crude example of checking if the user is logged in. A more
  // sophisticated example would use a real authentication system
  // and a server-side API.
  if (!localStorage.getItem("token")) {
    console.warn("redirecting to denied");
    goto("/protected/denied");
    return false;
  }
  return true;
}