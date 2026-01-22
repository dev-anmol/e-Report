"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";

import {
    sectionOneApplicantSchema,
    SectionOneApplicantValues,
} from "@/types/section-1/sectionOneApplicantSchema";

import { createEmptyApplicant } from "@/utils/emptyApplicant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useState, useTransition } from "react";
import { UploadIcon } from "lucide-react";
import { createApplicant } from "@/lib/actions/createApplicant";

export default function ApplicantForm({ caseId }: { caseId: string }) {
    const [document, setDocument] = useState<File[] | undefined>();
    const [photo, setPhoto] = useState<File[] | undefined>();
    const [signature, setSignature] = useState<File[] | undefined>();
    const [isPending, startTransition] = useTransition();

    const handleDocument = (files: File[]) => {
        setDocument(files);
        if (files.length > 0) {
            form.setValue("applicant.document", files[0], { shouldValidate: true });
        }
    };

    const handlePhoto = (files: File[]) => {
        setPhoto(files);
        if (files.length > 0) {
            form.setValue("applicant.photo", files[0], { shouldValidate: true });
        }
    }

    const handleSignature = (files: File[]) => {
        setSignature(files);
        if (files.length > 0) {
            form.setValue("applicant.signature", files[0], { shouldValidate: true });
        }
    }

    const form = useForm<SectionOneApplicantValues>({
        resolver: zodResolver(sectionOneApplicantSchema),
        defaultValues: {
            caseId,
            applicant: createEmptyApplicant(),
        },
    });

    const onSubmit = async (values: SectionOneApplicantValues) => {
        // Prevent default focus behavior
        // const formElement = document.activeElement as HTMLElement;
        // if (formElement) {
        //     formElement.blur();
        // }

        startTransition(async () => {
            try {
                // Get files from state or form values
                const photoFile = photo?.[0] || values.applicant.photo;
                const signatureFile = signature?.[0] || values.applicant.signature;
                const documentFile = document?.[0] || values.applicant.document;

                if (!photoFile || !signatureFile || !documentFile) {
                    console.error("All files are required");
                    return;
                }

                const result = await createApplicant({
                    caseId: values.caseId,
                    name: values.applicant.Name,
                    age: values.applicant.age,
                    gender: values.applicant.gender,
                    mobile: values.applicant.mobile,
                    address: values.applicant.address,
                    role: values.applicant.role,
                    photo: photoFile,
                    signature: signatureFile,
                    document: documentFile,
                });

                if (result.success) {
                    console.log("Applicant created successfully:", result.data);
                    form.reset();
                    // Reset file states
                    setDocument(undefined);
                    setPhoto(undefined);
                    setSignature(undefined);
                } else {
                    console.error("Error creating applicant:", result.error);
                }
            } catch (error) {
                console.error("Unexpected error:", error);
            }
        });
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
            }}
            className="rounded-lg border border-accent p-6 shadow-md bg-white/50 dark:bg-accent/20"
        >
            <FieldGroup>
                <p className="font-normal text-2xl mb-4">Applicant Details</p>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="applicant.Name"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Name</FieldLabel>
                                <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="John" />
                                <FieldDescription>
                                    Enter Applicant's Name
                                </FieldDescription>
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="applicant.age"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Age</FieldLabel>
                                <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="25" />
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
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                        <SelectValue placeholder="Male" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
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
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Phone Number</FieldLabel>
                                <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="8888888888" />
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
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                        <SelectValue placeholder="Applicant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APPLICANT">Applicant</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
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
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Applicant Address</FieldLabel>

                                <Textarea
                                    className="border border-neutral-400/50 dark:border-accent"
                                    {...field}
                                    placeholder="New Delhi"
                                    onBlur={(e) => {
                                        field.onBlur();
                                        // Prevent auto-focus after validation
                                        e.currentTarget.blur();
                                    }}
                                />
                                <FieldDescription>
                                    Enter Applicant Address
                                </FieldDescription>
                            </Field>
                        )}
                    />

                </div>

                <FieldSeparator />


                <div className="grid grid-cols-3 gap-4">

                    <Controller
                        control={form.control}
                        name="applicant.document"
                        render={({ field }) => (
                            <Field>
                                <Dropzone maxFiles={1} onDrop={handleDocument} src={document} className="border border-neutral-400/50 dark:border-accent">
                                    <DropzoneEmptyState>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                <UploadIcon size={16} />
                                            </div>
                                            <p className="font-medium text-sm">Upload Applicant Document</p>
                                            <p className="text-xs text-muted-foreground">
                                                PDF only
                                            </p>
                                        </div>
                                    </DropzoneEmptyState>
                                    <DropzoneContent />
                                </Dropzone>
                            </Field>
                        )}
                    />


                    <Controller
                        control={form.control}
                        name="applicant.photo"
                        render={({ field }) => (
                            <Field>
                                <Dropzone maxFiles={1} onDrop={handlePhoto} src={photo} className="border border-neutral-400/50 dark:border-accent">
                                    <DropzoneEmptyState>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                <UploadIcon size={16} />
                                            </div>
                                            <p className="font-medium truncate text-sm">Upload Applicant Photo</p>
                                            <p className="text-xs text-muted-foreground">
                                                JPG / PNG only
                                            </p>
                                        </div>
                                    </DropzoneEmptyState>

                                    <DropzoneContent />
                                </Dropzone>
                            </Field>
                        )}
                    />

                    <Controller
                        control={form.control}
                        name="applicant.signature"
                        render={({ field }) => (
                            <Field>
                                <Dropzone maxFiles={1} onDrop={handleSignature} src={signature} className="border border-neutral-400/50 dark:border-accent">
                                    <DropzoneEmptyState>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                <UploadIcon size={16} />
                                            </div>
                                            <p className="font-medium truncate text-sm">Upload Applicant Signature</p>
                                            <p className="text-xs text-muted-foreground">
                                                JPG / PNG only
                                            </p>
                                        </div>
                                    </DropzoneEmptyState>

                                    <DropzoneContent />
                                </Dropzone>
                            </Field>
                        )}
                    />

                </div>

                <FieldSeparator />

                <Button type="submit" className="mt-4 w-fit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Applicant"}
                </Button>
            </FieldGroup>

        </form>
    );
}