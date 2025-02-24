
import { Instance } from './instance.svelte';

const instance1 = new Instance({
  basePath: "",
  routes: [
    {
      path: "/1a",
      component: "1a",
    },
    {
      path: "/1b",
      component: "1b",
    },
  ],
});

const instance2 = new Instance({
  basePath: "/foo",
  routes: [
    {
      path: "/2a",
      component: "2a",
    },
    {
      path: "/2b",
      component: "2b",
    },
  ],
});

// describe("Instance.routes", () => {
//   it("should navigate", async () => {
//     expect(await instance1.get("/1a").path).toEqual(instance1.routes[0].path);
//     expect(await instance2.get("/2a").path).toEqual(instance2.routes[0].path);
//     expect(await instance1.get("/1b").path).toEqual(instance1.routes[1].path);
//     expect(await instance2.get("/foo/2b").path).toEqual(instance2.routes[1].path);
//   });
// });
