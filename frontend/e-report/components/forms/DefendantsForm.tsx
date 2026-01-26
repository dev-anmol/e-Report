"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sectionOneDefendantsSchema, SectionOneDefendantsValues } from "@/types/section-1/sectionOneDefendantSchema";
import { createEmptyDefendant } from "@/utils/emptyDefendant";
import { useState, useTransition } from "react";
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
    // Separate file state for each defendant
    const [defendantFiles, setDefendantFiles] = useState<Record<number, DefendantFiles>>({});
    const [isPending, startTransition] = useTransition();
    const [successMessages, setSuccessMessages] = useState<Record<number, string>>({});
    const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

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
            caseId,
            defendants: [{ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "DEFENDANT" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "defendants",
    });

    const handleFileChange = (index: number, fileType: 'document' | 'photo' | 'signature', files: File[]) => {
        if (files.length > 0) {
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
        const defendantData = form.getValues(`defendants.${index}`);
        const files = defendantFiles[index] || {};

        setErrorMessages(prev => ({ ...prev, [index]: '' }));

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("caseId", caseId);
                formData.append("name", defendantData.Name);
                formData.append("age", defendantData.age);
                formData.append("gender", defendantData.gender);
                formData.append("mobile", defendantData.mobile);
                formData.append("address", defendantData.address);
                formData.append("role", "DEFENDANT");

                if (files.photo) formData.append("photo", files.photo);
                if (files.signature) formData.append("signature", files.signature);
                if (files.document) formData.append("document", files.document);

                const result = await createDefendant(formData);

                if (result.success) {
                    setSuccessMessages(prev => ({ ...prev, [index]: `Defendant "${defendantData.Name}" saved successfully!` }));
                    setTimeout(() => {
                        setSuccessMessages(prev => ({ ...prev, [index]: '' }));
                    }, 3000);
                } else {
                    setErrorMessages(prev => ({ ...prev, [index]: result.error || "Failed to save defendant" }));
                }
            } catch (error) {
                setErrorMessages(prev => ({ ...prev, [index]: error instanceof Error ? error.message : "An error occurred" }));
            }
        });
    };

    return (
        <form className="rounded-lg border border-accent p-6 shadow-2xs bg-white/50 dark:bg-accent/20">
            <FieldGroup>
                <h3 className="font-normal text-2xl mb-4">Defendant Details</h3>

                {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 border-b pb-6 mb-6">
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

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name={`defendants.${index}.Name`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Defendant Name</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="John Doe" />
                                        <FieldDescription>Enter Defendant Name</FieldDescription>
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name={`defendants.${index}.age`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Defendant Age</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="25" />
                                        <FieldDescription>Enter Defendant Age</FieldDescription>
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
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem key="MALE" value="MALE">Male</SelectItem>
                                                <SelectItem key="FEMALE" value="FEMALE">Female</SelectItem>
                                                <SelectItem key="OTHER" value="OTHER">Other</SelectItem>
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
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="8888888888" />
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name={`defendants.${index}.address`}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Defendant Address</FieldLabel>
                                    <Textarea className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="New Delhi" />
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
                                onClick={() => onSubmitDefendant(index)}
                                disabled={isPending}
                                className="w-fit"
                            >
                                {isPending ? "Saving..." : "Save This Defendant"}
                            </Button>

                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                >
                                    Remove Defendant
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    onClick={() => append({ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "DEFENDANT" })}
                    className="w-fit"
                >
                    + Add Another Defendant
                </Button>
            </FieldGroup>
        </form>
    );
}