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
    FieldSeparator,
} from "@/components/ui/field";

import {
    sectionOneApplicantSchema,
    SectionOneApplicantValues,
} from "@/types/section-1/sectionOneApplicantSchema";

import { createEmptyApplicant } from "@/utils/emptyApplicant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useState, useEffect } from "react";
import { UploadIcon, CheckCircle, Edit } from "lucide-react";

// Interface for the person data from API
interface PersonData {
    _id: string;
    name: string;
    role: string;
    age?: number;
    gender?: string;
    mobile?: string;
    address?: string;
    files?: {
        photo?: string;
        signature?: string;
        document?: string;
    };
    createdAt: string;
}

export default function ApplicantForm({ caseId }: { caseId: string }) {
    const [document, setDocument] = useState<File[] | undefined>();
    const [photo, setPhoto] = useState<File[] | undefined>();
    const [signature, setSignature] = useState<File[] | undefined>();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [existingApplicant, setExistingApplicant] = useState<PersonData | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch existing applicant on mount
    useEffect(() => {
        const fetchApplicant = async () => {
            try {
                const response = await fetch(`/api/cases/${caseId}/applicant`);
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    setExistingApplicant(result.data[0]);
                }
            } catch (error) {
                console.error("Error fetching applicant:", error);
            }
        };
        fetchApplicant();
    }, [caseId]);

    const handleDocument = (files: File[]) => {
        setDocument(files);
    };

    const handlePhoto = (files: File[]) => {
        setPhoto(files);
    }

    const handleSignature = (files: File[]) => {
        setSignature(files);
    }

    const form = useForm<SectionOneApplicantValues>({
        resolver: zodResolver(sectionOneApplicantSchema),
        defaultValues: {
            caseId,
            applicant: createEmptyApplicant(),
        },
    });

    const onSubmit = async (values: SectionOneApplicantValues) => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/cases/${caseId}/applicant`, {
                method: "POST",
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: "success", text: "Applicant saved successfully!" });
                // Fetch the created applicant
                const fetchResponse = await fetch(`/api/cases/${caseId}/applicant`);
                const fetchResult = await fetchResponse.json();
                if (fetchResult.success && fetchResult.data && fetchResult.data.length > 0) {
                    setExistingApplicant(fetchResult.data[0]);
                    setIsEditing(false);
                }
            } else {
                setMessage({ type: "error", text: result.error || "Failed to save applicant" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred while saving" });
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // If applicant exists and not editing, show read-only view
    if (existingApplicant && !isEditing) {
        return (
            <div className="rounded-lg border border-blue-300 p-6 shadow-md bg-blue-50/50 dark:bg-blue-950/30">
                <FieldGroup>
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-normal text-2xl text-blue-700 dark:text-blue-300">Applicant Details</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Applicant Name</FieldLabel>
                            <Input value={existingApplicant.name} disabled className="bg-white" />
                        </Field>
                        <Field>
                            <FieldLabel>Applicant Age</FieldLabel>
                            <Input value={existingApplicant.age || ""} disabled className="bg-white" />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-start">
                        <Field>
                            <FieldLabel>Applicant Gender</FieldLabel>
                            <Input value={existingApplicant.gender || ""} disabled className="bg-white" />
                        </Field>
                        <Field>
                            <FieldLabel>Applicant Phone Number</FieldLabel>
                            <Input value={existingApplicant.mobile || ""} disabled className="bg-white" />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel>Applicant Address</FieldLabel>
                        <Textarea value={existingApplicant.address || ""} disabled className="bg-white" />
                    </Field>

                    {existingApplicant.files && (existingApplicant.files.photo || existingApplicant.files.signature || existingApplicant.files.document) && (
                        <>
                            <FieldSeparator />
                            <div className="grid grid-cols-3 gap-4">
                                {existingApplicant.files.document && (
                                    <Field>
                                        <FieldLabel>Document</FieldLabel>
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-700 dark:text-green-300">Document Uploaded</span>
                                        </div>
                                    </Field>
                                )}
                                {existingApplicant.files.photo && (
                                    <Field>
                                        <FieldLabel>Photo</FieldLabel>
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-700 dark:text-green-300">Photo Uploaded</span>
                                        </div>
                                    </Field>
                                )}
                                {existingApplicant.files.signature && (
                                    <Field>
                                        <FieldLabel>Signature</FieldLabel>
                                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-700 dark:text-green-300">Signature Uploaded</span>
                                        </div>
                                    </Field>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 dark:text-green-100 font-medium">
                            Submitted on {new Date(existingApplicant.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </FieldGroup>
            </div>
        );
    }

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border border-accent p-6 shadow-md bg-white/50 dark:bg-accent/20"
        >
            <FieldGroup>
                <p className="font-normal text-2xl mb-4">Applicant Details</p>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={form.control}
                        name="applicant.name"
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
                                        <SelectItem value="Applicant">Applicant</SelectItem>
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

                                <Textarea className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="New Delhi" />
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
                        control={form.control ?? ""}
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
                        control={form.control ?? ""}
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
                        control={form.control ?? ""}
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

                {/* Success/Error Message */}
                {message && (
                    <div className={`p-3 rounded-lg ${
                        message.type === "success" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100" 
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                    }`}>
                        {message.text}
                    </div>
                )}

                <Button type="submit" className="mt-4 w-fit" disabled={loading}>
                    {loading ? "Saving..." : "Save Applicant"}
                </Button>
            </FieldGroup>

        </form>
    );
}

