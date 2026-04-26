import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useAuth } from "@/lib/auth";
import { useMemo } from "react";

interface NavItem {
  to: string;
  icon: IconName;
  label: string;
}

const MAIN_NAV: NavItem[] = [
  { to: "/app/knowledge", icon: "book",     label: "Knowledge Base" },
  { to: "/app/chats",     icon: "message",  label: "Conversations" },
  { to: "/app/members",   icon: "users",    label: "Members Registry" },
  { to: "/app/modlogs",   icon: "shield",   label: "Audit Logs" },
  { to: "/app/console",   icon: "terminal", label: "Bot Health" },
];

const ACCOUNT_NAV: NavItem[] = [
  { to: "/app/profile",   icon: "user",     label: "Profile" },
  { to: "/app/settings",  icon: "settings", label: "Settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const userMeta = useMemo(() => {
    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator";
    return {
      name,
      email: user?.email || "",
      initials: name.slice(0, 1).toUpperCase()
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[260px] shrink-0 bg-card border-r border-border flex flex-col shadow-sm">
        {/* Brand Identity */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <Icon name="sparkle" size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-serif-display text-[20px] leading-tight text-foreground">Space</div>
              <div className="text-[10px] text-stone uppercase tracking-widest font-bold mt-0.5">Management Studio</div>
            </div>
          </div>
        </div>

        {/* Instance Selector / Status */}
        <div className="px-4 mb-8">
          <div className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 hover:border-accent/30 transition-all cursor-default">
            <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-[11px] font-bold text-accent shadow-sm">
              SP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">space.io</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-stone font-bold uppercase tracking-wider">Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pb-6">
          <NavGroup title="Intelligence">
            {MAIN_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </NavGroup>

          <NavGroup title="Account">
            {ACCOUNT_NAV.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13.5px] font-bold text-stone hover:bg-destructive/5 hover:text-destructive transition-all"
            >
              <Icon name="logout" size={16} strokeWidth={2.5} />
              <span>Sign Out</span>
            </button>
          </NavGroup>
        </nav>

        {/* User Context Footer */}
        <footer className="p-4 mt-auto border-t border-border bg-secondary/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-serif-display text-[15px] font-bold shadow-md">
              {userMeta.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">{userMeta.name}</div>
              <div className="text-[10.5px] text-stone font-medium truncate">{userMeta.email}</div>
            </div>
          </div>
        </footer>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative bg-background/50">
        <div className="absolute inset-0 overflow-y-auto scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// -- Subcomponents ---------------------------------------------------------

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="px-4 text-[10px] uppercase tracking-[0.2em] text-stone font-black mb-3">
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
        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-200
        ${isActive 
          ? "bg-foreground text-background shadow-lg translate-x-1" 
          : "text-stone hover:bg-secondary hover:text-foreground hover:translate-x-1"
        }
      `}
    >
      <Icon name={icon} size={16} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </NavLink>
  );
}
