import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const BCRYPT_SALT_ROUNDS = 12;

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
};

function jwtConfig() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "JWT configuration is unavailable");
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  };
}

export async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: { name, email, passwordHash },
      select: safeUserSelect,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(409, "Email is already registered");
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }

  const { secret, expiresIn } = jwtConfig();
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}
