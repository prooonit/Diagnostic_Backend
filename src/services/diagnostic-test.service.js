import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const testSelect = {
  id: true,
  centerId: true,
  name: true,
  description: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export function createDiagnosticTest(centerId, data) {
  return prisma.diagnosticTest.create({
    data: { ...data, centerId },
    select: testSelect,
  });
}

export async function listActiveDiagnosticTests(centerId, { search, skip, take }) {
  const trimmedSearch = typeof search === "string" ? search.trim() : "";
  const where = {
    centerId,
    isActive: true,
    ...(trimmedSearch && {
      name: { contains: trimmedSearch, mode: "insensitive" },
    }),
  };

  const [tests, total] = await prisma.$transaction([
    prisma.diagnosticTest.findMany({
      where,
      select: testSelect,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.diagnosticTest.count({ where }),
  ]);

  return { tests, total };
}

export async function getActiveDiagnosticTest(centerId, testId) {
  const test = await prisma.diagnosticTest.findFirst({
    where: { id: testId, centerId, isActive: true },
    select: testSelect,
  });

  if (!test) {
    throw new AppError(404, "Diagnostic test not found");
  }

  return test;
}

async function getManagedDiagnosticTest(centerId, testId) {
  const test = await prisma.diagnosticTest.findFirst({
    where: { id: testId, centerId },
    select: { id: true },
  });

  if (!test) {
    throw new AppError(404, "Diagnostic test not found");
  }

  return test;
}

export async function updateDiagnosticTest(centerId, testId, data) {
  const test = await getManagedDiagnosticTest(centerId, testId);
  return prisma.diagnosticTest.update({
    where: { id: test.id },
    data,
    select: testSelect,
  });
}

export async function updateDiagnosticTestStatus(centerId, testId, isActive) {
  const test = await getManagedDiagnosticTest(centerId, testId);
  return prisma.diagnosticTest.update({
    where: { id: test.id },
    data: { isActive },
    select: testSelect,
  });
}
