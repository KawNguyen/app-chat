import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, userName } = body;

    if (!email || !password || !userName) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 },
      );
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { userName: userName },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 },
      );
    }

    // Tạo user qua better-auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: userName,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      return NextResponse.json({ error: "Sign up failed" }, { status: 400 });
    }

    // Update username và displayName
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        userName: userName,
        displayName: userName,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign up" },
      { status: 500 },
    );
  }
}
