"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition, useEffect } from "react";
import { addRoznamaEntryAction } from "@/lib/actions/forms";
import { Checkbox } from "@/components/ui/checkbox";

const roznamaSchema = z.object({
    date: z.string().min(1, "Date is required"),
    proceedings: z.string().min(1, "Proceedings description is required"),
    nextDate: z.string().optional(),
    presentAccusedPersonIds: z.array(z.string()).optional(),
    // Header fields (optional, required for first entry)
    branchChapterCaseNo: z.string().optional(),
    policeChapterCaseNo: z.string().optional(),
    policeStationName: z.string().optional(),
    sections: z.string().optional(),
    applicantName: z.string().optional(),
    defendantsNames: z.string().optional(),
});

type FormValues = z.infer<typeof roznamaSchema>;

interface RoznamaFormProps {
    caseId: string;
    caseData: any;
    defendants: Array<{ _id: string; name: string }>;
    applicant: { name: string } | null;
    isFirstEntry: boolean;
    onSuccess?: () => void;
}

export default function RoznamaForm({
    caseId,
    caseData,
    defendants,
    applicant,
    isFirstEntry,
    onSuccess,
}: RoznamaFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(roznamaSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            proceedings: "",
            nextDate: "",
            presentAccusedPersonIds: [],
            branchChapterCaseNo: caseData?.branchCaseNumber || "",
            policeChapterCaseNo: caseData?.policeStationCaseNumber || "",
            policeStationName: caseData?.policeStationId?.name || "",
            sections: caseData?.sections?.join(", ") || "",
            applicantName: applicant?.name || "",
            defendantsNames: defendants.map((d) => d.name).join(", "),
        },
    });

    const onSubmit = async (values: FormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        startTransition(async () => {
            try {
                const entry = {
                    date: values.date,
                    proceedings: values.proceedings,
                    nextDate: values.nextDate || undefined,
                    presentAccusedPersonIds: values.presentAccusedPersonIds,
                };

                const header = isFirstEntry
                    ? {
                        branchChapterCaseNo: values.branchChapterCaseNo,
                        policeChapterCaseNo: values.policeChapterCaseNo,
                        policeStationName: values.policeStationName,
                        sections: values.sections?.split(",").map((s) => s.trim()) || [],
                        applicant: values.applicantName,
                        defendants: values.defendantsNames?.split(",").map((d) => d.trim()) || [],
                    }
                    : undefined;

                const result = await addRoznamaEntryAction(caseId, entry, header as any);

                if (result.success) {
                    setSuccessMessage("Roznama entry added successfully!");

                    form.reset({
                        ...form.getValues(),
                        proceedings: "",
                        nextDate: "",
                        presentAccusedPersonIds: [],
                    });
                    if (onSuccess) onSuccess();
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    setErrorMessage(result.error || "Failed to add roznama entry");
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "An error occurred");
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-accent/20">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">Add Roznama Entry</h3>

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

            {isFirstEntry && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Roznama Header (Required for First Entry)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            control={form.control}
                            name="branchChapterCaseNo"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Branch Case No</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="policeChapterCaseNo"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Police Case No</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="policeStationName"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Police Station</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="sections"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Sections</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="applicantName"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Applicant</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="defendantsNames"
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Defendants</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                    </div>
                </div>
            )}

            <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="date"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Date *</FieldLabel>
                                <Input type="date" {...field} />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="nextDate"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Next Hearing Date</FieldLabel>
                                <Input type="date" {...field} />
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    control={form.control}
                    name="presentAccusedPersonIds"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Present Accused</FieldLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {defendants.map((d) => (
                                    <div key={d._id} className="flex items-center space-x-2 p-2 rounded border bg-gray-50 dark:bg-gray-900/50">
                                        <Checkbox
                                            id={`present-${d._id}`}
                                            checked={field.value?.includes(d._id)}
                                            onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                if (checked) {
                                                    field.onChange([...current, d._id]);
                                                } else {
                                                    field.onChange(current.filter((id) => id !== d._id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`present-${d._id}`} className="text-sm cursor-pointer">{d.name}</label>
                                    </div>
                                ))}
                            </div>
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="proceedings"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Proceedings (Marathi) *</FieldLabel>
                            <Textarea
                                {...field}
                                placeholder="उदा. आरोपी हजर. पुढील सुनावणीसाठी तारीख दिली."
                                rows={4}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                            )}
                        </Field>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Adding Entry..." : "Add Roznama Entry"}
                </Button>
            </FieldGroup>
        </form>
    );
}
