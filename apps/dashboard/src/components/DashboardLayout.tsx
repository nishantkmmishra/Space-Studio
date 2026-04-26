import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useAuth } from "@/lib/auth";
import { useMemo } from "react";
import { GlobalStatus } from "./GlobalStatus";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface NavItem {
  to: string;
  icon: IconName;
  label: string;
}

const INTELLIGENCE_NAV: NavItem[] = [
  { to: "/app/knowledge", icon: "book",     label: "Knowledge Base" },
  { to: "/app/chats",     icon: "message",  label: "Conversations" },
];

const SYSTEM_NAV: NavItem[] = [
  { to: "/app/members",   icon: "users",    label: "Members Registry" },
  { to: "/app/modlogs",   icon: "shield",   label: "Audit Logs" },
  { to: "/app/console",   icon: "terminal", label: "System Console" },
];

const ACCOUNT_NAV: NavItem[] = [
  { to: "/app/profile",   icon: "user",     label: "Profile" },
  { to: "/app/settings",  icon: "settings", label: "Settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const userMeta = useMemo(() => {
    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator";
    return {
      name,
      email: user?.email || "",
      initials: name.slice(0, 2).toUpperCase()
    };
  }, [user]);

  const pageTitle = useMemo(() => {
    const path = location.pathname.split("/").pop();
    switch (path) {
      case "knowledge": return "Knowledge Base";
      case "chats":     return "Conversations";
      case "members":   return "Members Registry";
      case "modlogs":   return "Audit Logs";
      case "console":   return "System Console";
      case "profile":   return "Profile";
      case "settings":  return "Settings";
      default:          return "Dashboard";
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[280px] shrink-0 bg-card border-r border-border flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        {/* Brand Identity */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground overflow-hidden shadow-lg transition-all hover:scale-105 flex items-center justify-center p-2">
              <Icon name="sparkle" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-serif text-[20px] font-black leading-tight tracking-tight text-foreground">Space</div>
              <div className="text-[10px] text-stone uppercase tracking-widest font-black mt-0.5 opacity-60">Studio v1.0</div>
            </div>
          </div>
        </div>

        {/* Workspace Context */}
        <div className="px-4 mb-6">
          <div className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 hover:border-primary/20 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-[11px] font-black text-primary shadow-sm">
              SP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">Main Workspace</div>
              <div className="text-[10px] text-stone font-bold uppercase tracking-wider opacity-50">Guild ID: 123456...</div>
            </div>
            <Icon name="chevron" size={14} className="text-stone opacity-50" />
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-4 space-y-7 overflow-y-auto scrollbar-hide pb-6">
          <NavGroup title="Intelligence">
            {INTELLIGENCE_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </NavGroup>

          <NavGroup title="System">
            {SYSTEM_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </NavGroup>

          <NavGroup title="Account">
            {ACCOUNT_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </NavGroup>
        </nav>

        {/* User Context Footer */}
        <footer className="p-4 border-t border-border bg-secondary/10">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-[15px] font-black shadow-md">
                {userMeta.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground truncate">{userMeta.name}</div>
                <div className="text-[10.5px] text-stone font-medium truncate opacity-60">{userMeta.email}</div>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 text-stone hover:text-destructive">
                  <Icon name="logout" size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign Out</TooltipContent>
            </Tooltip>
          </div>
        </footer>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header / Top Bar */}
        <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black tracking-tight">{pageTitle}</h1>
            <div className="h-4 w-px bg-border mx-2" />
            <GlobalStatus />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-[11px] font-bold text-stone">
              <Icon name="refresh" size={12} className="animate-spin-slow" />
              <span>Synced 2s ago</span>
            </div>
            <div className="h-4 w-px bg-border mx-1" />
            <ThemeToggle />
            <Button size="sm" className="rounded-full px-4 font-bold shadow-lg shadow-primary/20">
              <Icon name="plus" size={14} className="mr-2" />
              Quick Action
            </Button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// -- Subcomponents ---------------------------------------------------------

import { Button } from "./ui/button";

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="px-4 text-[10px] uppercase tracking-[0.25em] text-stone font-black opacity-40">
        {title}
      </h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-200
        ${isActive 
          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 translate-x-1" 
          : "text-stone hover:bg-secondary hover:text-foreground hover:translate-x-1"
        }
      `}
    >
      <Icon name={icon} size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </NavLink>
  );
}
