"use server";

import { serverFetchMultipart } from "@/lib/api/server-api"; // Adjust path

export async function createApplicant(formData: FormData) {
    try {
        // Extract data from FormData
        const caseId = formData.get("caseId") as string;
        const name = formData.get("name") as string;
        const role = formData.get("role") as string;
        const age = formData.get("age") as string;
        const gender = formData.get("gender") as string;
        const mobile = formData.get("mobile") as string;
        const address = formData.get("address") as string;
        const photo = formData.get("photo") as File;
        const signature = formData.get("signature") as File;
        const document = formData.get("document") as File;

        console.log("=== Server Action Debug ===");
        console.log("Received files:");
        console.log("Photo:", photo?.name, photo?.size, photo?.type);
        console.log("Signature:", signature?.name, signature?.size, signature?.type);
        console.log("Document:", document?.name, document?.size, document?.type);

        // Map gender to API format
        const genderMap: Record<string, string> = {
            MALE: "M",
            FEMALE: "F",
            OTHER: "O",
        };
        const apiGender = genderMap[gender] || gender;

        // Create new FormData for API - recreate from scratch
        const apiFormData = new FormData();
        apiFormData.append("name", name);
        apiFormData.append("role", role);
        apiFormData.append("age", age);
        apiFormData.append("gender", apiGender);
        apiFormData.append("mobile", mobile);
        apiFormData.append("address", address);

        // Append files - ensure they're proper File/Blob objects
        if (photo && photo.size > 0) {
            apiFormData.append("photo", photo, photo.name);
        }
        if (signature && signature.size > 0) {
            apiFormData.append("signature", signature, signature.name);
        }
        if (document && document.size > 0) {
            apiFormData.append("document", document, document.name);
        }

        console.log("=== Sending to API ===");
        console.log("FormData entries:");
        for (const [key, value] of apiFormData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    size: value.size,
                    type: value.type,
                });
            } else {
                console.log(`${key}:`, value);
            }
        }

        const result = await serverFetchMultipart(
            `/cases/${caseId}/persons`,
            apiFormData
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