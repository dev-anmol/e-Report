"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    sectionOneDefendantsSchema,
    SectionOneDefendantsValues,
} from "@/types/section-1/sectionOneDefendantSchema";

import { createEmptyDefendant } from "@/utils/emptyDefendant";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon, CheckCircle, Trash2, Plus } from "lucide-react";

// Interface for the person data from API
interface DefendantData {
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

export default function DefendantsForm({ caseId }: { caseId: string }) {
    const [document, setDocument] = useState<File[] | undefined>();
    const [photo, setPhoto] = useState<File[] | undefined>();
    const [signature, setSignature] = useState<File[] | undefined>();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [existingDefendants, setExistingDefendants] = useState<DefendantData[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch existing defendants on mount and when refreshKey changes
    useEffect(() => {
        const fetchDefendants = async () => {
            try {
                const response = await fetch(`/api/cases/${caseId}/defendant`);
                const result = await response.json();
                if (result.success && result.data) {
                    setExistingDefendants(result.data);
                }
            } catch (error) {
                console.error("Error fetching defendants:", error);
            }
        };
        fetchDefendants();
    }, [caseId, refreshKey]);

    const handleDocument = (files: File[]) => {
        setDocument(files);
    };

    const handlePhoto = (files: File[]) => {
        setPhoto(files);
    }

    const handleSignature = (files: File[]) => {
        setSignature(files);
    }

    const form = useForm<SectionOneDefendantsValues>({
        resolver: zodResolver(sectionOneDefendantsSchema),
        defaultValues: {
            caseId,
            defendants: [createEmptyDefendant()],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "defendants",
    });

    const onSubmit = async (values: SectionOneDefendantsValues) => {
        setLoading(true);
        setMessage(null);

        try {
            // Save each defendant one by one
            for (const defendant of values.defendants) {
                const response = await fetch(`/api/cases/${caseId}/defendant`, {
                    method: "POST",
                    body: JSON.stringify({ defendant }),
                });

                const result = await response.json();

                if (!result.success) {
                    setMessage({ type: "error", text: result.error || "Failed to save defendant" });
                    setLoading(false);
                    return;
                }
            }

            setMessage({ type: "success", text: `${values.defendants.length} defendant(s) saved successfully!` });
            // Reset form and refresh existing defendants list
            form.reset();
            setDocument(undefined);
            setPhoto(undefined);
            setSignature(undefined);
            append(createEmptyDefendant());
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred while saving" });
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Existing Defendants - Read Only */}
            {existingDefendants.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-lg text-red-700 dark:text-red-300">
                        Already Submitted Defendants ({existingDefendants.length})
                    </h4>
                    <div className="grid gap-4">
                        {existingDefendants.map((defendant) => (
                            <div
                                key={defendant._id}
                                className="rounded-lg border border-red-200 dark:border-red-800 p-4 bg-red-50/50 dark:bg-red-950/30"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-medium">{defendant.name}</span>
                                        <span className="text-sm text-gray-500">
                                            ({defendant.age} years, {defendant.gender})
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {defendant.mobile && (
                                        <p><span className="text-gray-500">Phone:</span> {defendant.mobile}</p>
                                    )}
                                    {defendant.address && (
                                        <p className="col-span-2"><span className="text-gray-500">Address:</span> {defendant.address}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {defendant.files?.photo && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                            Photo ✓
                                        </span>
                                    )}
                                    {defendant.files?.signature && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                            Signature ✓
                                        </span>
                                    )}
                                    {defendant.files?.document && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                            Document ✓
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    Submitted: {new Date(defendant.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Defendant Form */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="rounded-lg border border-accent p-6 shadow-sm bg-white/50 dark:bg-accent/10"
            >
                <FieldGroup>
                    <h3 className="font-normal text-2xl mb-4">Add New Defendant</h3>

                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 border-b pb-6 mb-6 last:border-0">
                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.Name`}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Defendant Name</FieldLabel>
                                            <Input {...field} placeholder="John" />
                                            <FieldDescription>
                                                Enter Defendant Name
                                            </FieldDescription>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.age`}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Defendant Age</FieldLabel>
                                            <Input {...field} placeholder="25" />
                                            <FieldDescription>
                                                Defendant Age
                                            </FieldDescription>
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name={`defendants.${index}.gender`}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Defendant Gender</FieldLabel>
                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
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
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Defendant Phone Number</FieldLabel>
                                            <Input {...field} placeholder="8888888888" />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Field>
                                <FieldLabel>Defendant Address</FieldLabel>
                                <Textarea {...field} placeholder="New Delhi" />
                                <FieldDescription>
                                    Enter Defendant Address
                                </FieldDescription>
                            </Field>

                            <div className="grid grid-cols-3 gap-4">

                                <Controller
                                    control={form.control ?? ""}
                                    name={`defendants.${index}.document`}
                                    render={({ field }) => (
                                        <Field>
                                            <Dropzone maxFiles={1} onDrop={handleDocument} src={document}>
                                                <DropzoneEmptyState>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                            <UploadIcon size={16} />
                                                        </div>
                                                        <p className="font-medium text-sm">Upload Document</p>
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
                                    name={`defendants.${index}.photo`}
                                    render={({ field }) => (
                                        <Field>
                                            <Dropzone maxFiles={1} onDrop={handlePhoto} src={photo}>
                                                <DropzoneEmptyState>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                            <UploadIcon size={16} />
                                                        </div>
                                                        <p className="font-medium truncate text-sm">Upload Photo</p>
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
                                name={`defendants.${index}.signature`}
                                render={({ field }) => (
                                    <Field>
                                        <Dropzone maxFiles={1} onDrop={handleSignature} src={signature}>
                                            <DropzoneEmptyState>
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                        <UploadIcon size={16} />
                                                    </div>
                                                    <p className="font-medium truncate text-sm">Upload Signature</p>
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

                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}


                    <div className="flex gap-4 items-center flex-wrap">
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

                        <Button type="submit" className="w-fit" disabled={loading}>
                            {loading ? "Saving..." : "Save Defendants"}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => append(createEmptyDefendant())}
                            className="w-fit"
                            disabled={loading}
                            variant="outline"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another
                        </Button>
                    </div>

                </FieldGroup>
            </form>
        </div>
    );
}

