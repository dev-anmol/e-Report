"use server";

import { serverFetch } from "@/lib/api/server-api";
import { redirect } from "next/navigation";

export async function getAnalyticsOverview() {
  try {
    const res = await serverFetch("/analytics/overview");
    return { success: true, data: res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load analytics";
    if (message.includes("Session expired")) redirect("/login");
    return { success: false, error: message };
  }
}

export async function getAIDigest(force?: boolean) {
  try {
    const res = await serverFetch(`/analytics/ai-digest${force ? "?force=1" : ""}`);
    return { success: true, data: res };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate digest",
    };
  }
}

export async function getCaseSummary(caseId: string, force?: boolean) {
  try {
    const res = await serverFetch(
      `/cases/${caseId}/ai-summary${force ? "?force=1" : ""}`
    );
    return { success: true, data: res };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate summary",
    };
  }
}
