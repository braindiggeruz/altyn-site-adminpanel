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
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Loader2,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
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
  const [editKw, setEditKw] = useState<{ id: number; currentRank: string; trend: "up" | "down" | "stable" } | null>(null);
  const [newKw, setNewKw] = useState({
    keyword: "",
    searchVolume: "",
    keywordDifficulty: "",
    cpc: "",
    trend: "stable" as "up" | "down" | "stable",
  });

  const utils = trpc.useUtils();
  const { data: keywords, isLoading } = trpc.keywords.list.useQuery({ search: search || undefined });

  const createMutation = trpc.keywords.create.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      setAddOpen(false);
      setNewKw({ keyword: "", searchVolume: "", keywordDifficulty: "", cpc: "", trend: "stable" });
      toast.success("Ключевое слово добавлено");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.keywords.delete.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      toast.success("Ключевое слово удалено");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = trpc.keywords.update.useMutation({
    onSuccess: () => {
      utils.keywords.list.invalidate();
      setEditKw(null);
      toast.success("Ключевое слово обновлено");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalVolume = keywords?.reduce((sum, kw) => sum + (kw.searchVolume ?? 0), 0) ?? 0;
  const tracked = keywords?.filter((kw) => kw.currentRank !== null).length ?? 0;
  const top10 = keywords?.filter((kw) => kw.currentRank !== null && kw.currentRank <= 10).length ?? 0;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ключевые слова</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Исследование, отслеживание и оптимизация целевых ключевых слов</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Добавить</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Добавить ключевое слово</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ключевое слово *</Label>
                  <Input
                    value={newKw.keyword}
                    onChange={(e) => setNewKw((f) => ({ ...f, keyword: e.target.value }))}
                    placeholder="Целевое ключевое слово..."
                    className="bg-background border-border/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Объём поиска</Label>
                    <Input
                      type="number"
                      value={newKw.searchVolume}
                      onChange={(e) => setNewKw((f) => ({ ...f, searchVolume: e.target.value }))}
                      placeholder="1200"
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Сложность (0-100)</Label>
                    <Input
                      type="number"
                      value={newKw.keywordDifficulty}
                      onChange={(e) => setNewKw((f) => ({ ...f, keywordDifficulty: e.target.value }))}
                      placeholder="45"
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPC ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newKw.cpc}
                      onChange={(e) => setNewKw((f) => ({ ...f, cpc: e.target.value }))}
                      placeholder="2.50"
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Тренд</Label>
                    <select
                      value={newKw.trend}
                      onChange={(e) => setNewKw((f) => ({ ...f, trend: e.target.value as "up" | "down" | "stable" }))}
                      className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm"
                    >
                      <option value="stable">Стабильный</option>
                      <option value="up">Растёт</option>
                      <option value="down">Падает</option>
                    </select>
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
                  Добавить ключевое слово
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Всего ключевых слов", value: keywords?.length ?? 0, icon: Search, color: "bg-primary/15 text-primary" },
          { label: "Суммарный объём", value: totalVolume.toLocaleString(), icon: TrendingUp, color: "bg-blue-400/15 text-blue-400" },
          { label: "Отслеживается позиций", value: tracked, icon: Target, color: "bg-purple-400/15 text-purple-400" },
          { label: "В ТОП-10", value: top10, icon: BarChart3, color: "bg-emerald-400/15 text-emerald-400" },
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
          placeholder="Поиск ключевых слов..."
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
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ключевое слово</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Объём</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Сложность</th>
                  <th className="p-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">CPC</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Тренд</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Позиция</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4 hidden sm:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                      <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-10 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="w-6 h-6" /></td>
                    </tr>
                  ))
                ) : keywords?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Ключевые слова не найдены</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
                        Добавить первое ключевое слово
                      </Button>
                    </td>
                  </tr>
                ) : (
                  keywords?.map((kw) => (
                    <tr key={kw.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                      <td className="p-4">
                        <span className="text-sm font-medium">{kw.keyword}</span>
                      </td>
                      <td className="p-4 text-right hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{kw.searchVolume?.toLocaleString() ?? "—"}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <DifficultyBar value={kw.keywordDifficulty} />
                      </td>
                      <td className="p-4 text-right hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{kw.cpc ? `$${Number(kw.cpc).toFixed(2)}` : "—"}</span>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        <TrendIcon trend={kw.trend} />
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-bold ${kw.currentRank && kw.currentRank <= 3 ? "text-emerald-400" : kw.currentRank && kw.currentRank <= 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
                          {kw.currentRank ? `#${kw.currentRank}` : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-7 h-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditKw({ id: kw.id, currentRank: kw.currentRank?.toString() ?? "", trend: (kw.trend as "up" | "down" | "stable") ?? "stable" })}>
                              <Pencil className="w-4 h-4 mr-2" /> Обновить позицию
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Удалить ключевое слово?")) deleteMutation.mutate({ id: kw.id });
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Удалить
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

      {/* Edit Rank Dialog */}
      <Dialog open={!!editKw} onOpenChange={(o) => !o && setEditKw(null)}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Обновить позицию</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Текущая позиция в Google</Label>
              <Input
                type="number"
                value={editKw?.currentRank ?? ""}
                onChange={(e) => setEditKw((prev) => prev ? { ...prev, currentRank: e.target.value } : null)}
                placeholder="например: 5"
                className="bg-background border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Тренд</Label>
              <select
                value={editKw?.trend ?? "stable"}
                onChange={(e) => setEditKw((prev) => prev ? { ...prev, trend: e.target.value as "up" | "down" | "stable" } : null)}
                className="w-full h-9 rounded-md border border-border/50 bg-background px-3 text-sm"
              >
                <option value="stable">Стабильный</option>
                <option value="up">Растёт</option>
                <option value="down">Падает</option>
              </select>
            </div>
            <Button
              onClick={() => {
                if (!editKw) return;
                updateMutation.mutate({
                  id: editKw.id,
                  currentRank: editKw.currentRank ? parseInt(editKw.currentRank) : undefined,
                  trend: editKw.trend,
                });
              }}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
