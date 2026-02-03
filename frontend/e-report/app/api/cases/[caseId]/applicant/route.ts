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
      
      // Transform the applicant data to the API format
      const { applicant } = body;
      
      // Create FormData for the API
      const apiFormData = new FormData();
      apiFormData.append("name", applicant.Name || "");
      apiFormData.append("role", applicant.role || "APPLICANT");
      apiFormData.append("age", applicant.age?.toString() || "");
      apiFormData.append("gender", applicant.gender || "M");
      apiFormData.append("mobile", applicant.mobile || "");
      apiFormData.append("address", applicant.address || "");

      result = await serverFetchMultipart<{
        success: boolean;
        personId: string;
        files?: { photo?: string; signature?: string; document?: string };
      }>(`/cases/${caseId}/persons`, apiFormData);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating applicant:", error);
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
    }>(`/cases/${caseId}/persons?role=APPLICANT`);

    return NextResponse.json({ success: true, data: result.persons });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

