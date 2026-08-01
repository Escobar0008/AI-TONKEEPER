import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    },
  });
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}

export async function validateUser(
  email: string,
  password: string
) {
  const user = await getUserByEmail(email);

  if (!user) return null;

  const valid = await verifyPassword(
    password,
    user.password
  );

  if (!valid) return null;

  return user;
}