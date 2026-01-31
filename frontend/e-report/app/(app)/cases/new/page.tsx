"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPoliceStationsAction } from "@/lib/actions/policeStation";
import { createCaseAction } from "@/lib/actions/cases";

interface PoliceStation {
  _id: string;
  name: string;
  code: string;
  district: string;
  taluka: string;
}

export default function CreateCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);

  const [formData, setFormData] = useState({
    policeStationId: "",
    branchCaseNumber: "",
    policeStationCaseNumber: "",
    sections: "",
    language: "MR" as "MR" | "EN" | "BOTH",
  });

  // Fetch police stations on mount
  useEffect(() => {
    const fetchPoliceStations = async () => {
      try {
        setLoading(true);
        const result = await getPoliceStationsAction();
        if (result.success && result.data) {
          setPoliceStations(result.data);
        }
      } catch (err) {
        console.error("Error fetching police stations:", err);
        setError("Failed to load police stations");
      } finally {
        setLoading(false);
      }
    };

    fetchPoliceStations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.policeStationId) {
      setError("Please select a police station");
      return false;
    }
    if (!formData.branchCaseNumber.trim()) {
      setError("Please enter branch case number");
      return false;
    }
    if (!formData.policeStationCaseNumber.trim()) {
      setError("Please enter police station case number");
      return false;
    }
    if (!formData.sections.trim()) {
      setError("Please enter sections");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Parse sections (comma-separated)
      const sectionsArray = formData.sections
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const result = await createCaseAction({
        policeStationId: formData.policeStationId,
        branchCaseNumber: formData.branchCaseNumber.trim(),
        policeStationCaseNumber: formData.policeStationCaseNumber.trim(),
        sections: sectionsArray,
        language: formData.language,
      });

      if (result.success) {
        // Redirect to the new case page
        router.push(`/reports/${(result.data as any)?.caseId}`);
      } else {
        setError(result.error || "Failed to create case");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Register New Case</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fill in the case details to register a new case
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white/50 dark:bg-accent/10 rounded-lg border border-accent p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Case Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Police Station */}
          <div className="space-y-2">
            <Label htmlFor="policeStation">Police Station *</Label>
            <Select
              value={formData.policeStationId}
              onValueChange={(value: string) =>
                handleSelectChange("policeStationId", value)
              }
              disabled={loading}
            >
              <SelectTrigger id="policeStation">
                <SelectValue placeholder="Select police station" />
              </SelectTrigger>
              <SelectContent>
                {policeStations.map((station) => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.name} ({station.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {policeStations.length === 0 && !loading && (
              <p className="text-sm text-yellow-600">
                Loading police stations...
              </p>
            )}
          </div>

          {/* Branch Case Number */}
          <div className="space-y-2">
            <Label htmlFor="branchCaseNumber">Branch Case Number *</Label>
            <Input
              id="branchCaseNumber"
              name="branchCaseNumber"
              value={formData.branchCaseNumber}
              onChange={handleChange}
              placeholder="e.g., 2024/001"
              disabled={loading}
            />
          </div>

          {/* Police Station Case Number */}
          <div className="space-y-2">
            <Label htmlFor="policeStationCaseNumber">
              Police Station Case Number *
            </Label>
            <Input
              id="policeStationCaseNumber"
              name="policeStationCaseNumber"
              value={formData.policeStationCaseNumber}
              onChange={handleChange}
              placeholder="e.g., PS/2024/001"
              disabled={loading}
            />
          </div>

          {/* Sections */}
          <div className="space-y-2">
            <Label htmlFor="sections">Sections *</Label>
            <Input
              id="sections"
              name="sections"
              value={formData.sections}
              onChange={handleChange}
              placeholder="e.g., 294, 336, 323"
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              Enter sections separated by commas
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select
              value={formData.language}
              onValueChange={(value: string) =>
                handleSelectChange("language", value)
              }
              disabled={loading}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MR">Marathi (MR)</SelectItem>
                <SelectItem value="EN">English (EN)</SelectItem>
                <SelectItem value="BOTH">Both (MR + EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Case...
                </>
              ) : (
                "Create Case"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

