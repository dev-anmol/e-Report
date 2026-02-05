import { serverFetch } from "../api/server-api";

interface SuretyBond126Data {
    caseId: string;
    formType: "SURETY_BOND_126";
    content: {
        mr: {
            personIds: string[];
            bond: {
                amount: number;
                durationMonths: number;
                suretyCount: number;
            };
        };
    };
}

export async function createSuretyBond126(data: SuretyBond126Data) {
    try {
        console.log("=== Creating Surety Bond 126 ===");
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

        console.log("✓ Surety Bond 126 created successfully:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("✗ Error creating Surety Bond 126:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create bond",
        };
    }
}
