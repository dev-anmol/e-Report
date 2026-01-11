"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    sectionOneApplicantSchema,
    SectionOneApplicantValues,
} from "@/types/section-1/sectionOneApplicantSchema";

import { createEmptyApplicant } from "@/utils/emptyApplicant";

export default function ApplicantForm({ caseId }: { caseId: string }) {
    const form = useForm<SectionOneApplicantValues>({
        resolver: zodResolver(sectionOneApplicantSchema),
        defaultValues: {
            caseId,
            applicant: createEmptyApplicant(),
        },
    });

    const onSubmit = async (values: SectionOneApplicantValues) => {
        console.log(values);

        await fetch(`/api/cases/${caseId}/applicant`, {
            method: "POST",
            body: JSON.stringify(values),
        });
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border p-6"
        >
            <h3 className="font-semibold mb-4">Applicant Details</h3>

            <Input
                {...form.register("applicant.Name")}
                placeholder="Name"
            />

            <Input
                {...form.register("applicant.age")}
                placeholder="Age"
            />

            <Input
                {...form.register("applicant.mobile")}
                placeholder="Mobile"
            />

            <Input
                {...form.register("applicant.address")}
                placeholder="Address"
            />

            <Button type="submit" className="mt-4">
                Save Applicant
            </Button>
        </form>
    );
}
