import { redirect } from "@remix-run/node";
import { sessionStorage } from "./session.server";
import { prisma } from "./db.server";

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
    return logout(request)
  }

  return user.id;



}

export async function requireAnonymous(requst: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect('/')
  }
}