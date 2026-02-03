import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition } from "react";
import { createFinalOrder } from "@/lib/actions/createFinalOrder";
import { Textarea } from "@/components/ui/textarea";


const finalOrderSchema = z.object({
    hearingDate: z.string().min(1, "Hearing date is required"),
    outcomeType: z.enum(["BOND_ORDERED", "NEXT_HEARING", "CASE_CLOSED", "WARNING_ONLY"]),
    bondAmount: z.string().optional(),
    bondDurationMonths: z.string().optional(),
    suretyRequired: z.boolean(),
    suretyCount: z.string().optional(),
    nextHearingDate: z.string().optional(),
    nextHearingPlace: z.string().optional(),
    remarks: z.string().min(10, "Remarks must be at least 10 characters"),
});

type FinalOrderFormValues = z.infer<typeof finalOrderSchema>;

interface FinalOrderFormProps {
    caseId: string;
}

export function FinalOrderForm({ caseId }: FinalOrderFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<FinalOrderFormValues>({
        resolver: zodResolver(finalOrderSchema),
        defaultValues: {
            hearingDate: "",
            outcomeType: "BOND_ORDERED",
            bondAmount: "",
            bondDurationMonths: "",
            suretyRequired: false,
            suretyCount: "1",
            nextHearingDate: "",
            nextHearingPlace: "",
            remarks: "",
        },
    });

    const outcomeType = form.watch("outcomeType");
    const suretyRequired = form.watch("suretyRequired");

    const onSubmit = async (values: FinalOrderFormValues) => {
        setSuccessMessage(null);
        setErrorMessage(null);

        startTransition(async () => {
            try {
                const result = await createFinalOrder({
                    caseId,
                    formType: "FINAL_ORDER",
                    content: {
                        mr: {
                            hearingDate: values.hearingDate,
                            outcomeType: values.outcomeType,
                            outcome: {
                                bondAmount: values.bondAmount ? parseInt(values.bondAmount) : undefined,
                                bondDurationMonths: values.bondDurationMonths ? parseInt(values.bondDurationMonths) : undefined,
                                suretyRequired: values.suretyRequired,
                                suretyCount: values.suretyCount ? parseInt(values.suretyCount) : undefined,
                                nextHearingDate: values.nextHearingDate || undefined,
                                nextHearingPlace: values.nextHearingPlace || undefined,
                            },
                            remarks: values.remarks,
                        },
                    },
                });

                if (result.success) {
                    setSuccessMessage("Final order created successfully!");
                    form.reset();
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    setErrorMessage(result.error || "Failed to create order");
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
                    name="hearingDate"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Hearing Date *</FieldLabel>
                            <Input type="date" {...field} />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                            )}
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="outcomeType"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Outcome Type *</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BOND_ORDERED">Bond Ordered</SelectItem>
                                    <SelectItem value="NEXT_HEARING">Next Hearing</SelectItem>
                                    <SelectItem value="CASE_CLOSED">Case Closed</SelectItem>
                                    <SelectItem value="WARNING_ONLY">Warning Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />

                {outcomeType === "BOND_ORDERED" && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="bondAmount"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Bond Amount (₹)</FieldLabel>
                                        <Input type="number" {...field} placeholder="5000" />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="bondDurationMonths"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Duration (Months)</FieldLabel>
                                        <Input type="number" {...field} placeholder="6" />
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name="suretyRequired"
                            render={({ field }) => (
                                <Field>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="w-4 h-4"
                                        />
                                        <span>Surety Required</span>
                                    </label>
                                </Field>
                            )}
                        />

                        {suretyRequired && (
                            <Controller
                                control={form.control}
                                name="suretyCount"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Surety Count</FieldLabel>
                                        <Input type="number" {...field} placeholder="1" />
                                    </Field>
                                )}
                            />
                        )}
                    </>
                )}

                {outcomeType === "NEXT_HEARING" && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="nextHearingDate"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Next Hearing Date</FieldLabel>
                                        <Input type="date" {...field} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="nextHearingPlace"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Next Hearing Place</FieldLabel>
                                        <Input {...field} placeholder="रामनगर पोलीस ठाणे" />
                                    </Field>
                                )}
                            />
                        </div>
                    </>
                )}

                <Controller
                    control={form.control}
                    name="remarks"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Remarks (Marathi) *</FieldLabel>
                            <Textarea
                                {...field}
                                placeholder="आरोपीने आज सहकार्य केले."
                                rows={4}
                            />
                            {fieldState.error && (
                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                            )}
                        </Field>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creating..." : "Create Final Order"}
                </Button>
            </FieldGroup>
        </form>
    );
}