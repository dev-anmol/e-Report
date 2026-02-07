// PersonalBond125Form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition, useEffect } from "react";
import { createPersonalBond } from "@/lib/actions/createPersonalBond";
import { updateFormAction } from "@/lib/actions/forms";
import { Checkbox } from "@/components/ui/checkbox";

const personalBond125Schema = z.object({
  personIds: z.array(z.string()).min(1, "Select at least one defendant"),
  bondAmount: z.string().min(1, "Bond amount is required"),
  durationMonths: z.string().min(1, "Duration is required"),
});

type FormValues = z.infer<typeof personalBond125Schema>;

interface PersonalBond125FormProps {
  caseId: string;
  applicants: Array<{ _id: string; name: string }>;
  defendants: Array<{ _id: string; name: string }>;
  initialData?: any;
  onSuccess?: () => void;
}

export default function PersonalBond125Form({ caseId, applicants, defendants, initialData, onSuccess }: PersonalBond125FormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(personalBond125Schema),
    defaultValues: {
      personIds: defendants.map(d => d._id),
      bondAmount: "",
      durationMonths: "",
    },
  });

  // Prefill form if initialData is provided
  useEffect(() => {
    console.log("PersonalBond125Form: useEffect triggered", { initialData, defendantsCount: defendants.length });
    if (initialData?.content?.mr) {
      console.log("PersonalBond125Form: Prefilling with data:", initialData.content.mr);
      const { personIds, bond } = initialData.content.mr;
      form.reset({
        personIds: personIds || defendants.map(d => d._id),
        bondAmount: bond?.amount?.toString() || "",
        durationMonths: bond?.durationMonths?.toString() || "",
      });
      console.log("PersonalBond125Form: Form reset completed");
    } else if (initialData) {
      console.log("PersonalBond125Form: initialData present but content.mr missing", initialData);
    }
  }, [initialData, defendants, form]);

  // Sync personIds if defendants change (only if not prefilled)
  useEffect(() => {
    if (!initialData) {
      form.setValue("personIds", defendants.map(d => d._id));
    }
  }, [defendants, form, initialData]);

  const onSubmit = async (values: FormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const content = {
          mr: {
            personIds: values.personIds,
            bond: {
              amount: parseInt(values.bondAmount),
              durationMonths: parseInt(values.durationMonths),
            },
          },
        };

        const result = initialData
          ? await updateFormAction(initialData._id, content)
          : await createPersonalBond({
            caseId,
            formType: "PERSONAL_BOND_125",
            content,
          });

        if (result.success) {
          setSuccessMessage(initialData ? "Personal Bond 125 updated successfully!" : "Personal Bond 125 created successfully!");
          if (onSuccess) onSuccess();
          if (!initialData) {
            form.reset({
              ...form.getValues(),
              bondAmount: "",
              durationMonths: "",
            });
          }
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage(result.error || `Failed to ${initialData ? 'update' : 'create'} bond`);
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
          name="personIds"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Bond Issued For (All Defendants) *</FieldLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {defendants.map((defendant) => (
                  <div key={defendant._id} className="flex items-center space-x-2 p-2 rounded-md border border-neutral-200 dark:border-accent bg-neutral-50 dark:bg-accent/10 opacity-80">
                    <Checkbox
                      id={`pb-${defendant._id}`}
                      checked={true}
                      disabled={true}
                    />
                    <label
                      htmlFor={`pb-${defendant._id}`}
                      className="text-sm font-medium leading-none cursor-default"
                    >
                      {defendant.name}
                    </label>
                  </div>
                ))}
              </div>
              {fieldState.error && (
                <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>
              )}
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
          {isPending
            ? (initialData ? "Updating..." : "Creating...")
            : (initialData ? "Update Personal Bond 125" : "Create Personal Bond 125")}
        </Button>
      </FieldGroup>
    </form>
  );
}