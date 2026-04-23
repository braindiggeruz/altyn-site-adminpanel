import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  Globe,
  History,
  Link2,
  Loader2,
  Save,
  Sparkles,
  Target,
  XCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  Code,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SeoCheck {
  label: string;
  pass: boolean;
  hint: string;
}

function SeoChecklist({ checks, score }: { checks: SeoCheck[]; score: number }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const bgColor = score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">SEO Score</span>
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <Progress value={score} className="h-2" />
      <div className="space-y-1.5 mt-3">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2 py-1">
            {check.pass ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400/60 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className={`text-xs font-medium ${check.pass ? "text-foreground" : "text-muted-foreground"}`}>
                {check.label}
              </p>
              {!check.pass && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{check.hint}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArticleEditor() {
  const params = useParams<{ id?: string }>();
  const articleId = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!articleId;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    title: "",
    h1: "",
    metaDescription: "",
    metaKeywords: "",
    targetKeyword: "",
    content: "",
    excerpt: "",
    status: "draft" as "draft" | "scheduled" | "published" | "archived",
    categoryId: undefined as number | undefined,
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    canonicalUrl: "",
    schemaType: "Article",
    schemaJson: null as unknown,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Load article if editing
  const { data: article, isLoading: articleLoading } = trpc.articles.byId.useQuery(
    { id: articleId! },
    { enabled: isEditing }
  );

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: versions } = trpc.articles.versions.useQuery(
    { articleId: articleId! },
    { enabled: isEditing && showVersions }
  );

  // SEO score query
  const { data: seoData, refetch: refetchSeo } = trpc.seo.score.useQuery(
    {
      title: form.title,
      h1: form.h1,
      metaDescription: form.metaDescription,
      metaKeywords: form.metaKeywords,
      content: form.content,
      targetKeyword: form.targetKeyword,
      schemaJson: form.schemaJson,
      ogTitle: form.ogTitle,
      canonicalUrl: form.canonicalUrl,
    },
    { enabled: form.title.length > 0 }
  );

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        h1: article.h1 || "",
        metaDescription: article.metaDescription || "",
        metaKeywords: article.metaKeywords || "",
        targetKeyword: article.targetKeyword || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        status: (article.status as any) || "draft",
        categoryId: article.categoryId ?? undefined,
        ogTitle: article.ogTitle || "",
        ogDescription: article.ogDescription || "",
        twitterTitle: article.twitterTitle || "",
        twitterDescription: article.twitterDescription || "",
        canonicalUrl: article.canonicalUrl || "",
        schemaType: article.schemaType || "Article",
        schemaJson: article.schemaJson,
        tags: Array.isArray(article.tags) ? (article.tags as string[]) : [],
      });
    }
  }, [article]);

  const createMutation = trpc.articles.create.useMutation({
    onSuccess: (data) => {
      toast.success("Article created!");
      setLocation(`/articles/${data.id}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      utils.articles.byId.invalidate({ id: articleId! });
      toast.success("Article saved!");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateMetaMutation = trpc.seo.generateMeta.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({
        ...f,
        h1: data.h1 || f.h1,
        metaDescription: data.metaDescription || f.metaDescription,
        metaKeywords: data.metaKeywords || f.metaKeywords,
        schemaType: data.schemaType || f.schemaType,
      }));
      toast.success("AI metadata generated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateSchemaMutation = trpc.seo.generateSchema.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, schemaJson: data }));
      setShowSchema(true);
      toast.success("Schema.org JSON-LD generated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload = {
      ...form,
      categoryId: form.categoryId,
      schemaJson: form.schemaJson,
    };
    if (isEditing) {
      updateMutation.mutate({ id: articleId!, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleGenerateMeta = () => {
    if (!form.title) { toast.error("Add a title first"); return; }
    generateMetaMutation.mutate({
      title: form.title,
      content: form.content,
      targetKeyword: form.targetKeyword,
    });
  };

  const handleGenerateSchema = () => {
    generateSchemaMutation.mutate({
      title: form.title,
      h1: form.h1,
      metaDescription: form.metaDescription,
      schemaType: form.schemaType,
      slug: form.title.toLowerCase().replace(/\s+/g, "-"),
      authorName: user?.name || undefined,
    });
  };

  const handleSuggestLinks = () => {
    toast.info("Функция внутренней перелинковки требует OpenAI API. Добавьте OPENAI_API_KEY в настройках.");
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && articleLoading) {
    return (
      <div className="space-y-4 max-w-[1400px]">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/articles")} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEditing ? "Edit Article" : "New Article"}</h1>
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-0.5">
                SEO Score: <span className={`font-semibold ${(seoData?.score ?? 0) >= 80 ? "text-emerald-400" : (seoData?.score ?? 0) >= 60 ? "text-yellow-400" : "text-red-400"}`}>{seoData?.score ?? "—"}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
            <SelectTrigger className="w-36 bg-background border-border/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border/50">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO Tags</TabsTrigger>
              <TabsTrigger value="social">Social / OG</TabsTrigger>
              {isEditing && <TabsTrigger value="links">Internal Links</TabsTrigger>}
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article title..."
                  className="text-base font-medium bg-card border-border/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</Label>
                  <span className="text-xs text-muted-foreground">{form.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your article content here... (Markdown supported)"
                  className="min-h-[400px] font-mono text-sm bg-card border-border/50 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Brief summary (used in listings and social shares)..."
                  className="min-h-[80px] bg-card border-border/50"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="bg-card border-border/50"
                  />
                  <Button variant="outline" size="sm" onClick={addTag} className="border-border/50">Add</Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-accent text-accent-foreground cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                        onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">SEO Metadata</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMeta}
                  disabled={generateMetaMutation.isPending}
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  {generateMetaMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Generate
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Keyword</Label>
                <Input
                  value={form.targetKeyword}
                  onChange={(e) => setForm((f) => ({ ...f, targetKeyword: e.target.value }))}
                  placeholder="e.g. гипнотерапевт онлайн"
                  className="bg-card border-border/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">H1 Tag</Label>
                  <span className="text-xs text-muted-foreground">{form.h1.length}/70</span>
                </div>
                <Input
                  value={form.h1}
                  onChange={(e) => setForm((f) => ({ ...f, h1: e.target.value }))}
                  placeholder="Main H1 heading..."
                  className={`bg-card border-border/50 ${form.h1.length > 70 ? "border-red-400" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Description</Label>
                  <span className={`text-xs ${form.metaDescription.length >= 120 && form.metaDescription.length <= 160 ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {form.metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  placeholder="Meta description (120-160 chars)..."
                  className={`min-h-[80px] bg-card border-border/50 ${form.metaDescription.length > 160 ? "border-red-400" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Keywords</Label>
                <Input
                  value={form.metaKeywords}
                  onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                  placeholder="keyword1, keyword2, keyword3..."
                  className="bg-card border-border/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canonical URL</Label>
                <Input
                  value={form.canonicalUrl}
                  onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
                  placeholder="https://www.altyn-therapy.uz/articles/..."
                  className="bg-card border-border/50"
                />
              </div>

              {/* Schema.org */}
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  className="flex items-center justify-between w-full p-3 hover:bg-accent/30 transition-colors"
                  onClick={() => setShowSchema((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Schema.org JSON-LD</span>
                    {!!form.schemaJson && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">✓ Set</span>}
                  </div>
                  {showSchema ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSchema && (
                  <div className="p-3 border-t border-border/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Select value={form.schemaType} onValueChange={(v) => setForm((f) => ({ ...f, schemaType: v }))}>
                        <SelectTrigger className="w-40 bg-background border-border/50 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                          <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                          <SelectItem value="FAQPage">FAQPage</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={handleGenerateSchema} disabled={generateSchemaMutation.isPending} className="gap-2 border-border/50">
                        {generateSchemaMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generate
                      </Button>
                    </div>
                    {!!form.schemaJson && (
                      <pre className="text-xs bg-background rounded-lg p-3 overflow-auto max-h-48 text-emerald-400 border border-border/50">
                        {String(JSON.stringify(form.schemaJson, null, 2))}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Open Graph Tags
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OG Title</Label>
                    <Input value={form.ogTitle} onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))} placeholder="og:title" className="bg-card border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OG Description</Label>
                    <Textarea value={form.ogDescription} onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))} placeholder="og:description" className="min-h-[80px] bg-card border-border/50" />
                  </div>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div>
                <h3 className="text-sm font-semibold mb-3">Twitter Card Tags</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Twitter Title</Label>
                    <Input value={form.twitterTitle} onChange={(e) => setForm((f) => ({ ...f, twitterTitle: e.target.value }))} placeholder="twitter:title" className="bg-card border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Twitter Description</Label>
                    <Textarea value={form.twitterDescription} onChange={(e) => setForm((f) => ({ ...f, twitterDescription: e.target.value }))} placeholder="twitter:description" className="min-h-[80px] bg-card border-border/50" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Internal Links Tab */}
            {isEditing && (
              <TabsContent value="links" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" /> Internal Link Suggestions
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSuggestLinks}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Suggest
                  </Button>
                </div>
                {false ? null : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Нажмите "AI Suggest" для получения рекомендаций по внутренней перелинковке (OpenAI API)</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* SEO Score */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> SEO Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seoData ? (
                <SeoChecklist checks={seoData.checks} score={seoData.score} />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs">Add a title to see SEO analysis</p>
                </div>
              )}
              {seoData && (
                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-accent/30">
                    <p className="text-xs text-muted-foreground">Words</p>
                    <p className="text-sm font-bold">{seoData.wordCount}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/30">
                    <p className="text-xs text-muted-foreground">KW Density</p>
                    <p className={`text-sm font-bold ${seoData.density >= 1 && seoData.density <= 3 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {seoData.density}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Settings */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
                <Select
                  value={form.categoryId?.toString() ?? "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === "none" ? undefined : parseInt(v) }))}
                >
                  <SelectTrigger className="bg-background border-border/50 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          {isEditing && (
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <button
                  className="flex items-center justify-between w-full"
                  onClick={() => setShowVersions((v) => !v)}
                >
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" /> Version History
                  </CardTitle>
                  {showVersions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CardHeader>
              {showVersions && (
                <CardContent className="space-y-2">
                  {versions?.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No versions yet</p>
                  ) : (
                    versions?.map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-accent/20">
                        <div>
                          <p className="text-xs font-medium">v{v.version}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{v.title}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
