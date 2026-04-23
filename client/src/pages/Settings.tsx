import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Globe,
  Loader2,
  Map,
  RefreshCw,
  Save,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://altyn-therapy.uz/sitemap.xml`;

export default function Settings() {
  // Form state
  const [siteUrl, setSiteUrl] = useState("https://altyn-therapy.uz");
  const [siteName, setSiteName] = useState("Altyn Therapy");
  const [defaultMeta, setDefaultMeta] = useState("Altyn Therapy — профессиональная психологическая помощь онлайн. {keyword}. Запишитесь на консультацию.");
  const [gscProperty, setGscProperty] = useState("");
  const [ga4Id, setGa4Id] = useState("");
  const [robotsTxt, setRobotsTxt] = useState(DEFAULT_ROBOTS);
  const [aiLang, setAiLang] = useState("Russian");
  const [aiTone, setAiTone] = useState("professional");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const utils = trpc.useUtils();

  // Load saved settings
  const { data: savedSettings } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (savedSettings && !settingsLoaded) {
      if (savedSettings.siteUrl) setSiteUrl(savedSettings.siteUrl);
      if (savedSettings.siteName) setSiteName(savedSettings.siteName);
      if (savedSettings.defaultMetaDescription) setDefaultMeta(savedSettings.defaultMetaDescription);
      if (savedSettings.robotsTxt) setRobotsTxt(savedSettings.robotsTxt);
      if (savedSettings.aiGenerationLanguage) setAiLang(savedSettings.aiGenerationLanguage);
      if (savedSettings.aiTone) setAiTone(savedSettings.aiTone);
      setSettingsLoaded(true);
    }
  }, [savedSettings, settingsLoaded]);

  // Save settings mutation
  const saveMutation = trpc.settings.save.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Settings saved successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  // Sitemap generation
  const { refetch: generateSitemap, isFetching: sitemapLoading } = trpc.seo.generateSitemap.useQuery(undefined, { enabled: false });

  const handleSitemap = async () => {
    const result = await generateSitemap();
    if (result.data) toast.success(`Sitemap generated with ${result.data.count} URLs!`);
  };

  const handleSaveRobots = () => {
    saveMutation.mutate({ robotsTxt });
  };

  const handleSaveSeoSettings = () => {
    saveMutation.mutate({
      siteUrl,
      siteName,
      defaultMetaDescription: defaultMeta,
      aiGenerationLanguage: aiLang,
      aiTone,
    });
  };

  const { data: auditLog } = trpc.admin.auditLog.useQuery({ limit: 20 });

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure SEO settings, integrations, and system preferences</p>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList className="bg-card border border-border/50 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="seo" className="text-xs gap-1.5"><Search className="w-3.5 h-3.5" /> SEO</TabsTrigger>
          <TabsTrigger value="sitemap" className="text-xs gap-1.5"><Map className="w-3.5 h-3.5" /> Sitemap</TabsTrigger>
          <TabsTrigger value="robots" className="text-xs gap-1.5"><Shield className="w-3.5 h-3.5" /> Robots.txt</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs gap-1.5"><Globe className="w-3.5 h-3.5" /> Integrations</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" /> Audit Log</TabsTrigger>
        </TabsList>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                Global SEO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site URL</Label>
                  <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className="bg-background border-border/50" placeholder="https://altyn-therapy.uz" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="bg-background border-border/50" placeholder="Altyn Therapy" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Meta Description Template</Label>
                <Textarea
                  value={defaultMeta}
                  onChange={(e) => setDefaultMeta(e.target.value)}
                  className="min-h-[80px] bg-background border-border/50"
                  placeholder="Use {keyword} as placeholder for target keyword"
                />
                <p className="text-[10px] text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{keyword}"}</code> as placeholder for the target keyword</p>
              </div>
              <Separator className="border-border/30" />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrations</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Google Search Console Property</Label>
                    <Input value={gscProperty} onChange={(e) => setGscProperty(e.target.value)} placeholder="sc-domain:altyn-therapy.uz" className="bg-background border-border/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Google Analytics 4 Measurement ID</Label>
                    <Input value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX" className="bg-background border-border/50" />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSaveSeoSettings}
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap */}
        <TabsContent value="sitemap" className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Map className="w-4 h-4 text-primary" />
                XML Sitemap Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Auto-generated on publish</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sitemap is automatically updated when articles are published. It includes all published articles with their SEO metadata.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sitemap URL</Label>
                <div className="flex gap-2">
                  <Input value={`${siteUrl}/sitemap.xml`} readOnly className="bg-background border-border/50 text-muted-foreground" />
                  <Button variant="outline" size="sm" className="border-border/50 gap-1.5 shrink-0" onClick={() => navigator.clipboard.writeText(`${siteUrl}/sitemap.xml`).then(() => toast.success("Copied!"))}>
                    <Code className="w-3.5 h-3.5" /> Copy
                  </Button>
                </div>
              </div>
              <Separator className="border-border/30" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Regenerate Sitemap</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Manually regenerate the sitemap from all published articles</p>
                </div>
                <Button onClick={handleSitemap} disabled={sitemapLoading} className="gap-2">
                  {sitemapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Google Search Console Submission</p>
                  <p className="text-xs text-muted-foreground mt-0.5">To auto-submit articles for indexing, add your Google Search Console API key in Secrets. Without it, submissions are queued locally.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Robots.txt */}
        <TabsContent value="robots" className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                robots.txt Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">Changes are saved to the database and served at <code className="bg-muted px-1 rounded">/robots.txt</code>. The file is auto-updated when you publish articles.</p>
              </div>
              <Textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="min-h-[200px] font-mono text-xs bg-background border-border/50"
                spellCheck={false}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveRobots} disabled={saveMutation.isPending} className="gap-2">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save robots.txt
                </Button>
                <Button variant="outline" className="border-border/50 gap-2" onClick={() => setRobotsTxt(DEFAULT_ROBOTS)}>
                  <RefreshCw className="w-4 h-4" /> Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          {[
            {
              name: "Google Search Console",
              icon: Search,
              description: "Auto-submit articles for indexing, track search performance",
              status: gscProperty ? "connected" : "disconnected",
              note: "Add GSC_API_KEY in project Secrets to enable auto-indexing",
            },
            {
              name: "Google Analytics 4",
              icon: Globe,
              description: "Track organic traffic, user behavior, and conversions",
              status: ga4Id ? "connected" : "disconnected",
              note: "Set GA4_MEASUREMENT_ID in project Secrets for full tracking",
            },
            {
              name: "Semrush API",
              icon: Search,
              description: "Keyword research, competitor analysis, rank tracking",
              status: "disconnected",
              note: "Add SEMRUSH_API_KEY in project Secrets to enable real data",
            },
          ].map((integration) => (
            <Card key={integration.name} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <integration.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{integration.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 ${integration.status === "connected" ? "border-emerald-500/50 text-emerald-400" : "border-muted-foreground/30 text-muted-foreground"}`}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-muted/30 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground">{integration.note}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generation Language</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["Russian", "Uzbek", "English"].map((lang) => (
                      <Button
                        key={lang}
                        variant={aiLang === lang ? "default" : "outline"}
                        size="sm"
                        className="border-border/50"
                        onClick={() => setAiLang(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Writing Tone</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["professional", "friendly", "academic"].map((tone) => (
                      <Button
                        key={tone}
                        variant={aiTone === tone ? "default" : "outline"}
                        size="sm"
                        className="border-border/50 capitalize"
                        onClick={() => setAiTone(tone)}
                      >
                        {tone}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">AI generation uses the built-in LLM integration. No external API key required — powered by the Manus AI infrastructure.</p>
              </div>
              <Button onClick={() => saveMutation.mutate({ aiGenerationLanguage: aiLang, aiTone })} disabled={saveMutation.isPending} className="gap-2">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Activity Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Entity</th>
                      <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">User ID</th>
                      <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!auditLog ? (
                      <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                    ) : auditLog.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No activity recorded yet</td></tr>
                    ) : (
                      auditLog.map((log) => (
                        <tr key={log.id} className="border-b border-border/30 hover:bg-accent/10">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-xs font-mono font-medium">{log.action}</span>
                            </div>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                              {log.entityType ?? "—"}{log.entityId ? ` #${log.entityId}` : ""}
                            </Badge>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="w-3 h-3" /> {log.userId}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
