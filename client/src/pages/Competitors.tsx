import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  BarChart3,
  ExternalLink,
  Globe,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Swords,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Competitors() {
  const [addOpen, setAddOpen] = useState(false);
  const [analyzeId, setAnalyzeId] = useState<number | null>(null);
  const [newComp, setNewComp] = useState({ name: "", domain: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: competitors, isLoading } = trpc.competitors.list.useQuery();

  const createMutation = trpc.competitors.create.useMutation({
    onSuccess: () => {
      utils.competitors.list.invalidate();
      setAddOpen(false);
      setNewComp({ name: "", domain: "", notes: "" });
      toast.success("Competitor added");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.competitors.delete.useMutation({
    onSuccess: () => {
      utils.competitors.list.invalidate();
      toast.success("Competitor removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const analyzeMutation = trpc.competitors.analyze.useMutation({
    onSuccess: () => {
      utils.competitors.list.invalidate();
      toast.success("Analysis complete!");
    },
    onError: (e) => toast.error(e.message),
  });

  const getCompDomain = (id: number) => competitors?.find((c) => c.id === id)?.domain ?? "";

  const gapMutation = trpc.competitors.contentGap.useMutation({
    onError: (err: any) => toast.error(err.message),
  });

  const selectedComp = competitors?.find((c) => c.id === analyzeId);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competitor Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and analyze your SEO competitors</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Competitor</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</Label>
                <Input value={newComp.name} onChange={(e) => setNewComp((f) => ({ ...f, name: e.target.value }))} placeholder="Competitor name" className="bg-background border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain *</Label>
                <Input value={newComp.domain} onChange={(e) => setNewComp((f) => ({ ...f, domain: e.target.value }))} placeholder="example.com" className="bg-background border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</Label>
                <Input value={newComp.notes} onChange={(e) => setNewComp((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." className="bg-background border-border/50" />
              </div>
              <Button
                  onClick={() => createMutation.mutate({ name: newComp.name, domain: newComp.domain })}
                disabled={!newComp.name || !newComp.domain || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Competitor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Competitors List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tracked Competitors</h2>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : competitors?.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="p-8 text-center">
                <Swords className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No competitors added yet</p>
              </CardContent>
            </Card>
          ) : (
            competitors?.map((comp) => (
              <Card
                key={comp.id}
                className={`bg-card border-border/50 cursor-pointer transition-all hover:border-primary/40 ${analyzeId === comp.id ? "border-primary/60 bg-primary/5" : ""}`}
                onClick={() => setAnalyzeId(comp.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{comp.name}</p>
                      <a
                        href={`https://${comp.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-3 h-3" />{comp.domain}
                      </a>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); analyzeMutation.mutate({ id: comp.id, domain: comp.domain }); }}>
                          <Sparkles className="w-4 h-4 mr-2" /> AI Analyze
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); if (confirm("Remove competitor?")) deleteMutation.mutate({ id: comp.id }); }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-1.5 rounded-lg bg-accent/30">
                      <p className="text-[10px] text-muted-foreground">DA</p>
                      <p className="text-xs font-bold">{comp.authorityScore ?? "—"}</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-accent/30">
                      <p className="text-[10px] text-muted-foreground">Traffic</p>
                      <p className="text-xs font-bold">{(comp as any).estimatedTraffic ? `${((comp as any).estimatedTraffic / 1000).toFixed(1)}K` : "—"}</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-accent/30">
                      <p className="text-[10px] text-muted-foreground">KWs</p>
                      <p className="text-xs font-bold">{(comp as any).keywordCount ?? "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Analysis Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!analyzeId ? (
            <Card className="bg-card border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center p-8">
                <Swords className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Select a competitor to view analysis</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Click any competitor from the list to see detailed insights</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {selectedComp?.name} — Domain Analysis
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analyzeMutation.mutate({ id: analyzeId, domain: getCompDomain(analyzeId) })}
                        disabled={analyzeMutation.isPending}
                        className="gap-2 border-primary/30 text-primary hover:bg-primary/10 text-xs"
                      >
                        {analyzeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Re-analyze
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Domain Authority", value: selectedComp?.authorityScore ?? "—", icon: Target, color: "text-primary" },
                      { label: "Est. Traffic", value: (selectedComp as any)?.estimatedTraffic ? `${((selectedComp as any).estimatedTraffic / 1000).toFixed(1)}K` : "—", icon: TrendingUp, color: "text-emerald-400" },
                      { label: "Keywords", value: (selectedComp as any)?.keywordCount ?? "—", icon: Search, color: "text-blue-400" },
                      { label: "Backlinks", value: selectedComp?.backlinksCount ? `${(selectedComp.backlinksCount / 1000).toFixed(1)}K` : "—", icon: Globe, color: "text-purple-400" },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-xl bg-accent/30 text-center">
                        <m.icon className={`w-4 h-4 mx-auto mb-1.5 ${m.color}`} />
                        <p className="text-lg font-bold">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              {selectedComp?.topKeywords && Array.isArray(selectedComp.topKeywords) && (selectedComp.topKeywords as any[]).length > 0 && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" /> Top Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {(selectedComp.topKeywords as any[]).slice(0, 8).map((kw: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                          <span className="text-sm">{kw.keyword || kw}</span>
                          {kw.rank && <span className="text-xs font-bold text-muted-foreground">#{kw.rank}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Gap */}
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Content Gap Analysis
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => gapMutation.mutate({ competitorId: analyzeId })}
                      disabled={gapMutation.isPending}
                      className="gap-2 border-primary/30 text-primary hover:bg-primary/10 text-xs"
                    >
                      {gapMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Analyze Gap
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {gapMutation.data ? (
                    <div className="space-y-3">
                      {gapMutation.data.gaps?.map((gap: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-border/50 bg-accent/20">
                          <p className="text-sm font-medium">{gap.topic}</p>
                          <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                          {gap.keywords && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {gap.keywords.slice(0, 4).map((kw: string) => (
                                <span key={kw} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{kw}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Click "Analyze Gap" to discover content opportunities</p>
                      <p className="text-xs mt-1 opacity-60">AI will identify topics your competitor ranks for that you don't</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
