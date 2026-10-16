import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Activity, Boxes, CircleAlert } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { TimeChart } from "@/ui/charts";
import { seriesColor } from "@/ui/chart-format";
import { PageHeader } from "@/ui/page-header";
import { PageShell } from "@/ui/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/primitives/table";
import { StatusBadge } from "@/ui/status";
import { formatRelative } from "@/ui/utils";

/** Sample data for the chart, until the API has a history endpoint. */
function sampleRows(from: number, to: number) {
  const count = 48;
  const step = (to - from) / (count - 1);
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index / 5) * 0.5 + 0.5;
    return {
      t: Math.round(from + index * step),
      throughput: Math.round(180 + wave * 120 + (index % 5) * 6),
    };
  });
}

export function DashboardPage() {
  const overview = useQuery({ queryKey: ["overview"], queryFn: api.overview });
  const items = useQuery({ queryKey: ["items"], queryFn: api.items });
  const [now] = useState(() => Date.now());
  const from = now - 15 * 60_000;

  const stats = overview.data?.items;

  return (
    <PageShell gap="loose">
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        description="The counts come from the API; the chart is sample data until there is a history endpoint."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{stats?.total ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{stats?.active ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{stats?.failed ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <TimeChart
        title="Throughput"
        icon={<Activity />}
        description="Sample data, last 15 minutes"
        rows={sampleRows(from, now)}
        series={[{ id: "throughput", name: "Throughput", color: seriesColor(0) }]}
        from={from}
        to={now}
        format={(value) => `${value} MB/s`}
      />

      <section className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Boxes className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Recent items</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items.data ?? []).slice(0, 5).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    to="/items/$id"
                    params={{ id: item.id }}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge state={item.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatRelative(Date.parse(item.updatedAt))}
                </TableCell>
              </TableRow>
            ))}
            {items.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CircleAlert className="size-4" /> No items yet.
                  </span>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>
    </PageShell>
  );
}
