import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "dc_session",
    sameSite: 'lax',
    path: '/',
    httpOnly: 'true',
    // secure: process.env.NODE_ENV === 'production',
    secretes: process.env.SESSION_SECRET.split(',')
  }
});

