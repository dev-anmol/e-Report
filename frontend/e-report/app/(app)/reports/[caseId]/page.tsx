import CaseForm from "./CaseForm";

interface CaseDetailPageProps {
  params: {
    caseId: string;
  };
}

export default function CaseDetailPage({
  params: { caseId },
}: CaseDetailPageProps) {
  return <CaseForm caseId={caseId} />;
}

