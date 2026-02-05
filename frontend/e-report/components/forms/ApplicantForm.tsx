"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";

import {
    sectionOneApplicantSchema,
    SectionOneApplicantValues,
} from "@/types/section-1/sectionOneApplicantSchema";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useEffect, useState, useTransition } from "react";
import { UploadIcon } from "lucide-react";
import { createApplicant } from "@/lib/actions/createApplicant";

// Updated schema type without File fields
type FormValues = Omit<SectionOneApplicantValues, 'applicant'> & {
    applicant: Omit<SectionOneApplicantValues['applicant'], 'photo' | 'signature' | 'document'>;
};

import { Person } from "@/lib/actions/cases";

export default function ApplicantForm({ caseId, existingApplicant }: { caseId: string, existingApplicant?: Person }) {
    const router = useRouter();
    // File states - kept separate from form
    const [document, setDocument] = useState<File | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [signature, setSignature] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);


    useEffect(() => {
        if (existingApplicant) {
            console.log("Prefilling applicant form with:", existingApplicant);
            setIsSubmitted(true);
            setSuccessMessage(`Applicant "${existingApplicant.name}" details loaded.`);

            form.reset({
                caseId,
                applicant: {
                    name: existingApplicant.name,
                    age: existingApplicant.age?.toString() || "",
                    gender: (existingApplicant.gender === "M" ? "MALE" : existingApplicant.gender === "F" ? "FEMALE" : "OTHER") as any,
                    mobile: existingApplicant.mobile || "",
                    address: existingApplicant.address || "",
                    role: "APPLICANT"
                }
            });
        }
    }, [existingApplicant, caseId]);

    const handleDocument = (files: File[]) => {
        if (files.length > 0) {
            setDocument(files[0]);
            console.log("Document selected:", files[0].name);
        }
    };

    const handlePhoto = (files: File[]) => {
        if (files.length > 0) {
            setPhoto(files[0]);
            console.log("Photo selected:", files[0].name);
        }
    };

    const handleSignature = (files: File[]) => {
        if (files.length > 0) {
            setSignature(files[0]);
            console.log("Signature selected:", files[0].name);
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(sectionOneApplicantSchema.omit({
            applicant: true
        }).extend({
            applicant: sectionOneApplicantSchema.shape.applicant.omit({
                photo: true,
                signature: true,
                document: true
            })
        })),
        defaultValues: {
            caseId,
            applicant: {
                name: "",
                age: "",
                gender: "MALE",
                mobile: "",
                address: "",
                role: "APPLICANT",
            },
        },
        mode: "onChange", // Enable validation on change
    });

    const onSubmit = async (values: FormValues) => {
        console.log("=== FORM SUBMISSION STARTED ===");
        console.log("Form values:", values);

        setFormError(null);
        setSuccessMessage(null);

        // Validate at least name is provided
        if (!values.applicant.name.trim()) {
            setFormError("Applicant name is required");
            console.error("Validation failed: Name is required");
            return;
        }

        console.log("Starting transition...");

        startTransition(async () => {
            try {
                console.log("Inside transition - preparing FormData");
                console.log("Files to upload:", {
                    photo: photo?.name || "none",
                    signature: signature?.name || "none",
                    document: document?.name || "none"
                });

                // Create FormData to send to server action
                const formData = new FormData();
                formData.append("caseId", values.caseId);
                formData.append("name", values.applicant.name);
                formData.append("age", values.applicant.age);
                formData.append("gender", values.applicant.gender);
                formData.append("mobile", values.applicant.mobile);
                formData.append("address", values.applicant.address);
                formData.append("role", values.applicant.role);

                // Add files if they exist (optional)
                if (photo) {
                    formData.append("photo", photo);
                    console.log("Photo appended to FormData");
                }
                if (signature) {
                    formData.append("signature", signature);
                    console.log("Signature appended to FormData");
                }
                if (document) {
                    formData.append("document", document);
                    console.log("Document appended to FormData");
                }

                console.log("Calling createApplicant server action...");
                const result = await createApplicant(formData);
                console.log("Server action result:", result);

                if (result.success) {
                    console.log("✓ Applicant created successfully:", result.data);
                    setIsSubmitted(true);
                    setSuccessMessage(`Applicant "${values.applicant.name}" saved successfully!`);

                    // Optional: Reset file states
                    setPhoto(null);
                    setSignature(null);
                    setDocument(null);
                } else {
                    const errorMsg = result.error || "Failed to save applicant";
                    setFormError(errorMsg);
                    console.error("✗ Server action failed:", errorMsg);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
                setFormError(errorMsg);
                console.error("✗ Unexpected error in transition:", error);
            }
        });
    };

    // Add this to debug form state
    console.log("Form state:", {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        isPending,
        isSubmitted
    });

    return (
        <form
            onSubmit={(e) => {
                console.log("=== FORM onSubmit EVENT FIRED ===");
                e.preventDefault();
                console.log("Form validation errors:", form.formState.errors);
                form.handleSubmit(onSubmit)(e);
            }}
            className="rounded-lg border border-accent p-6 shadow-md bg-white/50 dark:bg-accent/20"
        >
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded flex items-center gap-2">
                    <span className="text-xl">✓</span>
                    <span>{successMessage}</span>
                </div>
            )}
            {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded flex items-center gap-2">
                    <span className="text-xl">✕</span>
                    <span>{formError}</span>
                </div>
            )}

            {/* Display form validation errors */}
            {Object.keys(form.formState.errors).length > 0 && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100 rounded">
                    <p className="font-semibold">Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-2">
                        {Object.entries(form.formState.errors).map(([key, error]) => (
                            <li key={key}>{error?.message?.toString() || `Error in ${key}`}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FieldGroup>
                <p className="font-normal text-2xl mb-4">Applicant Details</p>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="applicant.name"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Applicant Name *</FieldLabel>
                                <Input
                                    disabled={isSubmitted}
                                    className="border border-neutral-400/50 dark:border-accent"
                                    {...field}
                                    placeholder="John"
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                                <FieldDescription>
                                    Enter Applicant's Name
                                </FieldDescription>
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="applicant.age"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Applicant Age</FieldLabel>
                                <Input
                                    disabled={isSubmitted}
                                    className="border border-neutral-400/50 dark:border-accent"
                                    {...field}
                                    placeholder="25"
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                                <FieldDescription>
                                    Enter Applicant's Age
                                </FieldDescription>
                            </Field>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                    <Controller
                        control={form.control}
                        name="applicant.gender"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Gender</FieldLabel>
                                <Select
                                    disabled={isSubmitted}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                        <SelectValue placeholder="Male" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key="MALE" value="MALE">Male</SelectItem>
                                        <SelectItem key="FEMALE" value="FEMALE">Female</SelectItem>
                                        <SelectItem key="OTHER" value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    Enter Applicant Gender
                                </FieldDescription>
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="applicant.mobile"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Applicant Phone Number</FieldLabel>
                                <Input
                                    disabled={isSubmitted}
                                    className="border border-neutral-400/50 dark:border-accent"
                                    {...field}
                                    placeholder="8888888888"
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                                <FieldDescription>
                                    Enter Mobile Number
                                </FieldDescription>
                            </Field>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Controller
                        control={form.control}
                        name="applicant.role"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Role</FieldLabel>
                                <Select
                                    disabled={isSubmitted}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                        <SelectValue placeholder="Applicant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key="APPLICANT" value="APPLICANT">Applicant</SelectItem>
                                        <SelectItem key="OTHER" value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    Enter Applicant Role
                                </FieldDescription>
                            </Field>
                        )}
                    />

                    <FieldSeparator />

                    <Controller
                        control={form.control}
                        name="applicant.address"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Applicant Address</FieldLabel>
                                <Textarea
                                    disabled={isSubmitted}
                                    className="border border-neutral-400/50 dark:border-accent"
                                    {...field}
                                    placeholder="New Delhi"
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                )}
                                <FieldDescription>
                                    Enter Applicant Address
                                </FieldDescription>
                            </Field>
                        )}
                    />
                </div>

                <FieldSeparator />

                <div className="grid md:grid-cols-3 gap-4 grid-cols-1 ">
                    <Field>
                        <Dropzone
                            disabled={isSubmitted}
                            maxFiles={1}
                            onDrop={handleDocument}
                            src={document ? [document] : undefined}
                            className="border border-neutral-400/50 dark:border-accent"
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
                            disabled={isSubmitted}
                            maxFiles={1}
                            onDrop={handlePhoto}
                            src={photo ? [photo] : undefined}
                            className="border border-neutral-400/50 dark:border-accent"
                        >
                            <DropzoneEmptyState>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <UploadIcon size={16} />
                                    </div>
                                    <p className="font-medium truncate text-sm">Upload Photo</p>
                                    <p className="text-xs text-muted-foreground">JPG / PNG only</p>
                                </div>
                            </DropzoneEmptyState>
                            <DropzoneContent />
                        </Dropzone>
                    </Field>

                    <Field>
                        <Dropzone
                            disabled={isSubmitted}
                            maxFiles={1}
                            onDrop={handleSignature}
                            src={signature ? [signature] : undefined}
                            className="border border-neutral-400/50 dark:border-accent"
                        >
                            <DropzoneEmptyState>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <UploadIcon size={16} />
                                    </div>
                                    <p className="font-medium truncate text-sm">Upload Signature</p>
                                    <p className="text-xs text-muted-foreground">JPG / PNG only</p>
                                </div>
                            </DropzoneEmptyState>
                            <DropzoneContent />
                        </Dropzone>
                    </Field>
                </div>

                <FieldSeparator />

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        className="mt-4 w-fit"
                        disabled={isPending || isSubmitted}
                        onClick={() => console.log("Button clicked, isPending:", isPending, "isSubmitted:", isSubmitted)}
                    >
                        {isPending ? "Saving..." : isSubmitted ? "Saved ✓" : "Save Applicant"}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4 w-fit"
                        onClick={() => router.push(`/reports/${caseId}`)}
                    >
                        Go to Forms →
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}