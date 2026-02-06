"use client";

import { useState, useEffect } from "react";
import { getCasesAction } from "@/lib/actions/cases";
import { getMeAction } from "@/lib/actions/auth";
import { getPendingFormsAction } from "@/lib/actions/forms";
import {
    FolderOpen,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCases: 0,
        activeCases: 0,
        closedCases: 0,
        pendingForms: 0,
    });
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [userRes, casesRes, formsRes] = await Promise.all([
                    getMeAction(),
                    getCasesAction(),
                    getPendingFormsAction()
                ]);

                if (userRes.success) setUser(userRes.data as any);

                const cases = casesRes.success ? (casesRes.data || []) : [];
                const totalCases = cases.length;
                const activeCases = cases.filter(c => c.status !== "CLOSED").length;
                const closedCases = totalCases - activeCases;

                // formsRes only relevant for Admin
                const pendingForms = formsRes.success ? (formsRes.data || []).length : 0;

                setStats({
                    totalCases,
                    activeCases,
                    closedCases,
                    pendingForms
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    const isAdmin = user?.role === "ADMIN";

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's an overview of the {isAdmin ? "system's" : "your"} portal
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Cases"
                    value={stats.totalCases}
                    icon={FolderOpen}
                    color="blue"
                />
                <StatCard
                    title="Active Cases"
                    value={stats.activeCases}
                    icon={Clock}
                    color="yellow"
                />
                <StatCard
                    title="Closed Cases"
                    value={stats.closedCases}
                    icon={CheckCircle2}
                    color="green"
                />
                {isAdmin && (
                    <StatCard
                        title="Pending Forms"
                        value={stats.pendingForms}
                        icon={AlertCircle}
                        color="red"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ActionCard
                            title="View All Cases"
                            description="List and manage existing cases"
                            icon={FileText}
                            href="/cases"
                            primary
                        />
                        <ActionCard
                            title="Create New Case"
                            description="Register a new legal matter"
                            icon={Plus}
                            href="/cases/new"
                        />
                    </div>
                </div>

                {/* Recent Cases Link Section */}
                <div className="bg-accent/10 border border-accent rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Continue Working</h2>
                        <p className="text-muted-foreground mb-6">
                            Navigate to the cases list to start adding Roznama entries or reviewing submitted forms.
                        </p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/cases" className="flex items-center justify-center">
                            Go to Cases List <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
        green: "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:border-green-800",
        red: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    };

    return (
        <div className={`p-6 rounded-xl border ${colors[color]} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <Icon size={24} />
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm font-medium opacity-80">{title}</p>
        </div>
    );
}

function ActionCard({ title, description, icon: Icon, href, primary }: any) {
    return (
        <Link href={href} className="group">
            <div className={`h-full p-6 rounded-xl border transition-all duration-200 ${primary
                    ? "bg-primary text-primary-foreground border-primary shadow-md hover:shadow-lg"
                    : "bg-card hover:border-primary/50 border-border hover:shadow-md"
                }`}>
                <div className="flex items-center gap-3 mb-2">
                    <Icon size={20} />
                    <h3 className="font-semibold">{title}</h3>
                </div>
                <p className={`text-sm ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {description}
                </p>
            </div>
        </Link>
    );
}