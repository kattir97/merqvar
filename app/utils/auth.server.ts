import { redirect } from "react-router";
import { sessionStorage } from "./session.server";
import { prisma } from "./db.server";
import { safeRedirect } from "remix-utils/safe-redirect"
import { combineResponseInits } from "./misc";

export async function logout(
  {
    request,
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit,
) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie'),
  )
  throw redirect(
    safeRedirect(redirectTo),
    combineResponseInits(responseInit, {
      headers: {
        'set-cookie': await sessionStorage.destroySession(cookieSession),
      },
    }),
  )
}



export async function getUserId(request: Request) {
  const cookieSession = await sessionStorage.getSession(request.headers.get('cookie'));

  const userId = cookieSession.get('userId')

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { id: userId }
  })

  if (!user) {
    return await logout({ request })
  }

  return user.id;



}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request)
  if (!userId) {
    const requestUrl = new URL(request.url)
    redirectTo =
      redirectTo === null
        ? null
        : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
    const loginRedirect = ['/login', loginParams?.toString()]

      .filter(Boolean)
      .join('?')
    throw redirect(loginRedirect)
  }
  return userId
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect('/')
  }
}


export async function requireAdmin(request: Request) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user || user.role !== 'ADMIN') {
    throw redirect('/');
  }

  return userId;
}

