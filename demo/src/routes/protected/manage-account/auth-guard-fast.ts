import { goto, type RouteResult } from "@mateothegreat/svelte5-router";

export const authGuardFast = async (route?: RouteResult): Promise<boolean> => {
  console.log(
    `🔍 route.hooks["pre"] has been triggered for %c${route?.route.absolute()}`,
    "color: #F9A710; font-weight: bold;"
  );

  // Crude example of checking if the user is logged in. A more
  // sophisticated example would use a real authentication system
  // and a server-side API.
  console.log("🚧 %cdoing some work here...", "color: #2196f3; font-weight: bold; font-style: italic;");

  if (!localStorage.getItem("token")) {
    console.log("%c❌ redirecting to denied", "color: #f44336; font-weight: bold; font-size: 1.1em;");
    goto("/protected/login");
    return false;
  }

  // If the user is logged in, return true so that the router can
  // continue it's navigation to the requested route.
  console.log(
    `%c✅ allowed to continue to %c${route?.absolute()}`,
    "color: #53FF4D; font-weight: bold;",
    "color: #F9A710; font-weight: bold;"
  );
  console.log("%c✅ returning true", "background: #4caf50; color: white; padding: 2px 5px; border-radius: 3px;");

  return true;
};
