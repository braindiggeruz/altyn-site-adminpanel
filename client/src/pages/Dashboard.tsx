import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  BookOpen,
  Globe,
  Link2,
  Plus,
  Search,
  TrendingUp,
  Zap,
  Eye,
  Target,
} from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card className="bg-card border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}{changeLabel}
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SeoScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 80 ? "text-emerald-400 bg-emerald-400/10" : score >= 60 ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>
      <Zap className="w-2.5 h-2.5" />
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    draft: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    archived: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: traffic, isLoading: trafficLoading } = trpc.dashboard.trafficChart.useQuery();
  const { data: analytics } = trpc.analytics.overview.useQuery();

  const chartData = traffic?.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  })) ?? [];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.name?.split(" ")[0]}. Here's what's happening with altyn-therapy.uz.
          </p>
        </div>
        <Button onClick={() => setLocation("/articles/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
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
              title="Organic Traffic (30d)"
              value={analytics?.organicTraffic?.toLocaleString() ?? "4,250"}
              change={analytics?.organicTrafficChange}
              changeLabel=" vs last month"
              icon={TrendingUp}
              color="bg-emerald-400/15 text-emerald-400"
            />
            <KpiCard
              title="Avg. Rank Position"
              value={`#${analytics?.avgRankPosition ?? "4.2"}`}
              change={analytics?.avgRankChange}
              changeLabel=" positions"
              icon={Target}
              color="bg-blue-400/15 text-blue-400"
            />
            <KpiCard
              title="Indexed Pages"
              value={`${stats?.indexedArticles ?? 0} / ${stats?.totalArticles ?? 0}`}
              icon={Globe}
              color="bg-purple-400/15 text-purple-400"
            />
            <KpiCard
              title="Keywords Tracked"
              value={stats?.keywordCount ?? 0}
              icon={Search}
              color="bg-orange-400/15 text-orange-400"
            />
          </>
        )}
      </div>

      {/* Traffic Chart + Top Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Traffic Overview (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.60 0.20 220)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="oklch(0.60 0.20 220)" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="organic" stroke="oklch(0.65 0.22 160)" strokeWidth={2} fill="url(#colorOrganic)" name="Organic" />
                  <Area type="monotone" dataKey="direct" stroke="oklch(0.60 0.20 220)" strokeWidth={2} fill="url(#colorDirect)" name="Direct" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Keywords */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Top Ranking Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)
            ) : (
              stats?.topKeywords?.slice(0, 8).map((kw) => (
                <div key={kw.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-accent/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{kw.keyword}</p>
                    <p className="text-[10px] text-muted-foreground">Vol: {kw.searchVolume?.toLocaleString() ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {kw.trend === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                    {kw.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                    <span className={`text-xs font-bold ${kw.currentRank && kw.currentRank <= 3 ? "text-emerald-400" : kw.currentRank && kw.currentRank <= 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
                      #{kw.currentRank ?? "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setLocation("/keywords")}>
              View all keywords <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Recent Articles
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setLocation("/articles")}>
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
            ) : (
              stats?.recentArticles?.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/articles/${article.id}/edit`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{article.targetKeyword || "No target keyword"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {article.views?.toLocaleString() ?? 0}
                    </div>
                    <SeoScoreBadge score={article.seoScore} />
                    <StatusBadge status={article.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New Article", icon: Plus, path: "/articles/new", color: "bg-primary/15 hover:bg-primary/25 text-primary border-primary/20" },
          { label: "Keyword Research", icon: Search, path: "/keywords", color: "bg-blue-400/15 hover:bg-blue-400/25 text-blue-400 border-blue-400/20" },
          { label: "Competitor Analysis", icon: BarChart3, path: "/competitors", color: "bg-purple-400/15 hover:bg-purple-400/25 text-purple-400 border-purple-400/20" },
          { label: "Content Calendar", icon: BookOpen, path: "/calendar", color: "bg-orange-400/15 hover:bg-orange-400/25 text-orange-400 border-orange-400/20" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => setLocation(action.path)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${action.color}`}
          >
            <action.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
