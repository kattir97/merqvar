import { createCookie } from "react-router";
import { CSRF } from "remix-utils/csrf/server";

const cookie = createCookie("csrf", {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: process.env.SESSION_SECRET.split(","),
});

export const csrf = new CSRF({ cookie });
