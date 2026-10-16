import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Boxes, CircleStop, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, errorMessage, type Item } from "@/lib/api";
import {
  DetailSection,
  DetailShell,
  OverviewPanel,
  OverviewRow,
  type DetailTabDefinition,
} from "@/ui/detail-shell";
import { SwitchField } from "@/ui/form";
import { notify } from "@/ui/notify";
import { StatusBadge } from "@/ui/status";
import { formatRelative } from "@/ui/utils";

type TabId = "overview" | "settings";

const TABS: readonly DetailTabDefinition<TabId>[] = [
  { id: "overview", label: "Overview" },
  { id: "settings", label: "Settings" },
];

export function ItemDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const item = useQuery({ queryKey: ["item", id], queryFn: () => api.item(id) });
  const [tab, setTab] = useState<TabId>("overview");

  const toggle = useMutation({
    mutationFn: (current: Item) =>
      api.updateItem(current.id, { status: current.status === "active" ? "paused" : "active" }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.setQueryData(["item", id], updated);
      notify.saved(updated.name);
    },
    onError: (error) => notify.error(error, errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      notify.deleted(item.data?.name ?? "Item");
      void navigate({ to: "/items" });
    },
    onError: (error) => notify.error(error, errorMessage(error)),
  });

  if (!item.data) return null;

  const data = item.data;
  const paused = data.status !== "active";

  return (
    <DetailShell
      icon={<Boxes />}
      title={data.name}
      subtitle={<span className="font-mono">{data.id}</span>}
      badge={<StatusBadge state={data.status} />}
      tabs={TABS}
      activeTab={tab}
      onActiveTabChange={setTab}
      actions={[
        {
          id: "toggle",
          label: paused ? "Resume" : "Pause",
          icon: paused ? Play : CircleStop,
          variant: "primary",
          onClick: () => toggle.mutate(data),
        },
        {
          id: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "danger",
          onClick: () => remove.mutate(),
        },
      ]}
      footer={<span>Created {formatRelative(Date.parse(data.createdAt))}</span>}
    >
      {tab === "overview" ? (
        <div className="grid gap-4 p-4">
          <DetailSection title="Summary">
            <OverviewPanel>
              <OverviewRow label="Status" value={data.status} />
              <OverviewRow label="Description" value={data.description || "—"} />
              <OverviewRow label="Created" value={formatRelative(Date.parse(data.createdAt))} />
              <OverviewRow label="Updated" value={formatRelative(Date.parse(data.updatedAt))} />
            </OverviewPanel>
          </DetailSection>
        </div>
      ) : (
        <div className="grid max-w-2xl gap-4 p-4">
          <SwitchField
            checked={!paused}
            onCheckedChange={() => toggle.mutate(data)}
            label="Active"
            description="A paused item keeps its settings and runs nothing."
          />
        </div>
      )}
    </DetailShell>
  );
}
