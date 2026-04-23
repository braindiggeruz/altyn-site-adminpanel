import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Loader2 } from "lucide-react";

// Pages
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/Articles";
import ArticleEditor from "./pages/ArticleEditor";
import Keywords from "./pages/Keywords";
import Competitors from "./pages/Competitors";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import AdminUsers from "./pages/AdminUsers";
import Settings from "./pages/Settings";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ALTYN SEO Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/new" component={ArticleEditor} />
      <Route path="/articles/:id/edit" component={ArticleEditor} />
      <Route path="/keywords" component={Keywords} />
      <Route path="/competitors" component={Competitors} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AuthGate>
            <DashboardLayout>
              <Router />
            </DashboardLayout>
          </AuthGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
