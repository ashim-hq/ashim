import type { Permission, Role } from "@ashim/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { type AuthUser, getAuthUser } from "./plugins/auth.js";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "tools:use",
    "files:own",
    "files:all",
    "apikeys:own",
    "apikeys:all",
    "pipelines:own",
    "pipelines:all",
    "settings:read",
    "settings:write",
    "users:manage",
    "teams:manage",
    "branding:manage",
    "features:manage",
    "system:health",
    "audit:read",
  ],
  editor: [
    "tools:use",
    "files:own",
    "files:all",
    "apikeys:own",
    "pipelines:own",
    "pipelines:all",
    "settings:read",
  ],
  user: ["tools:use", "files:own", "apikeys:own", "pipelines:own", "settings:read"],
};

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissions(role).includes(permission);
}

export function hasEffectivePermission(user: AuthUser, permission: Permission): boolean {
  if (!hasPermission(user.role as Role, permission)) return false;
  if (user.apiKeyPermissions) {
    return user.apiKeyPermissions.includes(permission);
  }
  return true;
}

export function requirePermission(permission: Permission) {
  return (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthUser(request);
    if (!user) {
      reply.status(401).send({ error: "Authentication required", code: "AUTH_REQUIRED" });
      return null;
    }
    if (!hasEffectivePermission(user, permission)) {
      reply.status(403).send({ error: "Insufficient permissions", code: "FORBIDDEN" });
      return null;
    }
    return user;
  };
}

export function requireOwnershipOrPermission(
  request: FastifyRequest,
  reply: FastifyReply,
  resourceUserId: string | null,
  allPermission: Permission,
) {
  const user = getAuthUser(request);
  if (!user) {
    reply.status(401).send({ error: "Authentication required", code: "AUTH_REQUIRED" });
    return null;
  }
  if (resourceUserId !== user.id && !hasEffectivePermission(user, allPermission)) {
    return null;
  }
  return user;
}
