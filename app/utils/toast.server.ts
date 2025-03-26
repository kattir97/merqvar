import { createCookieSessionStorage } from "react-router";

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "dc_toast",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: process.env.SESSION_SECRET.split(","),
  },
});
