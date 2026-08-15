import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { currentPassword, newPassword } =
      await request.json();

    // Vérification des champs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ancien mot de passe et nouveau mot de passe requis.",
        },
        { status: 400 }
      );
    }

    // Vérification longueur
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    // Le nouveau mot de passe doit être différent
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le nouveau mot de passe doit être différent de l'ancien.",
        },
        { status: 400 }
      );
    }

    // Récupérer uniquement l'utilisateur de la session
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur introuvable.",
        },
        { status: 404 }
      );
    }

    // Vérifier l'ancien mot de passe
    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Ancien mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Enregistrer l'activité de sécurité
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGED",
        description:
          "Le mot de passe du compte a été modifié.",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès.",
    });
  } catch (error) {
    console.error(
      "CHANGE_PASSWORD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}