"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sectionOneDefendantsSchema, SectionOneDefendantsValues } from "@/types/section-1/sectionOneDefendantSchema";
import { useState, useTransition, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon } from "lucide-react";
import { createDefendant } from "@/lib/actions/createDefendants";

type DefendantFiles = {
    document: File | null;
    photo: File | null;
    signature: File | null;
};

// Form values without file fields
type FormValues = Omit<SectionOneDefendantsValues, 'defendants'> & {
    defendants: Array<Omit<SectionOneDefendantsValues['defendants'][number], 'photo' | 'signature' | 'document'>>;
};

export default function DefendantsForm({ caseId }: { caseId: string }) {
    // Debug caseId
    useEffect(() => {
        console.log("DefendantsForm mounted with caseId:", caseId);
    }, [caseId]);

    // Separate file state for each defendant
    const [defendantFiles, setDefendantFiles] = useState<Record<number, DefendantFiles>>({});
    const [isPending, startTransition] = useTransition();
    const [successMessages, setSuccessMessages] = useState<Record<number, string>>({});
    const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});
    const [submittedDefendants, setSubmittedDefendants] = useState<Record<number, boolean>>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(sectionOneDefendantsSchema.omit({
            defendants: true
        }).extend({
            defendants: sectionOneDefendantsSchema.shape.defendants.element.omit({
                photo: true,
                signature: true,
                document: true
            }).array()
        })),
        defaultValues: {
            caseId: caseId || "",
            defendants: [{ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "DEFENDANT" }],
        },
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "defendants",
    });

    // Update caseId if it changes
    useEffect(() => {
        if (caseId) {
            form.setValue("caseId", caseId);
        }
    }, [caseId, form]);

    const handleFileChange = (index: number, fileType: 'document' | 'photo' | 'signature', files: File[]) => {
        if (files.length > 0) {
            console.log(`Defendant ${index} - ${fileType} selected:`, files[0].name);
            setDefendantFiles(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [fileType]: files[0]
                }
            }));
        }
    };

    const onSubmitDefendant = async (index: number) => {
        console.log(`=== Submitting Defendant ${index} ===`);

        const defendantData = form.getValues(`defendants.${index}`);
        const files = defendantFiles[index] || { document: null, photo: null, signature: null };

        console.log("Defendant data:", defendantData);
        console.log("Files:", {
            photo: files.photo?.name || "none",
            signature: files.signature?.name || "none",
            document: files.document?.name || "none"
        });

        // Validate defendant name
        if (!defendantData.Name || !defendantData.Name.trim()) {
            setErrorMessages(prev => ({ ...prev, [index]: 'Defendant name is required' }));
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
                console.log("Creating FormData for defendant...");
                const formData = new FormData();
                formData.append("caseId", caseId);
                formData.append("name", defendantData.Name);
                formData.append("age", defendantData.age);
                formData.append("gender", defendantData.gender);
                formData.append("mobile", defendantData.mobile);
                formData.append("address", defendantData.address);
                formData.append("role", "DEFENDANT");

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

                console.log("Calling createDefendant server action...");
                const result = await createDefendant(formData);
                console.log("Server action result:", result);

                if (result.success) {
                    console.log("✓ Defendant created successfully");
                    setSubmittedDefendants(prev => ({ ...prev, [index]: true }));
                    setSuccessMessages(prev => ({
                        ...prev,
                        [index]: `Defendant "${defendantData.Name}" saved successfully!`
                    }));

                    // Clear files for this defendant
                    setDefendantFiles(prev => ({
                        ...prev,
                        [index]: { document: null, photo: null, signature: null }
                    }));

                    // Auto-hide success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessages(prev => ({ ...prev, [index]: '' }));
                    }, 3000);
                } else {
                    const errorMsg = result.error || "Failed to save defendant";
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
        <div className="rounded-lg border border-accent p-6 shadow-2xs bg-white/50 dark:bg-accent/20">
            <FieldGroup>
                <h3 className="font-normal text-2xl mb-4">Defendant Details</h3>

                {/* Debug Info */}
                <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    <strong>Debug Info:</strong> Case ID = {caseId || "undefined"}
                </div>

                {fields.map((field, index) => {
                    const isSubmitted = submittedDefendants[index];

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
                                <h4 className="font-medium text-lg">Defendant #{index + 1}</h4>
                                {isSubmitted && (
                                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="text-base">✓</span> Saved
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.Name`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Defendant Name *</FieldLabel>
                                            <Input
                                                className="border border-neutral-400/50 dark:border-accent"
                                                {...fieldProps}
                                                placeholder="John Doe"
                                                disabled={isSubmitted}
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                            )}
                                            <FieldDescription>Enter Defendant Name</FieldDescription>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.age`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Defendant Age</FieldLabel>
                                            <Input
                                                className="border border-neutral-400/50 dark:border-accent"
                                                {...fieldProps}
                                                placeholder="25"
                                                disabled={isSubmitted}
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                            )}
                                            <FieldDescription>Enter Defendant Age</FieldDescription>
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.gender`}
                                    render={({ field: fieldProps }) => (
                                        <Field>
                                            <FieldLabel>Defendant Gender</FieldLabel>
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
                                    name={`defendants.${index}.mobile`}
                                    render={({ field: fieldProps, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Defendant Phone Number</FieldLabel>
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
                                name={`defendants.${index}.address`}
                                render={({ field: fieldProps, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Defendant Address</FieldLabel>
                                        <Textarea
                                            className="border border-neutral-400/50 dark:border-accent"
                                            {...fieldProps}
                                            placeholder="New Delhi"
                                            disabled={isSubmitted}
                                        />
                                        {fieldState.error && (
                                            <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                        )}
                                        <FieldDescription>Enter Defendant Address</FieldDescription>
                                    </Field>
                                )}
                            />

                            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                                <Field>
                                    <Dropzone
                                        maxFiles={1}
                                        onDrop={(files) => handleFileChange(index, 'document', files)}
                                        src={defendantFiles[index]?.document ? [defendantFiles[index].document!] : undefined}
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
                                        src={defendantFiles[index]?.photo ? [defendantFiles[index].photo!] : undefined}
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
                                        src={defendantFiles[index]?.signature ? [defendantFiles[index].signature!] : undefined}
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
                                        console.log(`Save button clicked for defendant ${index}`);
                                        onSubmitDefendant(index);
                                    }}
                                    disabled={isPending || isSubmitted}
                                    className="w-fit"
                                >
                                    {isPending ? "Saving..." : isSubmitted ? "Saved ✓" : "Save This Defendant"}
                                </Button>

                                {fields.length > 1 && !isSubmitted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            remove(index);
                                            // Clean up state for this index
                                            setDefendantFiles(prev => {
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
                                            setSubmittedDefendants(prev => {
                                                const newSubmitted = { ...prev };
                                                delete newSubmitted[index];
                                                return newSubmitted;
                                            });
                                        }}
                                        disabled={isPending}
                                    >
                                        Remove Defendant
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                <Button
                    type="button"
                    onClick={() => append({ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "DEFENDANT" })}
                    className="w-fit"
                    disabled={isPending}
                >
                    + Add Another Defendant
                </Button>
            </FieldGroup>
        </div>
    );
}