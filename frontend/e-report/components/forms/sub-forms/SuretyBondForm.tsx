"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition, useEffect } from "react";
import { createSuretyBond126 } from "@/lib/actions/createSuretyForm";
import { updateFormAction } from "@/lib/actions/forms";
import { Checkbox } from "@/components/ui/checkbox";

const suretyBond126Schema = z.object({
  personIds: z.array(z.string()).min(1, "Select at least one defendant"),
  bondAmount: z.string().min(1, "Bond amount is required"),
  durationMonths: z.string().min(1, "Duration is required"),
  suretyCount: z.string().min(1, "Surety count is required"),
});

type SuretyFormValues = z.infer<typeof suretyBond126Schema>;

interface SuretyBond126FormProps {
  caseId: string;
  applicants: Array<{ _id: string; name: string }>;
  defendants: Array<{ _id: string; name: string }>;
  initialData?: any;
  onSuccess?: () => void;
}

export function SuretyBond126Form({ caseId, applicants, defendants, initialData, onSuccess }: SuretyBond126FormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SuretyFormValues>({
    resolver: zodResolver(suretyBond126Schema),
    defaultValues: {
      personIds: defendants.map(d => d._id),
      bondAmount: "",
      durationMonths: "",
      suretyCount: "1",
    },
  });

  // Prefill form if initialData is provided
  useEffect(() => {
    if (initialData?.content?.mr) {
      const { personIds, bond } = initialData.content.mr;
      form.reset({
        personIds: personIds || defendants.map(d => d._id),
        bondAmount: bond?.amount?.toString() || "",
        durationMonths: bond?.durationMonths?.toString() || "",
        suretyCount: bond?.suretyCount?.toString() || "1",
      });
    }
  }, [initialData, defendants, form]);

  // Sync personIds if defendants change (only if not prefilled)
  useEffect(() => {
    if (!initialData) {
      form.setValue("personIds", defendants.map(d => d._id));
    }
  }, [defendants, form, initialData]);

  const onSubmit = async (values: SuretyFormValues) => {
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
              suretyCount: parseInt(values.suretyCount),
            },
          },
        };

        const result = initialData
          ? await updateFormAction(initialData._id, content)
          : await createSuretyBond126({
            caseId,
            formType: "SURETY_BOND_126",
            content,
          });

        if (result.success) {
          setSuccessMessage(initialData ? "Surety Bond 126 updated successfully!" : "Surety Bond 126 created successfully!");
          if (onSuccess) onSuccess();
          if (!initialData) {
            form.reset({
              ...form.getValues(),
              bondAmount: "",
              durationMonths: "",
              suretyCount: "1",
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
                      id={`sb-${defendant._id}`}
                      checked={true}
                      disabled={true}
                    />
                    <label
                      htmlFor={`sb-${defendant._id}`}
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

        <div className="grid grid-cols-3 gap-4">
          <Controller
            control={form.control}
            name="bondAmount"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Bond Amount (₹) *</FieldLabel>
                <Input type="number" {...field} placeholder="10000" />
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
                <Input type="number" {...field} placeholder="12" />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="suretyCount"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Surety Count *</FieldLabel>
                <Input type="number" {...field} placeholder="1" />
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
            : (initialData ? "Update Surety Bond 126" : "Create Surety Bond 126")}
        </Button>
      </FieldGroup>
    </form>
  );
}