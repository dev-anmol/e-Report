"use server";

import { serverFetch } from "../api/server-api";

interface Form {
  _id: string;
  formType: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  content: {
    mr: any;
    en?: any;
  };
  createdAt: string;
}

interface CreateFormResponse {
  success: boolean;
  formId: string;
  status: string;
}

interface GetFormsResponse {
  success: boolean;
  forms: Form[];
}

interface GetFormResponse {
  success: boolean;
  form: Form;
}

// Create a new form
export async function createFormAction(
  caseId: string,
  formType: string,
  content: any
) {
  try {
    const result = await serverFetch<CreateFormResponse>(
      `/cases/${caseId}/forms`,
      {
        method: "POST",
        body: {
          formType,
          content,
        },
      }
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create form",
    };
  }
}

// Update form (only DRAFT forms)
export async function updateFormAction(formId: string, content: any) {
  try {
    const result = await serverFetch(`/forms/${formId}`, {
      method: "PUT",
      body: { content },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update form",
    };
  }
}

// Submit form (DRAFT → SUBMITTED)
export async function submitFormAction(formId: string) {
  try {
    const result = await serverFetch(`/forms/${formId}/submit`, {
      method: "POST",
      body: {},
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit form",
    };
  }
}

// Get all forms for a case
export async function getFormsByCaseAction(caseId: string) {
  try {
    const result = await serverFetch<GetFormsResponse>(`/cases/${caseId}/forms`);

    return { success: true, data: result.forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch forms",
      data: [],
    };
  }
}

// Get pending forms (Admin Only)
export async function getPendingFormsAction() {
  try {
    const result = await serverFetch<GetFormsResponse>("/admin/forms/pending");
    return { success: true, data: result.forms };
  } catch (error) {
    console.error("Error fetching pending forms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch pending forms",
      data: [],
    };
  }
}


// Get single form by ID
export async function getFormByIdAction(formId: string) {
  try {
    const result = await serverFetch<GetFormResponse>(`/forms/${formId}`);

    return { success: true, data: result.form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch form",
    };
  }
}

// Roznama Entry (Admin Only)
export async function addRoznamaEntryAction(
  caseId: string,
  entry: {
    date: string;
    proceedings: string;
    nextDate?: string;
    presentAccusedPersonIds?: string[];
  },
  header?: {
    branchChapterCaseNo: string;
    policeChapterCaseNo: string;
    policeStationName: string;
    sections: string[];
    applicant: string;
    defendants: string[];
  },
  shouldCloseCase?: boolean
) {
  try {
    const result = await serverFetch(`/cases/${caseId}/roznama/entries`, {
      method: "POST",
      body: { entry, header, shouldCloseCase },
    });

    return { success: true, data: result };
  } catch (error) {

    console.error("Error adding roznama entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add roznama entry",
    };
  }
}

// Issue Case File (Admin Only)
export async function issueCaseFileAction(caseId: string, caseFileNumber: string) {
  try {
    const result = await serverFetch<{ success: boolean; pdfPath: string }>(
      "/api/casefiles/issue",
      {
        method: "POST",
        body: { caseId, caseFileNumber },
      }
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Error issuing case file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to issue case file",
    };
  }
}

// Get Case File (for status check and download link)
export async function getCaseFileAction(caseId: string) {
  try {
    const result = await serverFetch<{ success: boolean; caseFile: any }>(
      `/cases/${caseId}/casefile`
    );

    return { success: true, data: result.caseFile };
  } catch (error) {
    console.error("Error fetching case file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch case file",
    };
  }
}

