"use server";

import { serverFetch } from "../api/server-api";
import { redirect } from "next/navigation";

export interface Case {
  _id: string;
  branchCaseNumber: string;
  policeStationCaseNumber: string;
  sections: string[];
  policeStationId: string | { _id: string; name: string };
  officerId: string;
  status: "DRAFT" | "NOTICE_ISSUED" | "HEARING" | "ORDER_PASSED" | "CLOSED";
  language: "MR" | "EN" | "BOTH";
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  _id: string;
  caseId: string;
  name: string;
  role: "APPLICANT" | "DEFENDANT" | "WITNESS";
  address?: string;
  age?: number;
  gender?: string;
  mobile?: string;
  files?: {
    signature?: string;
    photo?: string;
    document?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ======================
// CREATE CASE
// ======================
interface CreateCaseRequest {
  branchCaseNumber: string;
  policeStationCaseNumber: string;
  sections: string[];
  policeStationId: string;
  language?: "MR" | "EN" | "BOTH";
}

interface CreateCaseResponse {
  success: boolean;
  caseId: string;
  status: string;
}

export async function createCaseAction(data: CreateCaseRequest) {
  try {
    const result = await serverFetch<CreateCaseResponse>("/cases", {
      method: "POST",
      body: data,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating case:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create case",
    };
  }
}

// ======================
// GET CASE BY ID
// ======================
interface GetCaseResponse {
  success: boolean;
  case: Case;
}

export async function getCaseByIdAction(caseId: string) {
  try {
    const result = await serverFetch<GetCaseResponse>(`/cases/${caseId}`);
    return { success: true, data: result.case };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch case";

    if (
      errorMessage.includes("Session expired") ||
      errorMessage.includes("Invalid or expired token")
    ) {
      redirect("/login");
    }

    console.error("Error fetching case:", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ======================
// GET PERSONS BY CASE
// ======================
interface GetPersonsResponse {
  success: boolean;
  persons: Person[];
}

export async function getPersonsByCaseAction(caseId: string) {
  try {
    const result = await serverFetch<GetPersonsResponse>(
      `/cases/${caseId}/persons`
    );
    return { success: true, data: result.persons };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch persons";

    if (
      errorMessage.includes("Session expired") ||
      errorMessage.includes("Invalid or expired token")
    ) {
      redirect("/login");
    }

    console.error("Error fetching persons:", error);
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
}

