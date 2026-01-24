import { NextRequest, NextResponse } from "next/server";
import { serverFetch, serverFetchMultipart } from "@/lib/api/server-api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const contentType = request.headers.get("content-type");

    let result;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      result = await serverFetchMultipart<{
        success: boolean;
        personId: string;
        files?: { photo?: string; signature?: string; document?: string };
      }>(`/cases/${caseId}/persons`, formData);
    } else {
      const body = await request.json();
      
      // Transform the defendant data to the API format
      const { defendant } = body;
      
      // Create FormData for the API
      const apiFormData = new FormData();
      apiFormData.append("name", defendant.Name || "");
      apiFormData.append("role", defendant.role || "DEFENDANT");
      apiFormData.append("age", defendant.age?.toString() || "");
      apiFormData.append("gender", defendant.gender || "M");
      apiFormData.append("mobile", defendant.mobile || "");
      apiFormData.append("address", defendant.address || "");

      result = await serverFetchMultipart<{
        success: boolean;
        personId: string;
        files?: { photo?: string; signature?: string; document?: string };
      }>(`/cases/${caseId}/persons`, apiFormData);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating defendant:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const result = await serverFetch<{
      success: boolean;
      persons: any[];
    }>(`/cases/${caseId}/persons?role=DEFENDANT`);

    return NextResponse.json({ success: true, data: result.persons });
  } catch (error) {
    console.error("Error fetching defendants:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

