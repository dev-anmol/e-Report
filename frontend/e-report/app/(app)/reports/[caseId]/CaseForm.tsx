"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, User, Users, FileText, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCaseByIdAction, getPersonsByCaseAction, Case, Person } from "@/lib/actions/cases";
import { getFormsByCaseAction } from "@/lib/actions/forms";
import ApplicantForm from "@/components/forms/ApplicantForm";
import DefendantsForm from "@/components/forms/DefendantsForm";
import WitnessesForm from "@/components/forms/WitnessesForm";
import FormsSection from "@/components/forms/FormsSection";

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
  content: any;
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
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  variant?: "default" | "applicant" | "defendant" | "witness" | "forms";
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
                {count} form{count !== 1 ? "s" : ""} created
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && (
            <span className="text-xs text-gray-400">Click to create forms</span>
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
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
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

  const refreshForms = async () => {
    try {
      const formsResult = await getFormsByCaseAction(caseId);
      if (formsResult.success) {
        console.log("CaseForm: Refetched forms:", formsResult.data);
        setForms(formsResult.data as Form[]);
      }
    } catch (err) {
      console.error("Error refreshing forms:", err);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch case details
        const caseResult = await getCaseByIdAction(caseId);
        if (caseResult.success) {
          setCaseData(caseResult.data as Case);
        }

        // Fetch persons
        const personsResult = await getPersonsByCaseAction(caseId);
        if (personsResult.success) {
          setPersons(personsResult.data as Person[]);
        }

        // Fetch forms
        await refreshForms();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
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

  // Workflow validation: Forms can only be shown after applicant + defendants are added
  const canShowForms = applicant && defendants.length > 0;
  const formsBlockedReason = !applicant
    ? "Please add an Applicant first"
    : defendants.length === 0
      ? "Please add at least one Defendant"
      : null;

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
          <ApplicantForm caseId={caseId} existingApplicant={applicant} />
        </ExpandableSection>

        {/* Defendants Section */}
        <ExpandableSection
          title="Defendants"
          icon={Users}
          count={defendants.length}
          variant="defendant"
        >
          <DefendantsForm caseId={caseId} existingDefendants={defendants} />
        </ExpandableSection>

        {/* Witnesses Section */}
        <ExpandableSection
          title="Witnesses"
          icon={UserPlus}
          count={witnesses.length}
          variant="witness"
        >
          <WitnessesForm caseId={caseId} existingWitnesses={witnesses} />
        </ExpandableSection>

        {/* Forms Section - CONDITIONAL RENDERING */}
        {canShowForms ? (
          <ExpandableSection
            title="Forms & Documents"
            icon={FileText}
            count={forms.length}
            variant="forms"
            defaultOpen={false}
          >
            {/* Show created forms count if any */}
            {forms.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Created Forms ({forms.length})
                </h4>
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
                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              </div>
            )}

            {/* Forms Creation Tabs */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">
                Create New Forms
              </h4>
              <FormsSection
                caseId={caseId}
                applicants={persons.filter(p => p.role === "APPLICANT").map(p => ({ _id: p._id, name: p.name }))}
                defendants={defendants.map(d => ({ _id: d._id, name: d.name }))}
                witnesses={witnesses.map(w => ({ _id: w._id, name: w.name }))}
                existingForms={forms}
                onSuccess={refreshForms}
              />
            </div>
          </ExpandableSection>
        ) : (
          <div className="rounded-lg border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <FileText size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-yellow-900 dark:text-yellow-100">
                  Forms & Documents (Locked)
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Complete the prerequisites to unlock this section
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                ⚠️ {formsBlockedReason}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Forms can only be created after adding an Applicant and at least one Defendant.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100">
                Prerequisites Checklist:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${applicant
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                    {applicant ? (
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${applicant
                      ? "text-green-700 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-400"
                      }`}>
                      Applicant Added
                    </p>
                    {!applicant && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add applicant details in the section above
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${defendants.length > 0
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                    {defendants.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${defendants.length > 0
                      ? "text-green-700 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-400"
                      }`}>
                      At least 1 Defendant Added
                    </p>
                    {defendants.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add defendant details in the section above
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {defendants.length} defendant{defendants.length > 1 ? 's' : ''} added
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">i</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600 dark:text-gray-400">
                      Witnesses (Optional)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {witnesses.length > 0
                        ? `${witnesses.length} witness${witnesses.length > 1 ? 'es' : ''} added`
                        : "You can add witnesses, but they are not required for forms"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}