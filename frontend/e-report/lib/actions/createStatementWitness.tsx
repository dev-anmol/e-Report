import { serverFetch } from "../api/server-api";

interface StatementWitnessData {
    caseId: string;
    formType: "STATEMENT_WITNESS";
    content: {
        mr: {
            personId: string;
            statement: string;
        };
    };
}

export async function createStatementWitness(data: StatementWitnessData) {
    try {
        console.log("=== Creating Witness Statement ===");
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

        console.log("✓ Witness statement recorded successfully:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("✗ Error recording witness statement:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to record statement",
        };
    }
}
