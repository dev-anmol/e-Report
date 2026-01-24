// sectionOneApplicantSchema.ts
import { z } from "zod";

export const applicantSchema = z.object({
  name: z.string().min(1, "Applicant name is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  role: z.literal("APPLICANT"),
  signature: z.instanceof(File).optional(),
  photo: z.instanceof(File).optional(),
  document: z.instanceof(File).optional(),
});

export const sectionOneApplicantSchema = z.object({
  caseId: z.string().min(1),
  applicant: applicantSchema,
});

export type SectionOneApplicantValues = z.infer<
  typeof sectionOneApplicantSchema
>;
