import { createCookieSessionStorage } from "@remix-run/node";

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "dc_toast",
    sameSite: 'lax',
    path: '/',
    httpOnly: 'true',
    // secure: process.env.NODE_ENV === 'production',
    secretes: process.env.SESSION_SECRET.split(',')
  }
});

