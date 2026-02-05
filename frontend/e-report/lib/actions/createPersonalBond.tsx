// ============================================
// FILE: lib/actions/forms/createPersonalBond.ts
// ============================================
"use server";

import { serverFetch } from "@/lib/api/server-api";

interface PersonalBondData {
    caseId: string;
    formType: "PERSONAL_BOND_125";
    content: {
        mr: {
            personIds: string[];
            bond: {
                amount: number;
                durationMonths: number;
            };
        };
    };
}

export async function createPersonalBond(data: PersonalBondData) {
    try {
        console.log("=== Creating Personal Bond 125 ===");
        console.log("Data:", JSON.stringify(data, null, 2));

        const payload = {
            caseId: data.caseId,
            formType: data.formType,
            content: data.content,
            createdDate: new Date().toISOString(),
        };

        const result = await serverFetch<{ formId: string; message: string }>(
            `/cases/${data.caseId}/forms`,
            {
                method: "POST",
                body: payload,
            }
        );

        console.log("✓ Personal Bond 125 created successfully:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("✗ Error creating Personal Bond 125:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create bond",
        };
    }
}