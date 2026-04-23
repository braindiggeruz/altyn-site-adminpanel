import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Shield,
  User,
  Users,
  Crown,
  Eye,
  Clock,
  UserX,
  UserCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useLocation } from "wouter";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-400/15 text-red-400 border-red-400/30",
  editor: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  viewer: "bg-muted/50 text-muted-foreground border-border/50",
  user: "bg-muted/50 text-muted-foreground border-border/50",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Crown,
  editor: Shield,
  viewer: Eye,
  user: User,
};

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user]);

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.useQuery();

  const updateRoleMutation = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("Role updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deactivateMutation = trpc.admin.deactivateUser.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("User deactivated (role set to viewer)");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reactivateMutation = trpc.admin.reactivateUser.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("User reactivated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const stats = {
    total: users?.length ?? 0,
    admins: users?.filter((u: any) => u.role === "admin").length ?? 0,
    editors: users?.filter((u: any) => u.role === "editor").length ?? 0,
    viewers: users?.filter((u: any) => (u.role === "viewer" || u.role === "user")).length ?? 0,
  };

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage team members and their access roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Admins", value: stats.admins, icon: Crown, color: "text-red-400 bg-red-400/10" },
          { label: "Editors", value: stats.editors, icon: Shield, color: "text-blue-400 bg-blue-400/10" },
          { label: "Viewers", value: stats.viewers, icon: Eye, color: "text-muted-foreground bg-muted/30" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Info */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { role: "admin", label: "Admin", desc: "Full access: manage users, all content, SEO settings, and system configuration.", icon: Crown },
              { role: "editor", label: "Editor", desc: "Create and edit articles, manage keywords, run AI generation, view analytics.", icon: Shield },
              { role: "viewer", label: "Viewer", desc: "Read-only access to articles, analytics, and keyword data. Cannot edit.", icon: Eye },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.role} className={`p-3 rounded-xl border ${ROLE_COLORS[r.role]}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </div>
                  <p className="text-[11px] opacity-70">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {users?.map((u: any) => {
                const RoleIcon = ROLE_ICONS[u.role ?? "user"] || User;
                return (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/20 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(u.name || u.email || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name || "Unnamed User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || u.openId}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "Never"}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {u.id === user?.id ? (
                        <span className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 ${ROLE_COLORS[u.role ?? "user"]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {u.role} (you)
                        </span>
                      ) : (
                        <>
                          <Select
                            value={u.role ?? "user"}
                            onValueChange={(v) => updateRoleMutation.mutate({ userId: u.id, role: v as any })}
                          >
                            <SelectTrigger className={`h-7 text-xs w-28 border ${ROLE_COLORS[u.role ?? "user"]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          {u.role === "viewer" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                              title="Reactivate user"
                              onClick={() => reactivateMutation.mutate({ userId: u.id, role: "user" })}
                              disabled={reactivateMutation.isPending}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              title="Deactivate user (set to viewer)"
                              onClick={() => {
                                if (confirm(`Deactivate ${u.name || u.email}? They will lose edit access.`)) {
                                  deactivateMutation.mutate({ userId: u.id });
                                }
                              }}
                              disabled={deactivateMutation.isPending}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {users?.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
