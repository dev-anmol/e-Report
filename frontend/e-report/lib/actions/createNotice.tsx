"use server";

import { serverFetch } from "@/lib/api/server-api";

interface NoticeFormData {
  caseId: string;
  formType: "NOTICE_130";
  content: {
    mr: {
      personIds: string[];
      facts: string;
      hearing: {
        date: string;
        time: string;
        place: string;
      };
    };
  };
}

export async function createNotice(data: NoticeFormData) {
  try {
    console.log("=== Creating Notice 130 ===");
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

    console.log("✓ Notice 130 created successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("✗ Error creating Notice 130:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create notice",
    };
  }
}