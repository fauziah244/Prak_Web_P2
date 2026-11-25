"use server";


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthState = {
   error?: string;
};

export async function registerAction(
   _prevState: AuthState | undefined,
   formData: FormData
): Promise<AuthState> {
   const name = String(formData.get("name") ?? "").trim();
   const email = String(formData.get("email") ?? "").trim().toLowerCase();
   const password = String(formData.get("password") ?? "");

   if (!name || !email || !password) {
       return { error: "Semua kolom wajib diisi" };
   }

   if (password.length < 6) {
       return { error: "Password minimal 6 karakter" };
   }

   const existingUser = await prisma.user.findUnique({ where: { email } });
   if (existingUser) {
       return { error: "Email sudah terdaftar!" };
   }

   const hashPassword = await bcrypt.hash(password, 10);
   await prisma.user.create({
       data: { nama: name, email, password: hashPassword },
   });

   redirect("/login");
}

export async function loginAction(
   _prevState: AuthState | undefined,
   formData: FormData
): Promise<AuthState> {
   const email = String(formData.get("email") ?? "").trim().toLowerCase();
   const password = String(formData.get("password") ?? "");


   if (!email || !password) {
       return { error: "Email dan password wajib diisi" };
   }


   const user = await prisma.user.findUnique({ where: { email } });
   if (!user) {
       return { error: "Email belum terdaftar di sistem" };
   }

   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
       return { error: "Password salah!" };
   }

   const sessionPayload = JSON.stringify({
       id: user.id,
       name: user.nama,
       email: user.email,
       role: user.role,
       loginAt: new Date().toISOString(),
   });

   const cookieStore = await cookies();
   cookieStore.set("praktikum_session", sessionPayload, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 86400,
       path: "/",
   });


   redirect("/dashboard");
}


export async function logoutAction() {
   const cookieStore = await cookies();
   cookieStore.delete("praktikum_session");
   redirect("/login");
}