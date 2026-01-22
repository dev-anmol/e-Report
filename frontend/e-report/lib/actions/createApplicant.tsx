"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_URL = "https://e-report-t9xh.onrender.com";

async function refreshAccessToken() {
    try {
        const res = await fetch(`${BASE_URL}/refresh/token`, {
            method: "POST",
            credentials: "include",
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Refresh token expired");
        }

        const data = await res.json();

        (await cookies()).set("accessToken", data.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
        });

        return data.accessToken;
    } catch (error) {
        (await cookies()).delete("accessToken");
        redirect("/login");
    }
}

async function serverFetchMultipart(
    endpoint: string,
    formData: FormData,
    token?: string
) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
        cache: "no-store",
        credentials: "include",
    });

    if (res.status === 401) {
        try {
            const newToken = await refreshAccessToken();
            return serverFetchMultipart(endpoint, formData, newToken);
        } catch (error) {
            throw error;
        }
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "API request failed");
    }

    return res.json();
}

export async function createApplicant(data: {
    caseId: string;
    name: string;
    age: string;
    gender: string;
    mobile: string;
    address: string;
    role: string;
    photo: File;
    signature: File;
    document: File;
}) {
    try {
        const cookieStore = await cookies();
        let accessToken = cookieStore.get("accessToken")?.value;

        const genderMap: Record<string, string> = {
            MALE: "M",
            FEMALE: "F",
            OTHER: "O",
        };
        const apiGender = genderMap[data.gender] || data.gender;

        // Create FormData
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("role", data.role);
        formData.append("age", data.age);
        formData.append("gender", apiGender);
        formData.append("mobile", data.mobile);
        formData.append("address", data.address);
        formData.append("photo", data.photo);
        formData.append("signature", data.signature);
        formData.append("document", data.document);

        const result = await serverFetchMultipart(
            `/cases/${data.caseId}/persons`,
            formData,
            accessToken
        );

        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating applicant:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create applicant",
        };
    }
}