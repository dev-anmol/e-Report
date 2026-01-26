// app/(app)/reports/[caseId]/page.tsx
import CaseForm from "./CaseForm";

interface CaseDetailPageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default async function CaseDetailPage({
  params,
}: CaseDetailPageProps) {
  // Await the params Promise
  const { caseId } = await params;
  // Safety check
  if (!caseId) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          Error: Case ID is missing from URL
        </div>
      </div>
    );
  }

  return <CaseForm caseId={caseId} />;
}