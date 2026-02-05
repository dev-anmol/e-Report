"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition, useEffect } from "react";
import { createStatementAccused } from "@/lib/actions/createStatementAccussed";
import { updateFormAction } from "@/lib/actions/forms";

const statementAccusedSchema = z.object({
    personId: z.string().min(1, "Select person"),
    statement: z.string().min(20, "Statement must be at least 20 characters"),
});

type FormValues = z.infer<typeof statementAccusedSchema>;

interface StatementAccusedFormProps {
    caseId: string;
    applicants: Array<{ _id: string; name: string }>;
    initialData?: any;
    onSuccess?: () => void;
}

export default function StatementAccusedForm({ caseId, applicants, initialData, onSuccess }: StatementAccusedFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Complainant is the first applicant
    const primaryApplicant = applicants[0];

    const form = useForm<FormValues>({
        resolver: zodResolver(statementAccusedSchema),
        defaultValues: {
            personId: primaryApplicant?._id || "",
            statement: "",
        },
    });

    // Prefill form if initialData is provided
    useEffect(() => {
        if (initialData?.content?.mr) {
            const { personId, statement } = initialData.content.mr;
            form.reset({
                personId: personId || primaryApplicant?._id || "",
                statement: statement || "",
            });
        }
    }, [initialData, primaryApplicant, form]);

    // Handle initial selection if applicant loads late (only if not prefilled)
    useEffect(() => {
        if (!initialData && primaryApplicant?._id && !form.getValues("personId")) {
            form.setValue("personId", primaryApplicant._id);
        }
    }, [primaryApplicant, form, initialData]);

    const onSubmit = async (values: FormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        startTransition(async () => {
            try {
                const content = {
                    mr: {
                        personId: values.personId,
                        statement: values.statement,
                    },
                };

                const result = initialData
                    ? await updateFormAction(initialData._id, content)
                    : await createStatementAccused({
                        caseId,
                        formType: "STATEMENT_ACCUSED",
                        content,
                    });

                if (result.success) {
                    setSuccessMessage(initialData ? "Statement updated successfully!" : "Complainant statement recorded successfully!");
                    if (onSuccess) onSuccess();
                    if (!initialData) {
                        form.reset({
                            personId: primaryApplicant?._id || "",
                            statement: "",
                        });
                    }
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    setErrorMessage(result.error || `Failed to ${initialData ? 'update' : 'record'} statement`);
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "An error occurred");
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {successMessage && (
                <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
                    {errorMessage}
                </div>
            )}

            <FieldGroup>
                <Controller
                    control={form.control}
                    name="personId"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Statement From (Applicant) *</FieldLabel>
                            <div className="p-3 bg-neutral-50 dark:bg-accent/10 rounded-md border border-neutral-200 dark:border-accent flex items-center justify-between opacity-80">
                                <span className="text-sm font-medium">{primaryApplicant?.name || "No applicant assigned"}</span>
                                <input type="hidden" {...field} />
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Applicant</span>
                            </div>
                            {fieldState.error && (
                                <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="statement"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Statement (Marathi) *</FieldLabel>
                            <Textarea
                                {...field}
                                placeholder="मी आज घटनास्थळी उपस्थित होतो व वाद झाल्याचे मान्य करतो."
                                rows={6}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                            )}
                            <FieldDescription>Record the accused's statement in Marathi</FieldDescription>
                        </Field>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending
                        ? (initialData ? "Updating..." : "Recording...")
                        : (initialData ? "Update Statement" : "Record Accused Statement")}
                </Button>
            </FieldGroup>
        </form>
    );
}