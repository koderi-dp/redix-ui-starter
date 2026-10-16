import { AppShell } from "@/ui/layout/app-shell";
import { AppToaster } from "@/ui/toaster";
import { HeaderStatus, UserMenu } from "./header";
import { brand, nav } from "./nav";

/** The root route: the app shell around every page, and the toaster mounted once. */
export function Shell() {
  return (
    <>
      <AppShell
        nav={nav}
        brand={brand}
        headerEnd={
          <>
            <HeaderStatus />
            <UserMenu />
          </>
        }
        // The detail page scrolls its own panes, so it gets a fixed-height main.
        fullHeight={(pathname) => pathname.startsWith("/items/")}
      />
      <AppToaster />
    </>
  );
}
