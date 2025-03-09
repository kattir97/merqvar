import { createCookieSessionStorage } from "react-router";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "dc_session",
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secrets: process.env.SESSION_SECRET.split(',')
  }
});

