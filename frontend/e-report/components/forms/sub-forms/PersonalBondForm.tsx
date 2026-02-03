// PersonalBond125Form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition } from "react";
import { createPersonalBond } from "@/lib/actions/createPersonalBond";

const personalBond125Schema = z.object({
  accusedPersonIds: z.array(z.string()).min(1, "Select at least one accused"),
  bondAmount: z.string().min(1, "Bond amount is required"),
  durationMonths: z.string().min(1, "Duration is required"),
});

type FormValues = z.infer<typeof personalBond125Schema>;

interface PersonalBond125FormProps {
  caseId: string;
  defendants: Array<{ _id: string; name: string }>;
}

export default function PersonalBond125Form({ caseId, defendants }: PersonalBond125FormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(personalBond125Schema),
    defaultValues: {
      accusedPersonIds: [],
      bondAmount: "",
      durationMonths: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await createPersonalBond({
          caseId,
          formType: "PERSONAL_BOND_125",
          content: {
            mr: {
              accusedPersonIds: values.accusedPersonIds,
              bond: {
                amount: parseInt(values.bondAmount),
                durationMonths: parseInt(values.durationMonths),
              },
            },
          },
        });

        if (result.success) {
          setSuccessMessage("Personal Bond 125 created successfully!");
          form.reset();
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage(result.error || "Failed to create bond");
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An error occurred");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {errorMessage}
        </div>
      )}

      <FieldGroup>
        <Controller
          control={form.control}
          name="accusedPersonIds"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Select Accused *</FieldLabel>
              <Select
                value={field.value[0] || ""}
                onValueChange={(value) => {
                  const newValues = field.value.includes(value)
                    ? field.value.filter(id => id !== value)
                    : [...field.value, value];
                  field.onChange(newValues);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accused persons">
                    {field.value.length > 0
                      ? `${field.value.length} accused selected`
                      : "Select accused persons"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {defendants.map((defendant) => (
                    <SelectItem key={defendant._id} value={defendant._id}>
                      {defendant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-sm text-red-500">{fieldState.error.message}</p>
              )}
              <FieldDescription>
                Selected: {field.value.map(id => defendants.find(d => d._id === id)?.name).join(", ") || "None"}
              </FieldDescription>
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="bondAmount"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Bond Amount (₹) *</FieldLabel>
                <Input type="number" {...field} placeholder="5000" />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="durationMonths"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Duration (Months) *</FieldLabel>
                <Input type="number" {...field} placeholder="6" />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create Personal Bond 125"}
        </Button>
      </FieldGroup>
    </form>
  );
}