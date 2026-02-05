"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { createStatementWitness } from "@/lib/actions/createStatementWitness";

const statementWitnessSchema = z.object({
    personId: z.string().min(1, "Select a statement provider"),
    statement: z.string().min(10, "Statement must be at least 10 characters"),
});

type WitnessFormValues = z.infer<typeof statementWitnessSchema>;

interface StatementWitnessFormProps {
    caseId: string;
    applicants: Array<{ _id: string; name: string }>;
    witnesses: Array<{ _id: string; name: string }>;
}

export function StatementWitnessForm({ caseId, applicants, witnesses }: StatementWitnessFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Co-applicants are any applicants after the first one
    const coApplicants = applicants.slice(1);

    // Combine witnesses and co-applicants for the selection
    const selectablePersons = [
        ...witnesses.map(w => ({ ...w, type: 'WITNESS' })),
        ...coApplicants.map(ca => ({ ...ca, type: 'CO_APPLICANT' }))
    ];

    const form = useForm<WitnessFormValues>({
        resolver: zodResolver(statementWitnessSchema),
        defaultValues: {
            personId: "",
            statement: "",
        },
    });

    // Handle initial selection if only one selectable person
    useEffect(() => {
        if (selectablePersons.length === 1 && !form.getValues("personId")) {
            form.setValue("personId", selectablePersons[0]._id);
        }
    }, [selectablePersons, form]);

    const onSubmit = async (values: WitnessFormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        startTransition(async () => {
            try {
                const result = await createStatementWitness({
                    caseId,
                    formType: "STATEMENT_WITNESS",
                    content: {
                        mr: {
                            personId: values.personId,
                            statement: values.statement,
                        },
                    },
                });

                if (result.success) {
                    setSuccessMessage("Statement recorded successfully!");
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
                            <FieldLabel>Select Statement Provider (Witness/Co-applicant) *</FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={selectablePersons.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectablePersons.length === 0 ? "No witnesses or co-applicants available" : "Select person"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectablePersons.map((person) => (
                                        <SelectItem key={person._id} value={person._id}>
                                            {person.name} {person.type === 'CO_APPLICANT' ? '(Co-applicant)' : '(Witness)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                placeholder="मी आरोपी व तक्रारदार यांच्यातील वाद पाहिला."
                                rows={6}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                            )}
                            <FieldDescription>Record the witness's statement in Marathi</FieldDescription>
                        </Field>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Recording..." : "Record Witness Statement"}
                </Button>
            </FieldGroup>
        </form>
    );
}