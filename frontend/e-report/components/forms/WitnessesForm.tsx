"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sectionOneWitnessSchema, SectionOneWitenessValues } from "@/types/section-1/sectionOneWitnessSchema";
import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon } from "lucide-react";
import { createEmptyWitness } from "@/utils/emptyWiteness";
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

export default function WitnessesForm({ caseId }: { caseId: string }) {
    // Separate file state for each witness
    const [witnessFiles, setWitnessFiles] = useState<Record<number, WitnessFiles>>({});
    const [isPending, startTransition] = useTransition();
    const [successMessages, setSuccessMessages] = useState<Record<number, string>>({});
    const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

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
            caseId,
            witnesses: [{ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "WITNESS" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "witnesses",
    });

    const handleFileChange = (index: number, fileType: 'document' | 'photo' | 'signature', files: File[]) => {
        if (files.length > 0) {
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
        const witnessData = form.getValues(`witnesses.${index}`);
        const files = witnessFiles[index] || {};

        setErrorMessages(prev => ({ ...prev, [index]: '' }));

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("caseId", caseId);
                formData.append("name", witnessData.Name);
                formData.append("age", witnessData.age);
                formData.append("gender", witnessData.gender);
                formData.append("mobile", witnessData.mobile);
                formData.append("address", witnessData.address);
                formData.append("role", "WITNESS");

                if (files.photo) formData.append("photo", files.photo);
                if (files.signature) formData.append("signature", files.signature);
                if (files.document) formData.append("document", files.document);

                const result = await createWitness(formData);

                if (result.success) {
                    setSuccessMessages(prev => ({ ...prev, [index]: `Witness "${witnessData.Name}" saved successfully!` }));
                    setTimeout(() => {
                        setSuccessMessages(prev => ({ ...prev, [index]: '' }));
                    }, 3000);
                } else {
                    setErrorMessages(prev => ({ ...prev, [index]: result.error || "Failed to save witness" }));
                }
            } catch (error) {
                setErrorMessages(prev => ({ ...prev, [index]: error instanceof Error ? error.message : "An error occurred" }));
            }
        });
    };

    return (
        <form className="rounded-lg border border-accent p-6 shadow-2xs bg-white/50 backdrop-blur-sm dark:bg-accent/20">
            <FieldGroup>
                <p className="font-normal text-2xl mb-4">
                    Witness Details <span className="text-neutral-400">(optional)</span>
                </p>

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
                                name={`witnesses.${index}.Name`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Witness Name</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="John Doe" />
                                        <FieldDescription>Enter Witness's Name</FieldDescription>
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name={`witnesses.${index}.age`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Witness Age</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="25" />
                                        <FieldDescription>Enter Witness's Age</FieldDescription>
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name={`witnesses.${index}.gender`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Witness Gender</FieldLabel>
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
                                name={`witnesses.${index}.mobile`}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Witness Phone Number</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="8888888888" />
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name={`witnesses.${index}.address`}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Witness Address</FieldLabel>
                                    <Textarea className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="New Delhi" />
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
                                onClick={() => onSubmitWitness(index)}
                                disabled={isPending}
                                className="w-fit"
                            >
                                {isPending ? "Saving..." : "Save This Witness"}
                            </Button>

                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                >
                                    Remove Witness
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    onClick={() => append({ Name: "", age: "", gender: "MALE", mobile: "", address: "", role: "WITNESS" })}
                    className="w-fit"
                >
                    + Add Another Witness
                </Button>
            </FieldGroup>
        </form>
    );
}