"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    sectionOneWitnessSchema,
    SectionOneWitenessValues,
} from "@/types/section-1/sectionOneWitnessSchema";

import { createEmptyWitness } from "@/utils/emptyWiteness";

export default function WitnessForm({ caseId }: { caseId: string }) {
    const form = useForm<SectionOneWitenessValues>({
        resolver: zodResolver(sectionOneWitnessSchema),
        defaultValues: {
            caseId,
            witnesses: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "witnesses",
    });

    const onSubmit = async (values: SectionOneWitenessValues) => {
        console.log(values.witnesses);

        await fetch(`/api/cases/${caseId}/witnesses`, {
            method: "POST",
            body: JSON.stringify(values.witnesses),
        });
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border p-6"
        >
            <h3 className="font-semibold mb-4">Witnesses</h3>

            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                        {...form.register(`witnesses.${index}.Name`)}
                        placeholder="Name"
                    />

                    <Input
                        {...form.register(`witnesses.${index}.age`)}
                        placeholder="Age"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => remove(index)}
                    >
                        Remove
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                onClick={() => append(createEmptyWitness())}
            >
                + Add Witness
            </Button>

            <Button type="submit" className="mt-4">
                Save Witnesses
            </Button>
        </form>
    );
}
