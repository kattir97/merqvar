import { data, redirect } from "react-router";
import { requireUserId } from "./auth.server";
import { prisma } from "./db.server";
import { useUser } from "./user";
import { RoleName } from "@prisma/client";



export async function requireUserWithPermission(request: Request, permission: PermissionString) {
  const userId = await requireUserId(request);
  const permissionData = parsePermissionString(permission)

  const user = await prisma.user.findFirst({
    select: { id: true },
    where: {
      id: userId,
      roles: {
        some: {
          permissions: {
            some: {
              ...permissionData,
            }
          }
        }
      }
    }
  })

  if (!user) {
    throw data(
      {
        error: 'Unauthorized',
        requiredPermission: permissionData,
        message: `Unauthorized: required permissions: ${permission}`,
      },
      { status: 403 },
    )
  }
  return user.id

}



type Action = 'create' | 'read' | 'update' | 'delete'
type Entity = 'word'
// type Access = 'own' | 'any' | 'own,any' | 'any,own'
type PermissionString = `${Action}:${Entity}` | `${Action}:${Entity}`

function parsePermissionString(permissionString: PermissionString) {
  const [action, entity] = permissionString.split(':') as [
    Action,
    Entity,
  ]

  return {
    action,
    entity,
  }
}


export async function requireUserWithRole(request: Request, roles: RoleName[]) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findFirst({
    select: { id: true },
    where: { id: userId, roles: { some: { name: { in: roles } } } },
  })
  if (!user) {
    throw redirect('/')
    throw data(
      {
        error: 'Unauthorized',
        requiredRole: roles,
        message: `Unauthorized: required role: ${roles}`,
      },
      { status: 403 },
    )
  }
  return user.id
}



export function userHasPermission(
  user: Pick<ReturnType<typeof useUser>, 'roles'> | null,
  permission: PermissionString,
) {
  if (!user) return false
  const { action, entity } = parsePermissionString(permission)
  return user.roles.some(role =>
    role.permissions.some(
      permission =>
        permission.entity === entity &&
        permission.action === action
    ),
  )
}

export function userHasRoles(
  user: Pick<ReturnType<typeof useUser>, 'roles'> | null,
  roles: RoleName[],
) {
  if (!user) return false
  return roles.some(role => user.roles.some(r => r.name === role))
}