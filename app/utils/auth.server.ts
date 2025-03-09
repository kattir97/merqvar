import { redirect } from "react-router";
import { sessionStorage } from "./session.server";
import { prisma } from "./db.server";
import { safeRedirect } from "remix-utils/safe-redirect"
import { combineResponseInits } from "./misc";
import { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)



export const sessionKey = 'sessionId'


export async function getUserId(request: Request) {
  const cookieSession = await sessionStorage.getSession(request.headers.get('cookie'));

  const sessionId = cookieSession.get(sessionKey)

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    select: { userId: true },
    where: { id: sessionId }
  })

  if (!session) {
    return await logout({ request })
  }

  return session.userId;



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


export async function requireAdminOrModer(request: Request) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roles: {
        select: { name: true }
      }
    }
  })

  const isAdmin = user?.roles.some((role) => role.name === "admin" || role.name === 'moderator');

  if (!isAdmin) {
    throw redirect('/');
  }

  return userId;
}

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

  const sessionId = await cookieSession.get(sessionKey);
  void prisma.session.delete({ where: { id: sessionId } }).catch(() => { })
  throw redirect(
    safeRedirect(redirectTo),
    combineResponseInits(responseInit, {
      headers: {
        'set-cookie': await sessionStorage.destroySession(cookieSession),
      },
    }),
  )
}

export async function signup({
  email,
  username,
  password,
}: {
  email: User['email']
  username: User['username']
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          roles: { connect: { name: 'user' } },
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      },
    },
    select: { id: true, expirationDate: true },
  })

  return session
}



export async function login({
  email,
  password,
}: {
  email: User['email']
  password: string
}) {
  const user = await verifyUserPassword({ email }, password)
  if (!user) return null
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  })
  return session
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}


export async function verifyUserPassword(
  where: Pick<User, 'email'> | Pick<User, 'id'>,
  password: Password['hash'],
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  return { id: userWithPassword.id }
}