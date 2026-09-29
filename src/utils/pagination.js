import { AppError } from "./app-error.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, name, defaultValue, maximum) {
  if (value === undefined) {
    return defaultValue;
  }

  if (Array.isArray(value) || typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new AppError(400, `${name} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AppError(400, `${name} must be a positive integer`);
  }

  if (maximum && parsed > maximum) {
    throw new AppError(400, `${name} must not exceed ${maximum}`);
  }

  return parsed;
}

export function parsePagination(query) {
  const page = parsePositiveInteger(query.page, "page", DEFAULT_PAGE);
  const limit = parsePositiveInteger(query.limit, "limit", DEFAULT_LIMIT, MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit };
}

export function getPaginationMetadata(page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
