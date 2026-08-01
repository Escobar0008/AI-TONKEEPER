import { prisma } from "@/lib/prisma";

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createVerificationCode(
  email: string,
  purpose: string
) {
  const code = generateVerificationCode();

  await prisma.verificationCode.deleteMany({
    where: {
      email,
      purpose,
    },
  });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      purpose,
      expiresAt,
    },
  });

  return code;
}

export async function verifyCode(
  email: string,
  code: string,
  purpose: string
) {
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      purpose,
    },
  });

  if (!record) return false;

  if (record.expiresAt < new Date()) {
    await prisma.verificationCode.delete({
      where: {
        id: record.id,
      },
    });

    return false;
  }

  await prisma.verificationCode.delete({
    where: {
      id: record.id,
    },
  });

  return true;
}