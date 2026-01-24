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
