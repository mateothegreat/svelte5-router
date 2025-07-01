import { expect, test } from "vitest";

import { urls } from "./urls";

test.only("parses with no query parameters", () => {
  expect(urls.parse("http://localhost:5173/#/foo/bar")).toEqual({
    protocol: "http",
    host: "localhost",
    port: "5173",
    path: "/#/foo/bar",
    hash: {
      hash: "/foo/bar",
      path: "/foo/bar",
      query: {
        original: "",
        params: {}
      },
    },
    query: {
      original: "",
      params: {}
    }
  });
});

test.only("parses key-value query parameters", () => {
  let result = urls.parse("http://localhost:5173/#/foo/bar?negative=-123&a=1&str=string&b=true");
  expect(result).toEqual({
    protocol: "http",
    host: "localhost",
    port: "5173",
    path: "/#/foo/bar",
    query: {
      params: {
        negative: -123,
        a: 1,
        str: "string",
        b: true,
      },
      original: "negative=-123&a=1&str=string&b=true",
    },
    hash: {
      path: "/foo/bar",
      query: {
        params: {
          negative: -123,
          a: 1,
          str: "string",
          b: true,
        },
        original: "negative=-123&a=1&str=string&b=true",
      },
      hash: "/foo/bar?negative=-123&a=1&str=string&b=true",
    },
  });
});

test.only("file url without query parameters", () => {
  let result = urls.parse("file:///C:/Users/user1/projects/app1/index.html#/foo/bar");
  expect(result).toEqual({
    protocol: "file",
    host: "/C:/Users/user1/projects/app1/index.html",
    port: "",
    path: "/#/foo/bar",
    query: {
      params: {
      },
      original: undefined,
    },
    hash: {
      path: "/foo/bar",
      query: {
        params: {
        },
        original: "",
      },
      hash: "/foo/bar",
    },
  });
});

test.only("file url with key-value query parameters", () => {
  let result = urls.parse("file:///C:/Users/user1/projects/app1/index.html#/foo/bar?negative=-123&a=1&str=string&b=true");
  expect(result).toEqual({
    protocol: "file",
    host: "/C:/Users/user1/projects/app1/index.html",
    port: "",
    path: "/#/foo/bar?negative=-123&a=1&str=string&b=true",
    query: {
      params: {
        negative: -123,
        a: 1,
        str: "string",
        b: true,
      },
      original: "negative=-123&a=1&str=string&b=true",
    },
    hash: {
      path: "/foo/bar",
      query: {
        params: {
          negative: -123,
          a: 1,
          str: "string",
          b: true,
        },
        original: "negative=-123&a=1&str=string&b=true",
      },
      hash: "/foo/bar?negative=-123&a=1&str=string&b=true",
    },
  });
});

// test.only("parses array parameter parsing", () => {
//   expect(urls.parse("http://localhost:5173/#/foo/bar?a[3]=3&a[19]=1.9&a[0]=first&a[99]=9.99&a[5]=false")).toEqual({
//     protocol: "http",
//     host: "localhost",
//     port: "5173",
//     path: "/foo/bar",
//     query: {
//       params: {
//         a: ["first", 3, false, 1.9, 9.99]
//       }
//     },
//     hash: "/foo/bar?a[3]=3&a[19]=1.9&a[0]=first&a[99]=9.99&a[5]=false"
//   });
// });

// test.only("query is undefined", () => {
//   expect(urls.parse("http://localhost:5173/foo/bar").query.toString()).toEqual("");
// });

// test.only("query.toString() matches location.search", () => {
//   expect(urls.parse("http://localhost:5173/foo/bar?a=1&b=2").query.toString()).toEqual("a=1&b=2");
//   expect(urls.parse("http://localhost:5173/#/foo/bar?a=1&b=2").query.toString()).toEqual("a=1&b=2");
// });

// test.only("query.toString() matches multiples (pagination=2,23&company=123)", () => {
//   expect(urls.parse("http://localhost:5173/foo/bar?pagination=2,23&company=123").query.toString()).toEqual(
//     "pagination=2,23&company=123"
//   );
//   expect(urls.parse("http://localhost:5173/#/foo/bar?pagination=2,23&company=123").query.toString()).toEqual(
//     "pagination=2,23&company=123"
//   );
// });
