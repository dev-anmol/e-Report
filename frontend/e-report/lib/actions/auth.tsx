"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api/server-api";
import { LoginResponse } from "@/types/login/login.type";

export async function loginAction(
    _prevState: { error?: string } | null,
    formData: FormData
) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Email and password required" };
    }

    let res: LoginResponse;

    try {
        res = await serverFetch<LoginResponse>("/login", {
            method: "POST",
            body: { email, password },
        });
    } catch (error) {
        return { error: "Invalid credentials" };
    }


    if (!res.success || !res.accessToken) {
        return { error: "Invalid credentials" };
    }

    (await cookies()).set("accessToken", res.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    });

    redirect("/dashboard");
}



export async function getMeAction() {
    try {
        const res = await serverFetch<{ success: boolean; user: { id: string; name: string; email: string; role: 'ADMIN' | 'OFFICER' } }>("/me");
        return { success: true, data: res.user };
    } catch (error) {
        console.error("Error fetching user info:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch user info",
        };
    }
}

export async function logoutAction() {
    try {
        await serverFetch("/logout", { method: "POST" });
    } catch {
    }

    (await cookies()).delete("accessToken");
    (await cookies()).delete("refreshToken");
    redirect("/login");
}
