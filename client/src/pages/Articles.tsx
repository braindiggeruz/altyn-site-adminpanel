import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronDown,
  Edit,
  Eye,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SeoScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 80 ? "text-emerald-400 bg-emerald-400/10" : score >= 60 ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>
      <Zap className="w-2.5 h-2.5" />{score}
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

export default function Articles() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.articles.list.useQuery({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit,
    offset: page * limit,
  });

  const deleteMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      toast.success("Article deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const bulkMutation = trpc.articles.bulkAction.useMutation({
    onSuccess: () => {
      utils.articles.list.invalidate();
      setSelected([]);
      toast.success("Bulk action completed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const articles = data?.items ?? [];
  const total = data?.total ?? 0;

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === articles.length) setSelected([]);
    else setSelected(articles.map((a) => a.id));
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} articles total</p>
        </div>
        <Button onClick={() => setLocation("/articles/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 bg-background border-border/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40 bg-background border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {selected.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border/50">
                    {selected.length} selected <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => bulkMutation.mutate({ ids: selected, action: "publish" })}>
                    Publish selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkMutation.mutate({ ids: selected, action: "archive" })}>
                    Archive selected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => bulkMutation.mutate({ ids: selected, action: "delete" })}
                  >
                    Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 w-10">
                    <Checkbox
                      checked={selected.length === articles.length && articles.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Article</th>
                  <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Keyword</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">SEO</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Rank</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Views</th>
                  <th className="p-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="p-4"><Skeleton className="w-4 h-4" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-4 hidden lg:table-cell"><Skeleton className="h-5 w-12 mx-auto" /></td>
                      <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-16 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-20 mx-auto" /></td>
                      <td className="p-4"><Skeleton className="w-6 h-6" /></td>
                    </tr>
                  ))
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No articles found</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/articles/new")}>
                        Create your first article
                      </Button>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors group">
                      <td className="p-4">
                        <Checkbox
                          checked={selected.includes(article.id)}
                          onCheckedChange={() => toggleSelect(article.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => setLocation(`/articles/${article.id}/edit`)}>
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">/{article.slug}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                          {article.targetKeyword || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        <SeoScoreBadge score={article.seoScore} />
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        <span className={`text-sm font-bold ${article.googleRank && article.googleRank <= 3 ? "text-emerald-400" : article.googleRank && article.googleRank <= 10 ? "text-yellow-400" : "text-muted-foreground"}`}>
                          {article.googleRank ? `#${article.googleRank}` : "—"}
                        </span>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {article.views?.toLocaleString() ?? 0}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/articles/${article.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Delete this article?")) deleteMutation.mutate({ id: article.id });
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

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="border-border/50">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage((p) => p + 1)} className="border-border/50">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
