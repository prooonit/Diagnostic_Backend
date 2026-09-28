import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const publicCenterSelect = {
  id: true,
  name: true,
  slug: true,
  location: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function createCenter({ name, slug, location, userId }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const center = await tx.diagnosticCenter.create({
        data: { name, slug, location },
        select: publicCenterSelect,
      });

      const membership = await tx.centerMembership.create({
        data: {
          userId,
          centerId: center.id,
          role: "OWNER",
        },
        select: {
          id: true,
          centerId: true,
          userId: true,
          role: true,
          createdAt: true,
        },
      });

      return { center, membership };
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(409, "Slug is already in use");
    }
    throw error;
  }
}

export function listActiveCenters() {
  return prisma.diagnosticCenter.findMany({
    where: { isActive: true },
    select: publicCenterSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveCenterBySlug(slug) {
  const center = await prisma.diagnosticCenter.findFirst({
    where: { slug, isActive: true },
    select: publicCenterSelect,
  });

  if (!center) {
    throw new AppError(404, "Center not found");
  }

  return center;
}

export function updateCenter(centerId, data) {
  return prisma.diagnosticCenter.update({
    where: { id: centerId },
    data,
    select: publicCenterSelect,
  });
}

export function updateCenterStatus(centerId, isActive) {
  return prisma.diagnosticCenter.update({
    where: { id: centerId },
    data: { isActive },
    select: publicCenterSelect,
  });
}
