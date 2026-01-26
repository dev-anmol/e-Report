"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, User, Users, FileText, UserPlus, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCaseByIdAction, getPersonsByCaseAction, Case, Person } from "@/lib/actions/cases";
import { getFormsByCaseAction } from "@/lib/actions/forms";
import ApplicantForm from "@/components/forms/ApplicantForm";
import DefendantsForm from "@/components/forms/DefendantsForm";
import WitnessesForm from "@/components/forms/WitnessesForm";

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

interface Form {
  _id: string;
  formType: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface CaseFormProps {
  caseId: string;
}

// Expandable Section Component
function ExpandableSection({
  title,
  icon: Icon,
  count,
  variant = "default",
  children,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  variant?: "default" | "applicant" | "defendant" | "witness" | "forms";
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const variants = {
    default: {
      closed: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
      open: "bg-white dark:bg-gray-800 border-accent",
      icon: "bg-gray-200 dark:bg-gray-700 text-gray-500",
      accent: "bg-primary/10 text-primary",
    },
    applicant: {
      closed: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      open: "bg-white dark:bg-gray-800 border-blue-500",
      icon: "bg-blue-100 dark:bg-blue-900 text-blue-500",
      accent: "bg-blue-500",
    },
    defendant: {
      closed: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      open: "bg-white dark:bg-gray-800 border-red-500",
      icon: "bg-red-100 dark:bg-red-900 text-red-500",
      accent: "bg-red-500",
    },
    witness: {
      closed: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
      open: "bg-white dark:bg-gray-800 border-green-500",
      icon: "bg-green-100 dark:bg-green-900 text-green-500",
      accent: "bg-green-500",
    },
    forms: {
      closed: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
      open: "bg-white dark:bg-gray-800 border-purple-500",
      icon: "bg-purple-100 dark:bg-purple-900 text-purple-500",
      accent: "bg-purple-500",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`rounded-lg border-2 transition-all duration-300 overflow-hidden ${isOpen ? style.open : style.closed
        }`}
    >
      {/* Header - Always Visible */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${!isOpen && "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${isOpen ? style.accent : style.icon
              }`}
          >
            <Icon size={20} className={isOpen ? "text-white" : ""} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {count !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {count} item{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && count === 0 && (
            <span className="text-xs text-gray-400">Click to add</span>
          )}
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Content - Only visible when open */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );
}

export default function CaseForm({ caseId }: CaseFormProps) {
  const router = useRouter();

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

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Applicant Section */}
        <ExpandableSection
          title="Applicant Details"
          icon={User}
          count={applicant ? 1 : 0}
          variant="applicant"
        >
          <ApplicantForm caseId={caseId} />
        </ExpandableSection>

        {/* Defendants Section */}
        <ExpandableSection
          title="Defendants"
          icon={Users}
          count={defendants.length}
          variant="defendant"
        >
          <DefendantsForm caseId={caseId} />
        </ExpandableSection>

        {/* Witnesses Section */}
        <ExpandableSection
          title="Witnesses"
          icon={UserPlus}
          count={witnesses.length}
          variant="witness"
        >
          <WitnessesForm caseId={caseId} />
        </ExpandableSection>

        {/* Forms Section */}
        <ExpandableSection
          title="Forms & Documents"
          icon={FileText}
          count={forms.length}
          variant="forms"
        >
          <div className="space-y-4">
            {forms.length > 0 ? (
              <div className="space-y-2">
                {forms.map((form) => (
                  <div
                    key={form._id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{form.formType}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(form.createdAt).toLocaleDateString()} - {form.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No forms created yet
              </p>
            )}
            <Button className="w-full" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}

