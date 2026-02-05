"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sectionOneWitnessSchema, SectionOneWitenessValues } from "@/types/section-1/sectionOneWitnessSchema";
import { useState, useTransition, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon } from "lucide-react";
import { createWitness } from "@/lib/actions/createWitness";

type WitnessFiles = {
    document: File | null;
    photo: File | null;
    signature: File | null;
};

// Form values without file fields
type FormValues = Omit<SectionOneWitenessValues, 'witnesses'> & {
    witnesses: Array<Omit<SectionOneWitenessValues['witnesses'][number], 'photo' | 'signature' | 'document'>>;
};

import { Person } from "@/lib/actions/cases";

export default function WitnessesForm({ caseId, existingWitnesses }: { caseId: string, existingWitnesses?: Person[] }) {
    // Debug caseId
    useEffect(() => {
        console.log("WitnessesForm mounted with caseId:", caseId);
    }, [caseId]);

    // Separate file state for each witness
    const [witnessFiles, setWitnessFiles] = useState<Record<number, WitnessFiles>>({});
    const [isPending, startTransition] = useTransition();
    const [successMessages, setSuccessMessages] = useState<Record<number, string>>({});
    const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});
    const [submittedWitnesses, setSubmittedWitnesses] = useState<Record<number, boolean>>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(sectionOneWitnessSchema.omit({
            witnesses: true
        }).extend({
            witnesses: sectionOneWitnessSchema.shape.witnesses.element.omit({
                photo: true,
                signature: true,
                document: true
            }).array()
        })),
        defaultValues: {
            caseId: caseId || "",
            witnesses: [{ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "WITNESS" }],
        },
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "witnesses",
    });

    useEffect(() => {
        if (existingWitnesses && existingWitnesses.length > 0) {
            console.log("Prefilling witnesses form with:", existingWitnesses);

            const formattedWitnesses = existingWitnesses.map(w => ({
                Name: w.name,
                age: w.age?.toString() || "",
                gender: (w.gender === "M" ? "MALE" : w.gender === "F" ? "FEMALE" : "OTHER") as any,
                mobile: w.mobile || "",
                address: w.address || "",
                role: "WITNESS" as const
            }));

            // Reset form with existing data
            form.reset({
                caseId,
                witnesses: formattedWitnesses
            });

            // Mark all existing as submitted
            const submittedState: Record<number, boolean> = {};
            existingWitnesses.forEach((_, index) => {
                submittedState[index] = true;
            });
            setSubmittedWitnesses(submittedState);
        }
    }, [existingWitnesses, caseId, form]);

    // Update caseId if it changes
    useEffect(() => {
        if (caseId) {
            form.setValue("caseId", caseId);
        }
    }, [caseId, form]);

    const handleFileChange = (index: number, fileType: 'document' | 'photo' | 'signature', files: File[]) => {
        if (files.length > 0) {
            console.log(`Witness ${index} - ${fileType} selected:`, files[0].name);
            setWitnessFiles(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [fileType]: files[0]
                }
            }));
        }
    };

    const onSubmitWitness = async (index: number) => {
        console.log(`=== Submitting Witness ${index} ===`);

        const witnessData = form.getValues(`witnesses.${index}`);
        const files = witnessFiles[index] || { document: null, photo: null, signature: null };

        console.log("Witness data:", witnessData);
        console.log("Files:", {
            photo: files.photo?.name || "none",
            signature: files.signature?.name || "none",
            document: files.document?.name || "none"
        });

        // Validate witness name (optional field, but if filling out, name should be present)
        if (witnessData.Name && !witnessData.Name.trim()) {
            setErrorMessages(prev => ({ ...prev, [index]: 'Witness name cannot be empty if provided' }));
            return;
        }

        // Validate caseId
        if (!caseId || caseId.trim() === "") {
            setErrorMessages(prev => ({ ...prev, [index]: 'Case ID is missing. Please refresh the page.' }));
            return;
        }

        setErrorMessages(prev => ({ ...prev, [index]: '' }));
        setSuccessMessages(prev => ({ ...prev, [index]: '' }));

        startTransition(async () => {
            try {
                console.log("Creating FormData for witness...");
                const formData = new FormData();
                formData.append("caseId", caseId);
                formData.append("name", witnessData.Name);
                formData.append("age", witnessData.age);
                formData.append("gender", witnessData.gender);
                formData.append("mobile", witnessData.mobile);
                formData.append("address", witnessData.address);
                formData.append("role", "WITNESS");

                if (files.photo) {
                    formData.append("photo", files.photo);
                    console.log("Photo appended");
                }
                if (files.signature) {
                    formData.append("signature", files.signature);
                    console.log("Signature appended");
                }
                if (files.document) {
                    formData.append("document", files.document);
                    console.log("Document appended");
                }

                console.log("Calling createWitness server action...");
                const result = await createWitness(formData);
                console.log("Server action result:", result);

                if (result.success) {
                    console.log("✓ Witness created successfully");
                    setSubmittedWitnesses(prev => ({ ...prev, [index]: true }));
                    setSuccessMessages(prev => ({
                        ...prev,
                        [index]: `Witness "${witnessData.Name || 'Anonymous'}" saved successfully!`
                    }));

                    // Clear files for this witness
                    setWitnessFiles(prev => ({
                        ...prev,
                        [index]: { document: null, photo: null, signature: null }
                    }));

                    // Auto-hide success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessages(prev => ({ ...prev, [index]: '' }));
                    }, 3000);
                } else {
                    const errorMsg = result.error || "Failed to save witness";
                    setErrorMessages(prev => ({ ...prev, [index]: errorMsg }));
                    console.error("✗ Server action failed:", errorMsg);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "An error occurred";
                setErrorMessages(prev => ({ ...prev, [index]: errorMsg }));
                console.error("✗ Unexpected error:", error);
            }
        });
    };

    // Check if caseId is missing
    if (!caseId) {
        return (
            <div className="rounded-lg border border-red-500 p-6 shadow-md bg-red-50 dark:bg-red-900/20">
                <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded flex items-center gap-2">
                    <span className="text-xl">✕</span>
                    <span>Error: Case ID is missing. Please go back and select a case.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-accent p-6 shadow-2xs bg-white/50 backdrop-blur-sm dark:bg-accent/20">
            <FieldGroup>
                <p className="font-normal text-2xl mb-4">
                    Witness Details <span className="text-neutral-400">(optional)</span>
                </p>

                {/* Debug Info */}
                <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    <strong>Debug Info:</strong> Case ID = {caseId || "undefined"}
                </div>

                {fields.map((field, index) => {
                    const isSubmitted = submittedWitnesses[index];

                    return (
                        <div key={field.id} className="space-y-4 border-b pb-6 mb-6 last:border-b-0">
                            {successMessages[index] && (
                                <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded flex items-center gap-2">
                                    <span className="text-xl">✓</span>
                                    <span>{successMessages[index]}</span>
                                </div>
                            )}
                            {errorMessages[index] && (
                                <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded flex items-center gap-2">
                                    <span className="text-xl">✕</span>
                                    <span>{errorMessages[index]}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-lg">Witness #{index + 1}</h4>
                                {isSubmitted && (
                                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="text-base">✓</span> Saved
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`witnesses.${index}.Name`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Witness Name</FieldLabel>
                                            <Input
                                                className="border border-neutral-400/50 dark:border-accent"
                                                {...fieldProps}
                                                placeholder="John Doe"
                                                disabled={isSubmitted}
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                            )}
                                            <FieldDescription>Enter Witness's Name</FieldDescription>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name={`witnesses.${index}.age`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Witness Age</FieldLabel>
                                            <Input
                                                className="border border-neutral-400/50 dark:border-accent"
                                                {...fieldProps}
                                                placeholder="25"
                                                disabled={isSubmitted}
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                            )}
                                            <FieldDescription>Enter Witness's Age</FieldDescription>
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`witnesses.${index}.gender`}
                                    render={({ field: fieldProps }) => (
                                        <Field>
                                            <FieldLabel>Witness Gender</FieldLabel>
                                            <Select
                                                value={fieldProps.value}
                                                onValueChange={fieldProps.onChange}
                                                disabled={isSubmitted}
                                            >
                                                <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name={`witnesses.${index}.mobile`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Witness Phone Number</FieldLabel>
                                            <Input
                                                className="border border-neutral-400/50 dark:border-accent"
                                                {...fieldProps}
                                                placeholder="8888888888"
                                                disabled={isSubmitted}
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                control={form.control}
                                name={`witnesses.${index}.address`}
                                render={({ field: fieldProps, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Witness Address</FieldLabel>
                                        <Textarea
                                            className="border border-neutral-400/50 dark:border-accent"
                                            {...fieldProps}
                                            placeholder="New Delhi"
                                            disabled={isSubmitted}
                                        />
                                        {fieldState.error && (
                                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                        )}
                                        <FieldDescription>Enter Witness Address</FieldDescription>
                                    </Field>
                                )}
                            />

                            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                <Field>
                                    <Dropzone
                                        maxFiles={1}
                                        onDrop={(files) => handleFileChange(index, 'document', files)}
                                        src={witnessFiles[index]?.document ? [witnessFiles[index].document!] : undefined}
                                        className="border border-neutral-400/50 dark:border-accent"
                                        disabled={isSubmitted}
                                    >
                                        <DropzoneEmptyState>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <UploadIcon size={16} />
                                                </div>
                                                <p className="font-medium text-sm">Upload Document</p>
                                                <p className="text-xs text-muted-foreground">PDF only</p>
                                            </div>
                                        </DropzoneEmptyState>
                                        <DropzoneContent />
                                    </Dropzone>
                                </Field>

                                <Field>
                                    <Dropzone
                                        maxFiles={1}
                                        onDrop={(files) => handleFileChange(index, 'photo', files)}
                                        src={witnessFiles[index]?.photo ? [witnessFiles[index].photo!] : undefined}
                                        className="border border-neutral-400/50 dark:border-accent"
                                        disabled={isSubmitted}
                                    >
                                        <DropzoneEmptyState>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <UploadIcon size={16} />
                                                </div>
                                                <p className="font-medium text-sm">Upload Photo</p>
                                                <p className="text-xs text-muted-foreground">JPG / PNG only</p>
                                            </div>
                                        </DropzoneEmptyState>
                                        <DropzoneContent />
                                    </Dropzone>
                                </Field>

                                <Field>
                                    <Dropzone
                                        maxFiles={1}
                                        onDrop={(files) => handleFileChange(index, 'signature', files)}
                                        src={witnessFiles[index]?.signature ? [witnessFiles[index].signature!] : undefined}
                                        className="border border-neutral-400/50 dark:border-accent"
                                        disabled={isSubmitted}
                                    >
                                        <DropzoneEmptyState>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <UploadIcon size={16} />
                                                </div>
                                                <p className="font-medium text-sm">Upload Signature</p>
                                                <p className="text-xs text-muted-foreground">JPG / PNG only</p>
                                            </div>
                                        </DropzoneEmptyState>
                                        <DropzoneContent />
                                    </Dropzone>
                                </Field>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        console.log(`Save button clicked for witness ${index}`);
                                        onSubmitWitness(index);
                                    }}
                                    disabled={isPending || isSubmitted}
                                    className="w-fit"
                                >
                                    {isPending ? "Saving..." : isSubmitted ? "Saved ✓" : "Save This Witness"}
                                </Button>

                                {fields.length > 1 && !isSubmitted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            remove(index);
                                            // Clean up state for this index
                                            setWitnessFiles(prev => {
                                                const newFiles = { ...prev };
                                                delete newFiles[index];
                                                return newFiles;
                                            });
                                            setSuccessMessages(prev => {
                                                const newMessages = { ...prev };
                                                delete newMessages[index];
                                                return newMessages;
                                            });
                                            setErrorMessages(prev => {
                                                const newMessages = { ...prev };
                                                delete newMessages[index];
                                                return newMessages;
                                            });
                                            setSubmittedWitnesses(prev => {
                                                const newSubmitted = { ...prev };
                                                delete newSubmitted[index];
                                                return newSubmitted;
                                            });
                                        }}
                                        disabled={isPending}
                                    >
                                        Remove Witness
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                <Button
                    type="button"
                    onClick={() => append({ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "WITNESS" })}
                    className="w-fit"
                    disabled={isPending}
                >
                    + Add Another Witness
                </Button>
            </FieldGroup>
        </div>
    );
}