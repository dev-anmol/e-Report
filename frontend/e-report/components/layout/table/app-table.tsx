"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getCases } from "@/lib/actions/getCases"

interface Case {
    _id: string
    branchCaseNumber: string
    sections: string[]
    status: string
    language: string
    createdAt: string
}

interface AppTableProps {
    searchQuery?: string
}

export default function AppTable({ searchQuery = "" }: AppTableProps) {
    const router = useRouter()
    const [cases, setCases] = useState<Case[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true)
                const result = await getCases()
                if (result.success) {
                    setCases(result.data)
                } else {
                    setError(result.error || "Failed to fetch cases")
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchCases()
    }, [])

    // Filter cases based on search query
    const filteredCases = useMemo(() => {
        if (!searchQuery.trim()) {
            return cases
        }

        const query = searchQuery.toLowerCase()
        return cases.filter((caseItem) =>
            caseItem._id.toLowerCase().includes(query) ||
            caseItem.branchCaseNumber.toLowerCase().includes(query) ||
            caseItem.status.toLowerCase().includes(query) ||
            caseItem.language.toLowerCase().includes(query) ||
            caseItem.sections.some(s => s.toLowerCase().includes(query))
        )
    }, [cases, searchQuery])

    if (loading) {
        return <div className="p-4">Loading cases...</div>
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>
    }

    if (cases.length === 0) {
        return <div className="p-4">No cases found.</div>
    }

    if (filteredCases.length === 0) {
        return <div className="p-4">No cases match your search.</div>
    }

    return (
        <Table>
            <TableCaption>A list of your recent cases.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Case ID</TableHead>
                    <TableHead>Branch Case Number</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredCases.map((caseItem) => (
                    <TableRow 
                        key={caseItem._id}
                        onClick={() => router.push(`/reports/section-1/${caseItem._id}`)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <TableCell className="font-medium">{caseItem._id.slice(-6)}</TableCell>
                        <TableCell>{caseItem.branchCaseNumber}</TableCell>
                        <TableCell>{caseItem.sections.join(", ")}</TableCell>
                        <TableCell>{caseItem.status}</TableCell>
                        <TableCell className="text-right">
                            {new Date(caseItem.createdAt).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
