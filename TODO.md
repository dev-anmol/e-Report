# TODO: Case Form with Click-to-Enable Sections

## Task - COMPLETED ✅
Create a CaseForm component that displays case details with expandable sections for persons (Applicant, Defendants, Witnesses) and forms. Sections are disabled by default and become enabled when clicked.

## Implementation Complete ✅

### Files Created:

1. **`frontend/e-report/components/forms/SectionCard.tsx`**
   - Reusable component for disabled/enabled sections
   - Color-coded variants (applicant=blue, defendant=red, witness=green, forms=purple)
   - Smooth expand/collapse animations
   - Visual indicators (lock/unlock icons)
   - Hover effects with "Click to enable" feedback

2. **`frontend/e-report/components/forms/CaseForm.tsx`**
   - Main component displaying case header
   - Four expandable sections:
     - **Applicant Details** - Uses ApplicantForm when enabled
     - **Defendants** - Uses DefendantsForm when enabled
     - **Witnesses** - Placeholder (to be implemented)
     - **Forms & Documents** - Uses FormsList when enabled
   - All sections disabled by default, click to enable
   - Shows count of existing items in section headers
   - Loading skeletons
   - Mock data fallback

### Files Modified:

1. **`frontend/e-report/app/(app)/reports/[caseId]/page.tsx`**
   - Simplified to use the new CaseForm component

## Features

- **Disabled by Default**: All sections start disabled with a lock icon
- **Click to Enable**: Click any section header to enable and expand it
- **Color Coding**: Each section type has a distinct color
- **Smooth Animations**: Expand/collapse with transitions
- **Data Feedback**: Shows existing item counts in headers
- **Back Navigation**: Easy navigation back
- **Error Handling**: Fallback to mock data when API fails
- **Loading States**: Skeleton loaders while fetching data

## Usage

Visit `/reports/[caseId]` to see the new case form with click-to-enable sections.

