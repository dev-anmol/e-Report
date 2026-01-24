"use server";

import { serverFetch } from "../api/server-api";
import { redirect } from "next/navigation";

interface PoliceStation {
  _id: string;
  name: string;
  code: string;
  district: string;
  taluka: string;
  address?: string;
}

interface PoliceStationsResponse {
  success: boolean;
  data?: PoliceStation[];
}

// Police stations are returned as array directly
type RawPoliceStationsResponse = PoliceStation[];

export async function getPoliceStationsAction() {
  try {
    const result = await serverFetch<RawPoliceStationsResponse>(
      "/police-stations"
    );
    return { success: true, data: result };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch police stations";

    if (
      errorMessage.includes("Session expired") ||
      errorMessage.includes("Invalid or expired token")
    ) {
      redirect("/login");
    }

    console.error("Error fetching police stations:", error);
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
}

