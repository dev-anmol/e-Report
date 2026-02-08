
import { getCasesAction } from "@/lib/actions/cases";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, FolderOpen } from "lucide-react";

export default async function CasesPage() {
    const { success, data: cases, error } = await getCasesAction();

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your cases and reports
                    </p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/cases/new">
                        <Plus className="mr-2 h-4 w-4" /> New Case
                    </Link>
                </Button>
            </div>

            <div className="border-t pt-6">
                {success ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cases && cases.length > 0 ? (
                            cases.map((c) => (
                                <Link key={c._id} href={`/reports/${c._id}`} className="block group">
                                    <Card className="h-full hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg truncate pr-2 group-hover:text-primary transition-colors">
                                                    {c.branchCaseNumber}
                                                </CardTitle>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${c.status === "CLOSED" ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" :
                                                    c.status === "ORDER_PASSED" ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" :
                                                        "text-foreground"
                                                    }`}>
                                                    {c.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span className="truncate">PS: {c.policeStationCaseNumber}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                                                {c.sections.slice(0, 3).map((sec, idx) => (
                                                    <span key={idx} className="inline-flex items-center rounded-md border bg-secondary/50 px-2 py-0.5 text-xs font-medium text-secondary-foreground">{sec}</span>
                                                ))}
                                                {c.sections.length > 3 && (
                                                    <span className="inline-flex items-center rounded-md border bg-secondary/50 px-2 py-0.5 text-xs font-medium text-secondary-foreground">+{c.sections.length - 3}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/50">
                                <FolderOpen className="h-10 w-10 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No cases found</h3>
                                <p className="text-muted-foreground mb-4">Get started by creating your first case.</p>
                                <Button asChild variant="outline">
                                    <Link href="/cases/new">Create Case</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4 rounded-md bg-destructive/10 text-destructive font-medium border border-destructive/20">
                        Error loading cases: {error || "Unknown error"}
                    </div>
                )}
            </div>
        </div>
    );
}
