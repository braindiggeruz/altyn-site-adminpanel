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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Target,
  Trash2,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-400/20 text-blue-400 border-blue-400/30",
  in_progress: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  completed: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
};

const PRIORITY_DOTS: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-emerald-400",
};

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    targetKeyword: "",
    scheduledDate: "",
    status: "planned" as "planned" | "in_progress" | "completed",
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.calendar.list.useQuery({ year, month: month + 1 });

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      utils.calendar.list.invalidate();
      setAddOpen(false);
      setForm({ title: "", targetKeyword: "", scheduledDate: "", status: "planned", priority: "medium", notes: "" });
      toast.success("Event created");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      utils.calendar.list.invalidate();
      toast.success("Event deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return (events ?? []).filter((e) => {
      const d = new Date(e.scheduledDate);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const openAddForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setForm((f) => ({ ...f, scheduledDate: dateStr }));
    setSelectedDate(dateStr);
    setAddOpen(true);
  };

  const selectedDayEvents = selectedDate
    ? (events ?? []).filter((e) => {
        const d = new Date(e.scheduledDate);
        const [sy, sm, sd] = selectedDate.split("-").map(Number);
        return d.getFullYear() === sy && d.getMonth() === (sm - 1) && d.getDate() === sd;
      })
    : [];

  const stats = {
    planned: (events ?? []).filter((e) => e.status === "planned").length,
    inProgress: (events ?? []).filter((e) => e.status === "in_progress").length,
    completed: (events ?? []).filter((e) => e.status === "completed").length,
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Plan and schedule your content pipeline</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>New Content Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Article title or topic..." className="bg-background border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Keyword</Label>
                <Input value={form.targetKeyword} onChange={(e) => setForm((f) => ({ ...f, targetKeyword: e.target.value }))} placeholder="e.g. психолог онлайн" className="bg-background border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</Label>
                <Input type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} className="bg-background border-border/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
                    <SelectTrigger className="bg-background border-border/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as any }))}>
                    <SelectTrigger className="bg-background border-border/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." className="min-h-[60px] bg-background border-border/50" />
              </div>
              <Button
                onClick={() => createMutation.mutate({
                  ...form,
                  scheduledDate: new Date(form.scheduledDate),
                })}
                disabled={!form.title || !form.scheduledDate || createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Planned", value: stats.planned, color: "text-blue-400 bg-blue-400/10" },
          { label: "In Progress", value: stats.inProgress, color: "text-yellow-400 bg-yellow-400/10" },
          { label: "Completed", value: stats.completed, color: "text-emerald-400 bg-emerald-400/10" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {MONTHS[month]} {year}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{d}</div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="h-16 rounded-lg" />;
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSelected = selectedDate === dateStr;
                  return (
                    <div
                      key={i}
                      className={`h-16 rounded-lg p-1 cursor-pointer transition-all border ${
                        isSelected ? "border-primary/60 bg-primary/10" :
                        isToday ? "border-primary/30 bg-primary/5" :
                        "border-transparent hover:border-border/50 hover:bg-accent/30"
                      }`}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      onDoubleClick={() => openAddForDay(day)}
                    >
                      <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate border ${STATUS_COLORS[ev.status ?? 'planned'] || STATUS_COLORS.planned}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Double-click a day to add an event</p>
            </CardContent>
          </Card>
        </div>

        {/* Day Detail / Event List */}
        <div className="space-y-3">
          {selectedDate ? (
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No events</p>
                    <Button variant="outline" size="sm" className="mt-2 border-border/50" onClick={() => openAddForDay(parseInt(selectedDate.split("-")[2]))}>
                      <Plus className="w-3 h-3 mr-1" /> Add event
                    </Button>
                  </div>
                ) : (
                  selectedDayEvents.map((ev) => (
                    <div key={ev.id} className={`p-3 rounded-lg border ${STATUS_COLORS[ev.status ?? 'planned'] || STATUS_COLORS.planned}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOTS[ev.priority ?? 'medium'] || PRIORITY_DOTS.medium}`} />
                            <p className="text-xs font-semibold truncate">{ev.title}</p>
                          </div>
                          {ev.targetKeyword && (
                            <div className="flex items-center gap-1 text-[10px] opacity-70">
                              <Target className="w-2.5 h-2.5" />
                              {ev.targetKeyword}
                            </div>
                          )}
                          {ev.notes && <p className="text-[10px] mt-1 opacity-60 truncate">{ev.notes}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                          onClick={() => { if (confirm("Delete event?")) deleteMutation.mutate({ id: ev.id }); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click a day to see events</p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Upcoming This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-accent/30 rounded-lg animate-pulse" />)
              ) : (
                (events ?? [])
                  .filter((e) => e.status !== "completed")
                  .sort((a, b) => new Date(String(a.scheduledDate)).getTime() - new Date(String(b.scheduledDate)).getTime())
                  .slice(0, 5)
                  .map((ev) => (
                    <div key={ev.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOTS[ev.priority ?? 'medium'] || PRIORITY_DOTS.medium}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(String(ev.scheduledDate)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[ev.status ?? 'planned'] || STATUS_COLORS.planned}`}>
                        {(ev.status ?? 'planned').replace("_", " ")}
                      </span>
                    </div>
                  ))
              )}
              {!isLoading && (events ?? []).filter((e) => e.status !== "completed").length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
