import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  Globe,
  Link2,
  Loader2,
  MousePointerClick,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState("30");
  const { data: overview, isLoading: overviewLoading } = trpc.analytics.overview.useQuery();
  const { data: traffic, isLoading: trafficLoading } = trpc.dashboard.trafficChart.useQuery();
  const { data: articlePerf, isLoading: perfLoading } = trpc.analytics.articlePerformance.useQuery();
  const { data: keywordRanks, isLoading: kwLoading } = trpc.keywords.list.useQuery({});

  const chartData = traffic?.map((d) => ({ ...d, date: d.date.slice(5) })) ?? [];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your SEO performance and organic growth</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36 bg-card border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-5">
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton className="h-7 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KpiCard
              title="Organic Traffic"
              value={(overview?.organicTraffic ?? 4250).toLocaleString()}
              change={overview?.organicTrafficChange ?? 12}
              icon={TrendingUp}
              color="bg-emerald-400/15 text-emerald-400"
            />
            <KpiCard
              title="Avg. Position"
              value={`#${overview?.avgRankPosition ?? 4.2}`}
              change={overview?.avgRankChange ?? 2}
              icon={Target}
              color="bg-blue-400/15 text-blue-400"
            />
            <KpiCard
              title="Click-Through Rate"
              value={`${overview?.ctr ?? 3.8}%`}
              change={0.5}
              icon={MousePointerClick}
              color="bg-purple-400/15 text-purple-400"
            />
            <KpiCard
              title="Indexed Pages"
              value={overview?.indexedPages ?? 24}
              icon={Globe}
              color="bg-orange-400/15 text-orange-400"
            />
          </>
        )}
      </div>

      {/* Traffic Chart */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Traffic Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trafficLoading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.20 220)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.60 0.20 220)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gReferral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 300)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 300)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.012 240)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(0.25 0.012 240)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "oklch(0.95 0.005 240)" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="organic" stroke="oklch(0.65 0.22 160)" strokeWidth={2} fill="url(#gOrganic)" name="Organic" />
                <Area type="monotone" dataKey="direct" stroke="oklch(0.60 0.20 220)" strokeWidth={2} fill="url(#gDirect)" name="Direct" />
                <Area type="monotone" dataKey="referral" stroke="oklch(0.65 0.18 300)" strokeWidth={2} fill="url(#gReferral)" name="Referral" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Keyword Rankings */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Keyword Ranking Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kwLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <div className="space-y-2">
                {keywordRanks?.slice(0, 8).map((kw: any) => (
                  <div key={kw.id} className="flex items-center gap-3 py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{kw.keyword}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${kw.currentRank && kw.currentRank <= 3 ? "bg-emerald-400" : kw.currentRank && kw.currentRank <= 10 ? "bg-yellow-400" : "bg-muted-foreground/40"}`}
                            style={{ width: `${Math.max(5, 100 - (kw.currentRank ?? 50) * 2)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {kw.previousRank && kw.currentRank && kw.previousRank !== kw.currentRank && (
                        <span className={`text-[10px] ${kw.currentRank < kw.previousRank ? "text-emerald-400" : "text-red-400"}`}>
                          {kw.currentRank < kw.previousRank ? "↑" : "↓"}{Math.abs(kw.previousRank - kw.currentRank)}
                        </span>
                      )}
                      <span className={`text-sm font-bold w-8 text-right ${kw.currentRank && kw.currentRank <= 3 ? "text-emerald-400" : kw.currentRank && kw.currentRank <= 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
                        {kw.currentRank ? `#${kw.currentRank}` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
                {!keywordRanks?.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No keyword rankings tracked yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Performance */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Top Performing Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {perfLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <div className="space-y-2">
                {articlePerf?.slice(0, 6).map((article) => (
                  <div key={article.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{article.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{article.targetKeyword || "No keyword"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(article.views ?? 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3" />
                        {Math.round((article.views ?? 0) * 0.05).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {!articlePerf?.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No article performance data yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GSC Summary */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Google Search Console Summary
            </CardTitle>
            <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">Simulated Data</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Clicks", value: "1,842", change: "+8%", positive: true },
              { label: "Total Impressions", value: "48,200", change: "+15%", positive: true },
              { label: "Avg. CTR", value: "3.8%", change: "+0.3%", positive: true },
              { label: "Avg. Position", value: "4.2", change: "-0.8", positive: true },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-accent/30 text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                <p className={`text-xs mt-1 font-medium ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>{stat.change}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
