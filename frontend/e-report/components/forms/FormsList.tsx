"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFormsByCaseAction } from "@/lib/actions/forms";

interface Form {
  _id: string;
  formType: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface FormsListProps {
  caseId: string;
  onCreateForm?: (formType: string) => void;
  onEditForm?: (formId: string) => void;
}

const FORM_TYPES = [
  { type: "NOTICE_130", label: "Notice (130)" },
  { type: "PERSONAL_BOND_125", label: "Personal Bond (125)" },
  { type: "SURETY_BOND_126", label: "Surety Bond (126)" },
  { type: "STATEMENT_ACCUSED", label: "Accused Statement" },
  { type: "STATEMENT_WITNESS", label: "Witness Statement" },
  { type: "FINAL_ORDER", label: "Final Order" },
];

const STATUS_COLORS = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function FormsList({
  caseId,
  onCreateForm,
  onEditForm,
}: FormsListProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const result = await getFormsByCaseAction(caseId);

        if (result.success) {
          setForms(result.data);
        } else {
          setError(result.error || "Failed to fetch forms");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [caseId]);

  const getExistingFormType = (formType: string) => {
    return forms.find((f) => f.formType === formType);
  };

  if (loading) {
    return <div className="p-4">Loading forms...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Available Forms to Create */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Create New Form</h3>
        <div className="grid grid-cols-2 gap-3">
          {FORM_TYPES.map(({ type, label }) => {
            const existing = getExistingFormType(type);

            return (
              <Button
                key={type}
                onClick={() => onCreateForm?.(type)}
                disabled={!!existing}
                variant={existing ? "ghost" : "outline"}
                className="justify-start"
              >
                <span className="text-left">
                  {label}
                  {existing && (
                    <span className="ml-2 text-xs">({existing.status})</span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Existing Forms */}
      {forms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Forms</h3>
          <div className="space-y-2">
            {forms.map((form) => {
              const formType = FORM_TYPES.find((f) => f.type === form.formType);

              return (
                <div
                  key={form._id}
                  className="flex items-center justify-between p-3 border border-accent rounded-lg bg-white/50 dark:bg-accent/10"
                >
                  <div className="flex-1">
                    <p className="font-medium">{formType?.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`${
                        STATUS_COLORS[form.status]
                      } text-xs font-semibold px-2 py-1 rounded`}
                    >
                      {form.status}
                    </span>

                    {form.status === "DRAFT" && (
                      <Button
                        onClick={() => onEditForm?.(form._id)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {forms.length === 0 && (
        <div className="p-4 text-gray-600 dark:text-gray-400">
          No forms created yet. Create one to get started!
        </div>
      )}
    </div>
  );
}
