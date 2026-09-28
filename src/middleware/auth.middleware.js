import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
};

export async function authenticate(req, res, next) {
  try {
    const authorization = req.get("authorization");
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new AppError(401, "Unauthorized");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(500, "JWT configuration is unavailable");
    }

    const payload = jwt.verify(match[1], secret);
    if (!payload || typeof payload !== "object" || typeof payload.userId !== "string") {
      throw new AppError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: safeUserSelect,
    });
    if (!user) {
      throw new AppError(401, "Unauthorized");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(401, "Unauthorized"));
  }
}
