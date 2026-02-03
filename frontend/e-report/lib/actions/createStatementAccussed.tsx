import { serverFetch } from "../api/server-api";

interface StatementAccusedData {
    caseId: string;
    formType: "STATEMENT_ACCUSED";
    content: {
        mr: {
            personId: string;
            statement: string;
        };
    };
}

export async function createStatementAccused(data: StatementAccusedData) {
    try {
        console.log("=== Creating Accused Statement ===");
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

        console.log("✓ Accused statement recorded successfully:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("✗ Error recording accused statement:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to record statement",
        };
    }
}