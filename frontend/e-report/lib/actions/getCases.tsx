"use server";

import { serverFetch } from "../api/server-api";
import { redirect } from "next/navigation";

interface Case {
  _id: string;
  branchCaseNumber: string;
  sections: string[];
  status: string;
  language: string;
  createdAt: string;
}

interface CasesResponse {
  success: boolean;
  cases: Case[];
}

export async function getCases() {
  try {
    const result = await serverFetch<CasesResponse>("/cases");
    return { success: true, data: result.cases };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch cases";
    
    // If session expired, redirect to login
    if (errorMessage.includes("Session expired") || errorMessage.includes("Invalid or expired token")) {
      redirect("/login");
    }
    
    console.error("Error fetching cases:", error);
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
}
