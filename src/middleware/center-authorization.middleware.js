import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

export async function resolveActiveCenter(req, res, next) {
  try {
    const center = await prisma.diagnosticCenter.findFirst({
      where: { slug: req.params.slug, isActive: true },
    });

    if (!center) {
      throw new AppError(404, "Center not found");
    }

    req.center = center;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireCenterRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async function authorizeCenterRole(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError(401, "Unauthorized");
      }

      const center = await prisma.diagnosticCenter.findUnique({
        where: { slug: req.params.slug },
      });
      if (!center) {
        throw new AppError(404, "Center not found");
      }

      const membership = await prisma.centerMembership.findUnique({
        where: {
          userId_centerId: {
            userId: req.user.id,
            centerId: center.id,
          },
        },
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        throw new AppError(403, "Forbidden");
      }

      req.center = center;
      req.centerMembership = membership;
      req.centerRole = membership.role;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
