"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnalyticsOverview, getAIDigest, getCaseSummary } from "@/lib/actions/analytics";
import { getCasesAction } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CaseStatusPieChart } from "@/components/charts/CaseStatusPieChart";
import { CaseStationBarChart } from "@/components/charts/CaseStationBarChart";
import { SectionUsageBarChart } from "@/components/charts/SectionUsageBarChart";

type OverviewResponse = {
  metrics: {
    totalCases: number;
    activeCases: number;
    closedCases: number;
    pendingForms: number;
  };
  avgTimeByStatus: Array<{ status: string; avgDays: number; count: number }>;
  casesByPoliceStation: Array<{ policeStationId: string; policeStationName: string; count: number }>;
  casesBySection: Array<{ _id: string; count: number }>;
  hearingOverdueCount: number;
  hearingOverdue: Array<{ caseId: string; hearingDate: string }>;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [digest, setDigest] = useState<any>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summaryCached, setSummaryCached] = useState(false);
  const [digestCached, setDigestCached] = useState(false);
  const [caseId, setCaseId] = useState<string>("");
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [overviewRes, casesRes] = await Promise.all([
        getAnalyticsOverview(),
        getCasesAction()
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data as OverviewResponse);
      }
      if (casesRes.success) {
        setCases(casesRes.data as any[]);
        if (casesRes.data?.length) setCaseId(casesRes.data[0]._id);
      }
      setLoading(false);
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!overview) return { status: [], station: [], section: [] };

    return {
      status: overview.avgTimeByStatus.map(s => ({ name: s.status.replace("_", " "), value: s.count })),
      station: overview.casesByPoliceStation.map(s => ({ name: s.policeStationName, value: s.count })),
      section: overview.casesBySection.slice(0, 6).map(s => ({ name: s._id, value: s.count }))
    };
  }, [overview]);

  const onGenerateDigest = async (force?: boolean) => {
    setDigestLoading(true);
    const res = await getAIDigest(force);
    if (res.success) {
      const data = res.data as any;
      setDigest(data?.digest || data);
      setDigestCached(Boolean(data?.cached));
    }
    setDigestLoading(false);
  };

  const onGenerateSummary = async (force?: boolean) => {
    if (!caseId) return;
    setSummaryLoading(true);
    const res = await getCaseSummary(caseId, force);
    if (res.success) {
      const data = res.data as any;
      setSummary(data?.summary || data);
      setSummaryCached(Boolean(data?.cached));
    }
    setSummaryLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-3xl shadow-xl">
        {/* Modern Mesh Gradients - kept subtle */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-[100px] animate-pulse" />

        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-700">
              System Intelligence
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4 drop-shadow-sm">
            Analytics Command Center
          </h1>

          <p className="text-lg text-slate-900 max-w-2xl leading-relaxed font-medium">
            Operational metrics, risk signals, and guided actions — distilled for fast decisions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Real-time overview",
              "AI-ready insights",
              "Admin-grade reporting"
            ].map((tag) => (
              <div key={tag} className="rounded-full border border-indigo-200 bg-white/60 px-4 py-2 text-sm font-bold text-indigo-950 backdrop-blur-md shadow-sm cursor-default hover:bg-white/80 transition-all">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Cases" value={overview?.metrics.totalCases ?? 0} />
        <MetricCard label="Active Cases" value={overview?.metrics.activeCases ?? 0} />
        <MetricCard label="Closed Cases" value={overview?.metrics.closedCases ?? 0} />
        <MetricCard label="Pending Forms" value={overview?.metrics.pendingForms ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Case Status Distribution">
          <CaseStatusPieChart data={chartData.status} />
        </Panel>

        <Panel title="Cases By Police Station">
          <CaseStationBarChart data={chartData.station} />
        </Panel>

        <Panel title="Top Sections Used">
          <SectionUsageBarChart data={chartData.section} />
        </Panel>
      </div>
      <Panel title="Hearing Delays">
        <div className="text-sm">
          <div className="font-medium">
            Overdue: {overview?.hearingOverdueCount ?? 0}
          </div>
          <div className="text-muted-foreground mt-2">
            Based on Notice 130 hearing dates.
          </div>
        </div>
      </Panel>

      {/* AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="AI Case Summary (One-click)">
          <div className="space-y-3">
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.branchCaseNumber} · {c.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => onGenerateSummary()} disabled={!caseId || summaryLoading}>
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onGenerateSummary(true)}
              disabled={!caseId || summaryLoading}
            >
              Regenerate
            </Button>
            {summary && (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm space-y-2 backdrop-blur-xl">
                <div className="font-medium">
                  Summary {summaryCached ? "(cached)" : "(fresh)"}
                </div>
                <p>{summary.summary || summary.headline || String(summary)}</p>
                {summary.key_points?.length > 0 && (
                  <div>
                    <div className="font-medium mt-2">Key Points</div>
                    <ul className="list-disc pl-5">
                      {summary.key_points.map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.recommended_next_actions?.length > 0 && (
                  <div>
                    <div className="font-medium mt-2">Next Actions</div>
                    <ul className="list-disc pl-5">
                      {summary.recommended_next_actions.map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="AI Digest (Daily Highlights)">
          <div className="space-y-3">
            <Button onClick={() => onGenerateDigest(false)} disabled={digestLoading}>
              {digestLoading ? "Generating..." : "Generate Digest"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onGenerateDigest(true)}
              disabled={digestLoading}
            >
              Regenerate
            </Button>
            {digest && (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm space-y-2 backdrop-blur-xl">
                <div className="font-medium">
                  {digest.headline || "Digest"} {digestCached ? "(cached)" : "(fresh)"}
                </div>
                {digest.highlights?.length > 0 && (
                  <ul className="list-disc pl-5">
                    {digest.highlights.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                )}
                {digest.risks?.length > 0 && (
                  <div>
                    <div className="font-medium mt-2">Risks</div>
                    <ul className="list-disc pl-5">
                      {digest.risks.map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {digest.suggested_actions?.length > 0 && (
                  <div>
                    <div className="font-medium mt-2">Suggested Actions</div>
                    <ul className="list-disc pl-5">
                      {digest.suggested_actions.map((k: string, i: number) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div >
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
      <div className="text-xs uppercase tracking-widest text-muted-foreground/80">
        {label}
      </div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
      <div className="text-lg font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function BarList({
  items,
}: {
  items: Array<{ label: string; value: number; meta?: string }>;
}) {
  const max = Math.max(1, ...items.map((i) => i.value || 0));
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium truncate">{item.label}</span>
            <span className="text-muted-foreground">{item.meta ?? item.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/60">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
