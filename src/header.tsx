import { CircleUser, LogOut, Settings, User } from "lucide-react";
import { headerChipClass } from "@/ui/layout/nav";
import { notify } from "@/ui/notify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";
import { StatusDot } from "@/ui/status";
import { cn } from "@/ui/utils";

/** The chip the shell takes as `headerEnd`. Swap it for a real status once there is one. */
export function HeaderStatus() {
  return (
    <span className={cn(headerChipClass, "cursor-default")}>
      <StatusDot state="active" />
      <span className="hidden sm:inline">All systems go</span>
    </span>
  );
}

/** A placeholder account menu. Replace it with the app's own auth. */
export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CircleUser className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>you@example.com</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notify.success("Profile opened")}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notify.success("Settings opened")}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notify.success("Signed out")}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
