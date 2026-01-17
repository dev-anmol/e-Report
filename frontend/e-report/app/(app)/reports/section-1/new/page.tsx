"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
    sectionOneSchema,
    SectionOneValues,
} from "@/types/section-1/sectionOneSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchPoliceStations } from "@/lib/api/policeStation";
import { useQuery } from "@tanstack/react-query";

export default function SectionOneForm({
    onSuccess,
}: {
    onSuccess: (caseId: string) => void;
}) {


    const {
        data: stations = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["policeStations"],
        queryFn: fetchPoliceStations,
        staleTime: 5 * 60 * 1000,
    });

    const form = useForm<SectionOneValues>({
        resolver: zodResolver(sectionOneSchema),
        defaultValues: {
            branchCaseNumber: "",
            policeStationId: "",
            policeCaseNumber: "",
            status: "DRAFT",
        },
    });
    const router = useRouter();
    const onSubmit = async (values: SectionOneValues) => {
        console.log(values);
    };

    return (
        <div className="w-full flex items-center justify-center">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="md:w-full min-w-md border border-accent rounded-lg shadow-md bg-white/50 dark:bg-accent/10 dark:border px-10 py-10"
            >
                <FieldGroup>
                    <FieldSet>
                        <div className="mb-4">
                            <p className="font-normal text-2xl mb-1">Case Form</p>
                            <FieldDescription>
                                Enter the details of Police Station
                            </FieldDescription>
                        </div>

                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="branchCaseNumber"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Branch Case Number</FieldLabel>
                                        <Input className="border border-neutral-400/50 dark:border-accent" {...field} placeholder="1234" />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={form.control}
                                    name="policeStationId"
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Police Station</FieldLabel>

                                            <Select
                                                value={field.value ?? ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                                    <SelectValue
                                                        placeholder={
                                                            isLoading
                                                                ? "Loading police stations..."
                                                                : "Select police station"
                                                        }
                                                    />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {stations.map((station: any) => (
                                                        <SelectItem
                                                            key={station.id}
                                                            value={station.id}
                                                        >
                                                            {station.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <FieldDescription>
                                                Select Police Station
                                            </FieldDescription>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="policeCaseNumber"
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Police Station Case No.</FieldLabel>
                                            <Input className="border border-neutral-400/50 dark:border-accent" {...field} />
                                            <FieldDescription>
                                                Enter Police case number
                                            </FieldDescription>
                                        </Field>
                                    )}
                                />
                            </div>
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="border border-neutral-400/50 dark:border-accent">
                                                <SelectValue placeholder="Draft" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </FieldSet>

                    <FieldSeparator />

                    <Field orientation="horizontal">
                        <Button type="submit">Submit</Button>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}
