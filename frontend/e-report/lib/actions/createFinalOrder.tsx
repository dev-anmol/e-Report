import { serverFetch } from "../api/server-api";

interface FinalOrderData {
    caseId: string;
    formType: "FINAL_ORDER";
    content: {
        mr: {
            hearingDate: string;
            outcomeType: "BOND_ORDERED" | "NEXT_HEARING" | "CASE_CLOSED" | "WARNING_ONLY";
            outcome: {
                bondAmount?: number;
                bondDurationMonths?: number;
                suretyRequired?: boolean;
                suretyCount?: number;
                nextHearingDate?: string;
                nextHearingPlace?: string;
            };
            remarks: string;
        };
    };
}

export async function createFinalOrder(data: FinalOrderData) {
    try {
        console.log("=== Creating Final Order ===");
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

        console.log("✓ Final order created successfully:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("✗ Error creating final order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create order",
        };
    }
}