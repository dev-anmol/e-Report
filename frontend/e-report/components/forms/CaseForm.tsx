"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Users, FileText, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCaseByIdAction, getPersonsByCaseAction, Case, Person } from "@/lib/actions/cases";
import { getFormsByCaseAction } from "@/lib/actions/forms";
import { SectionCard } from "./SectionCard";
import ApplicantForm from "@/app/(app)/reports/section-2/[caseId]/ApplicantForm";
import DefendantsForm from "@/app/(app)/reports/section-2/[caseId]/DefendentForm";
import FormsList from "./FormsList";

// Mock data
const MOCK_CASE: Case = {
  _id: "123",
  branchCaseNumber: "2024/001",
  policeStationCaseNumber: "PS/2024/001",
  sections: ["294", "336"],
  status: "NOTICE_ISSUED",
  language: "MR",
  createdAt: "2024-01-15",
  updatedAt: "2024-01-15",
  policeStationId: { _id: "ps1", name: "Pune Police Station" },
  officerId: "user1",
};

const MOCK_PERSONS: Person[] = [
  { _id: "p1", name: "John Doe", role: "DEFENDANT", caseId: "123", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { _id: "p2", name: "Jane Smith", role: "APPLICANT", caseId: "123", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { _id: "p3", name: "Bob Wilson", role: "WITNESS", caseId: "123", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
];

interface CaseFormProps {
  caseId: string;
}

interface Form {
  _id: string;
  formType: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function CaseForm({ caseId }: CaseFormProps) {
  const router = useRouter();

  // Section states
  const [sections, setSections] = useState({
    applicant: false,
    defendants: false,
    witnesses: false,
    forms: false,
  });

  // Data states
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch case data
        const caseResult = await getCaseByIdAction(caseId);
        if (caseResult.success && caseResult.data) {
          setCaseData(caseResult.data as Case);
        } else {
          setCaseData(MOCK_CASE);
        }

        // Fetch persons
        const personsResult = await getPersonsByCaseAction(caseId);
        if (personsResult.success && personsResult.data) {
          setPersons(personsResult.data as Person[]);
        } else {
          setPersons(MOCK_PERSONS);
        }

        // Fetch forms
        const formsResult = await getFormsByCaseAction(caseId);
        if (formsResult.success) {
          setForms(formsResult.data as Form[]);
        }
      } catch (err) {
        console.error("Error fetching case data:", err);
        setError(err instanceof Error ? err.message : "Failed to load case data");
        setCaseData(MOCK_CASE);
        setPersons(MOCK_PERSONS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  // Toggle section
  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get persons by role
  const applicant = persons.find((p) => p.role === "APPLICANT");
  const defendants = persons.filter((p) => p.role === "DEFENDANT");
  const witnesses = persons.filter((p) => p.role === "WITNESS");

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full space-y-6 p-6">
        <Skeleton className="h-10 w-24" />
        <div className="bg-white/50 dark:bg-accent/10 rounded-lg border border-accent p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const displayCase = caseData || MOCK_CASE;

  return (
    <div className="w-full space-y-6 p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Case Header */}
      <div className="bg-white/50 dark:bg-accent/10 rounded-lg border border-accent p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">
            Case: {displayCase.branchCaseNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Police Station Case: {displayCase.policeStationCaseNumber}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sections</p>
            <p className="font-semibold">{displayCase.sections.join(", ")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-semibold">{displayCase.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
            <p className="font-semibold">
              {new Date(displayCase.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100 rounded-lg">
          {error} (Showing mock data)
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {/* Applicant Section */}
        <SectionCard
          title="Applicant Details"
          description={
            applicant
              ? `Added: ${applicant.name}`
              : "No applicant added yet"
          }
          icon={<User size={24} />}
          isEnabled={sections.applicant}
          onToggle={() => toggleSection("applicant")}
          disabledPlaceholder="Click to add/edit applicant"
          variant="applicant"
        >
          <ApplicantForm caseId={caseId} />
        </SectionCard>

        {/* Defendants Section */}
        <SectionCard
          title="Defendants"
          description={
            defendants.length > 0
              ? `${defendants.length} defendant(s) added`
              : "No defendants added yet"
          }
          icon={<Users size={24} />}
          isEnabled={sections.defendants}
          onToggle={() => toggleSection("defendants")}
          disabledPlaceholder="Click to add/edit defendants"
          variant="defendant"
        >
          <DefendantsForm caseId={caseId} />
        </SectionCard>

        {/* Witnesses Section */}
        <SectionCard
          title="Witnesses"
          description={
            witnesses.length > 0
              ? `${witnesses.length} witness(es) added`
              : "No witnesses added yet"
          }
          icon={<UserPlus size={24} />}
          isEnabled={sections.witnesses}
          onToggle={() => toggleSection("witnesses")}
          disabledPlaceholder="Click to add witnesses"
          variant="witness"
        >
          <div className="p-4 text-center text-gray-500">
            <p>Witness form to be implemented</p>
            <p className="text-sm mt-2">
              Currently {witnesses.length} witness(es) in database
            </p>
            <Button className="mt-4" disabled>
              Add Witness
            </Button>
          </div>
        </SectionCard>

        {/* Forms Section */}
        <SectionCard
          title="Forms & Documents"
          description={`${forms.length} form(s) created`}
          icon={<FileText size={24} />}
          isEnabled={sections.forms}
          onToggle={() => toggleSection("forms")}
          disabledPlaceholder="Click to create/view forms"
          variant="forms"
        >
          <FormsList caseId={caseId} />
        </SectionCard>
      </div>
    </div>
  );
}

