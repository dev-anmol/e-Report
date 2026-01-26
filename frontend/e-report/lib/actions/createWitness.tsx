"use server";

import { serverFetchMultipart } from "@/lib/api/server-api";

export async function createWitness(formData: FormData) {
    try {
        const caseId = formData.get("caseId") as string;
        const name = formData.get("name") as string;
        const role = formData.get("role") as string;
        const age = formData.get("age") as string;
        const gender = formData.get("gender") as string;
        const mobile = formData.get("mobile") as string;
        const address = formData.get("address") as string;
        const photo = formData.get("photo") as File | null;
        const signature = formData.get("signature") as File | null;
        const document = formData.get("document") as File | null;

        console.log("=== Creating Witness ===");
        console.log("Name:", name);

        // Map gender
        const genderMap: Record<string, string> = {
            MALE: "M",
            FEMALE: "F",
            OTHER: "O",
        };
        const apiGender = genderMap[gender] || gender;

        // Create FormData for API
        const apiFormData = new FormData();
        apiFormData.append("name", name);
        apiFormData.append("role", role);
        apiFormData.append("age", age);
        apiFormData.append("gender", apiGender);
        apiFormData.append("mobile", mobile);
        apiFormData.append("address", address);

        if (photo && photo.size > 0) {
            apiFormData.append("photo", photo, photo.name);
        }
        if (signature && signature.size > 0) {
            apiFormData.append("signature", signature, signature.name);
        }
        if (document && document.size > 0) {
            apiFormData.append("document", document, document.name);
        }

        const result = await serverFetchMultipart(
            `/cases/${caseId}/persons`,
            apiFormData
        );

        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating witness:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create witness",
        };
    }
}