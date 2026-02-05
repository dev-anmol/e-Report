"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useState, useTransition, useEffect } from "react";
import { createNotice } from "@/lib/actions/createNotice";
import { updateFormAction } from "@/lib/actions/forms";
import { Checkbox } from "@/components/ui/checkbox";

const noticeFormSchema = z.object({
  personIds: z.array(z.string()).min(1, "Select at least one defendant"),
  facts: z.string().min(10, "Facts must be at least 10 characters"),
  hearingDate: z.string().min(1, "Hearing date is required"),
  hearingTime: z.string().min(1, "Hearing time is required"),
  hearingPlace: z.string().min(1, "Hearing place is required"),
});

type FormValues = z.infer<typeof noticeFormSchema>;

interface NoticeFormProps {
  caseId: string;
  applicant?: { _id: string; name: string } | null;
  defendants: Array<{ _id: string; name: string }>;
  initialData?: any;
  onSuccess?: () => void;
}

export default function Notice130Form({ caseId, applicant, defendants, initialData, onSuccess }: NoticeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      personIds: defendants.map(d => d._id),
      facts: "",
      hearingDate: "",
      hearingTime: "",
      hearingPlace: "",
    },
  });

  // Prefill form if initialData is provided
  useEffect(() => {
    if (initialData?.content?.mr) {
      console.log(`Prefilling NoticeForm with:`, initialData.content.mr);
      const { personIds, facts, hearing } = initialData.content.mr;
      form.reset({
        personIds: personIds || defendants.map(d => d._id),
        facts: facts || "",
        hearingDate: hearing?.date || "",
        hearingTime: hearing?.time || "",
        hearingPlace: hearing?.place || "",
      });
    } else if (initialData) {
      console.log(`NoticeForm received initialData but content.mr is missing:`, initialData);
    }
  }, [initialData, defendants, form]);

  // Sync personIds if defendants change (only if not prefilled from initialData)
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
            facts: values.facts,
            hearing: {
              date: values.hearingDate,
              time: values.hearingTime,
              place: values.hearingPlace,
            },
          },
        };

        const result = initialData
          ? await updateFormAction(initialData._id, content)
          : await createNotice({
            caseId,
            formType: "NOTICE_130",
            content,
          });

        if (result.success) {
          setSuccessMessage(initialData ? "Notice 130 updated successfully!" : "Notice 130 created successfully!");
          if (onSuccess) onSuccess();
          if (!initialData) {
            form.reset({
              ...form.getValues(),
              facts: "",
              hearingDate: "",
              hearingTime: "",
              hearingPlace: "",
            });
          }
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage(result.error || `Failed to ${initialData ? 'update' : 'create'} notice`);
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
              <FieldLabel>Notice Issued To (All Defendants) *</FieldLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {defendants.map((defendant) => (
                  <div key={defendant._id} className="flex items-center space-x-2 p-2 rounded-md border border-neutral-200 dark:border-accent bg-neutral-50 dark:bg-accent/10 opacity-80">
                    <Checkbox
                      id={defendant._id}
                      checked={true}
                      disabled={true}
                    />
                    <label
                      htmlFor={defendant._id}
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

        <Controller
          control={form.control}
          name="facts"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Facts (Marathi) *</FieldLabel>
              <Textarea
                {...field}
                placeholder="सार्वजनिक ठिकाणी वाद घालून शांततेस बाधा निर्माण केली."
                rows={4}
              />
              {fieldState.error && (
                <p className="text-sm text-red-500">{fieldState.error.message}</p>
              )}
              <FieldDescription>Describe the facts in Marathi</FieldDescription>
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="hearingDate"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Hearing Date *</FieldLabel>
                <Input type="date" {...field} />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="hearingTime"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Hearing Time *</FieldLabel>
                <Input type="time" {...field} />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="hearingPlace"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Hearing Place *</FieldLabel>
              <Input {...field} placeholder="रामनगर पोलीस ठाणे" />
              {fieldState.error && (
                <p className="text-sm text-red-500">{fieldState.error.message}</p>
              )}
            </Field>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? (initialData ? "Updating..." : "Creating...")
            : (initialData ? "Update Notice 130" : "Create Notice 130")}
        </Button>
      </FieldGroup>
    </form>
  );
}