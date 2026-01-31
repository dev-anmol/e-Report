"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createFormAction, updateFormAction, submitFormAction, getFormByIdAction } from "@/lib/actions/forms";

interface Person {
  _id: string;
  name: string;
  role: "APPLICANT" | "DEFENDANT" | "WITNESS";
}

interface Notice130FormProps {
  caseId: string;
  persons: Person[];
  formId?: string;
  initialData?: any;
  onSuccess?: (formId: string) => void;
}

export default function NoticeForm({
  caseId,
  persons,
  formId,
  initialData,
  onSuccess,
}: Notice130FormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accusedPersonId: initialData?.mr?.accusedPersonId || "",
    facts: initialData?.mr?.facts || "",
    hearingDate: initialData?.mr?.hearing?.date || "",
    hearingTime: initialData?.mr?.hearing?.time || "",
    hearingPlace: initialData?.mr?.hearing?.place || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      accusedPersonId: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.accusedPersonId) {
      setError("Please select accused person");
      return false;
    }
    if (!formData.facts.trim()) {
      setError("Please enter facts");
      return false;
    }
    if (!formData.hearingDate) {
      setError("Please select hearing date");
      return false;
    }
    if (!formData.hearingTime) {
      setError("Please enter hearing time");
      return false;
    }
    if (!formData.hearingPlace.trim()) {
      setError("Please enter hearing place");
      return false;
    }
    return true;
  };

  const handleSaveAsDraft = async () => {
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const content = {
        mr: {
          accusedPersonId: formData.accusedPersonId,
          facts: formData.facts,
          hearing: {
            date: formData.hearingDate,
            time: formData.hearingTime,
            place: formData.hearingPlace,
          },
        },
      };

      let result;

      if (formId) {
        result = await updateFormAction(formId, content);
      } else {
        result = await createFormAction(caseId, "NOTICE_130", content);
      }

      if (result.success) {
        const newFormId = (result.data as any)?.formId || formId;
        alert("Form saved as draft");
        if (onSuccess) {
          onSuccess(newFormId);
        }
      } else {
        setError(result.error || "Failed to save form");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async () => {
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // First save as draft if new
      if (!formId) {
        const content = {
          mr: {
            accusedPersonId: formData.accusedPersonId,
            facts: formData.facts,
            hearing: {
              date: formData.hearingDate,
              time: formData.hearingTime,
              place: formData.hearingPlace,
            },
          },
        };

        const createResult = await createFormAction(
          caseId,
          "NOTICE_130",
          content
        );

        if (!createResult.success) {
          setError(createResult.error || "Failed to create form");
          setLoading(false);
          return;
        }

        const newFormId = (createResult.data as any)?.formId;

        // Then submit
        const submitResult = await submitFormAction(newFormId);

        if (submitResult.success) {
          alert("Form submitted for approval");
          if (onSuccess) {
            onSuccess(newFormId);
          }
        } else {
          setError(submitResult.error || "Failed to submit form");
        }
      } else {
        // Already exists, just submit
        const submitResult = await submitFormAction(formId);

        if (submitResult.success) {
          alert("Form submitted for approval");
          if (onSuccess) {
            onSuccess(formId);
          }
        } else {
          setError(submitResult.error || "Failed to submit form");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get defendants only
  const defendants = persons.filter((p) => p.role === "DEFENDANT");

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/50 dark:bg-accent/10 rounded-lg border border-accent">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Notice Form (130)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fill in the details for the notice
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Accused Person */}
        <div>
          <Label htmlFor="accused">Accused Person</Label>
          <Select value={formData.accusedPersonId} onValueChange={handleSelectChange}>
            <SelectTrigger id="accused">
              <SelectValue placeholder="Select accused person" />
            </SelectTrigger>
            <SelectContent>
              {defendants.map((person) => (
                <SelectItem key={person._id} value={person._id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Facts */}
        <div>
          <Label htmlFor="facts">Facts of the Case</Label>
          <Textarea
            id="facts"
            name="facts"
            value={formData.facts}
            onChange={handleChange}
            placeholder="Enter facts of the case in Marathi..."
            rows={5}
            className="border border-neutral-400/50 dark:border-accent"
          />
        </div>

        {/* Hearing Date */}
        <div>
          <Label htmlFor="hearingDate">Hearing Date</Label>
          <Input
            id="hearingDate"
            name="hearingDate"
            type="date"
            value={formData.hearingDate}
            onChange={handleChange}
            className="border border-neutral-400/50 dark:border-accent"
          />
        </div>

        {/* Hearing Time */}
        <div>
          <Label htmlFor="hearingTime">Hearing Time</Label>
          <Input
            id="hearingTime"
            name="hearingTime"
            type="time"
            value={formData.hearingTime}
            onChange={handleChange}
            className="border border-neutral-400/50 dark:border-accent"
          />
        </div>

        {/* Hearing Place */}
        <div>
          <Label htmlFor="hearingPlace">Hearing Place</Label>
          <Input
            id="hearingPlace"
            name="hearingPlace"
            value={formData.hearingPlace}
            onChange={handleChange}
            placeholder="Enter hearing place..."
            className="border border-neutral-400/50 dark:border-accent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSaveAsDraft}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button onClick={handleSubmitForm} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </div>
    </div>
  );
}
