import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Pencil } from "lucide-react";
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
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function TrendIcon({ trend }: { trend: string | null }) {
  if (trend === "up") return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function DifficultyBar({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const color = value <= 30 ? "bg-emerald-400" : value <= 60 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

export default function Keywords() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [editKw, setEditKw] = useState<{ id: number; currentRank: string; trend: "up" | "down" | "stable" } | null>(null);
  const [seedKeyword, setSeedKeyword] = useState("");
  const [newKw, setNewKw] = useState({ keyword: "", searchVolume: "", keywordDifficulty: "", cpc: "", trend: "stable" as "up" | "down" | "stable" });

  const utils = trpc.useUtils();
  const { data: keywords, isLoading } = trpc.keywords.list.useQuery({ search: search || undefined });

  const createMutation = trpc.keywords.create.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      setAddOpen(false);
      setNewKw({ keyword: "", searchVolume: "", keywordDifficulty: "", cpc: "", trend: "stable" });
      toast.success("Keyword added");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.keywords.delete.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      toast.success("Keyword deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.keywords.update.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      setEditKw(null);
      toast.success("Keyword updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const aiSuggestMutation = trpc.keywords.aiSuggest.useMutation({
    onSuccess: async (suggestions) => {
      for (const s of suggestions) {
        await createMutation.mutateAsync({
          keyword: s.keyword,
          searchVolume: s.searchVolume,
          keywordDifficulty: s.keywordDifficulty,
          cpc: s.cpc,
          trend: s.trend,
        });
      }
      setAiOpen(false);
      setSeedKeyword("");
      toast.success(`${suggestions.length} keywords added`);
    },
    onError: (e) => toast.error(e.message),
  });

  const totalVolume = keywords?.reduce((sum, kw) => sum + (kw.searchVolume ?? 0), 0) ?? 0;
  const tracked = keywords?.filter((kw) => kw.currentRank !== null).length ?? 0;
  const top10 = keywords?.filter((kw) => kw.currentRank !== null && kw.currentRank <= 10).length ?? 0;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Keywords</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Research, track, and optimize your target keywords</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                <Sparkles className="w-4 h-4" /> AI Research
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI Keyword Research
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seed Keyword</Label>
                  <Input
                    value={seedKeyword}
                    onChange={(e) => setSeedKeyword(e.target.value)}
                    placeholder="e.g. гипнотерапия, психолог онлайн..."
                    className="bg-background border-border/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">AI will suggest 10 related keywords with search volume, difficulty, and CPC data.</p>
                <Button
                  onClick={() => aiSuggestMutation.mutate({ seed: seedKeyword })}
                  disabled={!seedKeyword || aiSuggestMutation.isPending}
                  className="w-full gap-2"
                >
                  {aiSuggestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Keywords
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Keyword</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Add Keyword</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword *</Label>
                  <Input value={newKw.keyword} onChange={(e) => setNewKw((f) => ({ ...f, keyword: e.target.value }))} placeholder="Target keyword..." className="bg-background border-border/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Volume</Label>
                    <Input type="number" value={newKw.searchVolume} onChange={(e) => setNewKw((f) => ({ ...f, searchVolume: e.target.value }))} placeholder="1200" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty (0-100)</Label>
                    <Input type="number" value={newKw.keywordDifficulty} onChange={(e) => setNewKw((f) => ({ ...f, keywordDifficulty: e.target.value }))} placeholder="45" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPC ($)</Label>
                    <Input type="number" step="0.01" value={newKw.cpc} onChange={(e) => setNewKw((f) => ({ ...f, cpc: e.target.value }))} placeholder="2.50" className="bg-background border-border/50" />
                  </div>
                </div>
                <Button
                  onClick={() => createMutation.mutate({
                    keyword: newKw.keyword,
                    searchVolume: newKw.searchVolume ? parseInt(newKw.searchVolume) : undefined,
                    keywordDifficulty: newKw.keywordDifficulty ? parseInt(newKw.keywordDifficulty) : undefined,
                    cpc: newKw.cpc ? parseFloat(newKw.cpc) : undefined,
                    trend: newKw.trend,
                  })}
                  disabled={!newKw.keyword || createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Keyword
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Keywords", value: keywords?.length ?? 0, icon: Search, color: "bg-primary/15 text-primary" },
          { label: "Total Search Volume", value: totalVolume.toLocaleString(), icon: TrendingUp, color: "bg-blue-400/15 text-blue-400" },
          { label: "Tracked Rankings", value: tracked, icon: Target, color: "bg-purple-400/15 text-purple-400" },
          { label: "Top 10 Rankings", value: top10, icon: BarChart3, color: "bg-emerald-400/15 text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border/50"
        />
      </div>

      {/* Keywords Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Volume</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Difficulty</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">CPC</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Trend</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4 hidden sm:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-3 w-24" /></td>
                      <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-12 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="w-6 h-6" /></td>
                    </tr>
                  ))
                ) : keywords?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No keywords found</p>
                    </td>
                  </tr>
                ) : (
                  keywords?.map((kw) => (
                    <tr key={kw.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-medium">{kw.keyword}</p>
                        {kw.previousRank && kw.currentRank && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            prev: #{kw.previousRank}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right hidden sm:table-cell">
                        <span className="text-sm font-medium">{kw.searchVolume?.toLocaleString() ?? "—"}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <DifficultyBar value={kw.keywordDifficulty} />
                      </td>
                      <td className="p-4 text-right hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">${kw.cpc?.toFixed(2) ?? "—"}</span>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        <TrendIcon trend={kw.trend} />
                      </td>
                      <td className="p-4 text-center">
                        {kw.currentRank ? (
                          <span className={`text-sm font-bold ${kw.currentRank <= 3 ? "text-emerald-400" : kw.currentRank <= 10 ? "text-yellow-400" : kw.currentRank <= 20 ? "text-orange-400" : "text-muted-foreground"}`}>
                            #{kw.currentRank}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditKw({ id: kw.id, currentRank: String(kw.currentRank ?? ""), trend: (kw.trend ?? "stable") as "up" | "down" | "stable" })}
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Edit Rank
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Delete this keyword?")) deleteMutation.mutate({ id: kw.id });
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Keyword Dialog */}
      <Dialog open={!!editKw} onOpenChange={(o) => !o && setEditKw(null)}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" /> Update Keyword Rank
            </DialogTitle>
          </DialogHeader>
          {editKw && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Rank Position</Label>
                <Input
                  type="number"
                  value={editKw.currentRank}
                  onChange={(e) => setEditKw((f) => f ? { ...f, currentRank: e.target.value } : null)}
                  placeholder="e.g. 5"
                  className="bg-background border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</Label>
                <div className="flex gap-2">
                  {(["up", "stable", "down"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={editKw.trend === t ? "default" : "outline"}
                      size="sm"
                      className="flex-1 border-border/50"
                      onClick={() => setEditKw((f) => f ? { ...f, trend: t } : null)}
                    >
                      {t === "up" ? "↑ Up" : t === "down" ? "↓ Down" : "→ Stable"}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => updateMutation.mutate({
                  id: editKw.id,
                  currentRank: editKw.currentRank ? parseInt(editKw.currentRank) : undefined,
                  trend: editKw.trend,
                })}
                disabled={updateMutation.isPending}
                className="w-full gap-2"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
