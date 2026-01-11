"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    sectionOneDefendantsSchema,
    SectionOneDefendantsValues,
} from "@/types/section-1/sectionOneDefendantSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { createEmptyDefendant } from "@/utils/emptyDefendant";

export default function DefendantsForm({ caseId }: { caseId: string }) {
    const form = useForm<SectionOneDefendantsValues>({
        resolver: zodResolver(sectionOneDefendantsSchema),
        defaultValues: {
            caseId,
            defendants: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "defendants",
    });

    const onSubmit = async (values: SectionOneDefendantsValues) => {
        console.log(values.defendants);
        // POST values.defendants
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border p-6"
        >
            <h3 className="font-semibold mb-4">Defendants</h3>

            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                        {...form.register(`defendants.${index}.Name`)}
                        placeholder="Name"
                    />
                    <Input
                        {...form.register(`defendants.${index}.age`)}
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
                onClick={() => append(createEmptyDefendant())}
            >
                + Add Defendant
            </Button>

            <Button type="submit" className="mt-4">
                Save Defendants
            </Button>
        </form>
    );
}
