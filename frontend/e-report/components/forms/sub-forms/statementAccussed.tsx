"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition } from "react";
import { createStatementAccused } from "@/lib/actions/createStatementAccussed";

const statementAccusedSchema = z.object({
    personId: z.string().min(1, "Select accused person"),
    statement: z.string().min(20, "Statement must be at least 20 characters"),
});

type FormValues = z.infer<typeof statementAccusedSchema>;

interface StatementAccusedFormProps {
    caseId: string;
    defendants: Array<{ _id: string; name: string }>;
}

export default function StatementAccusedForm({ caseId, defendants }: StatementAccusedFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(statementAccusedSchema),
        defaultValues: {
            personId: "",
            statement: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        startTransition(async () => {
            try {
                const result = await createStatementAccused({
                    caseId,
                    formType: "STATEMENT_ACCUSED",
                    content: {
                        mr: {
                            personId: values.personId,
                            statement: values.statement,
                        },
                    },
                });

                if (result.success) {
                    setSuccessMessage("Accused statement recorded successfully!");
                    form.reset();
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    setErrorMessage(result.error || "Failed to record statement");
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
                            <FieldLabel>Select Accused *</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select accused person" />
                                </SelectTrigger>
                                <SelectContent>
                                    {defendants.map((defendant) => (
                                        <SelectItem key={defendant._id} value={defendant._id}>
                                            {defendant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
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
                    {isPending ? "Recording..." : "Record Accused Statement"}
                </Button>
            </FieldGroup>
        </form>
    );
}