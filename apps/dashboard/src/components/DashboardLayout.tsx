import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useAuth } from "@/lib/auth";

const nav: { to: string; icon: IconName; label: string }[] = [
  { to: "/app/knowledge", icon: "book",     label: "Knowledge Base" },
  { to: "/app/chats",     icon: "message",  label: "Chats" },
  { to: "/app/members",   icon: "users",    label: "Members" },
  { to: "/app/modlogs",   icon: "shield",   label: "Mod Logs" },
  { to: "/app/console",   icon: "terminal", label: "Console" },
];

const bottomNav: { to: string; icon: IconName; label: string }[] = [
  { to: "/app/profile",   icon: "user",     label: "Profile" },
  { to: "/app/settings",  icon: "settings", label: "Settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.slice(0, 1).toUpperCase();
  const email = user?.email || "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-[232px] shrink-0 bg-card border-r border-border flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Icon name="sparkle" size={15} strokeWidth={1.8} />
            </div>
            <div>
              <div className="font-serif-display text-[17px] leading-none text-foreground">Space</div>
              <div className="text-[10.5px] text-stone mt-0.5 tracking-wide uppercase">Discord control</div>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="px-3 pt-4">
          <div className="text-[10.5px] uppercase tracking-wider text-stone px-2 mb-2 font-medium">Workspace</div>
          <div className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/50 border border-border text-left">
            <div className="w-7 h-7 rounded-md bg-secondary border border-border-warm flex items-center justify-center text-[11px] font-mono text-olive">SP</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-foreground truncate">space.dev</div>
              <div className="text-[10.5px] text-stone truncate">Connected</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 pt-5 flex-1 flex flex-col">
          <div className="text-[10.5px] uppercase tracking-wider text-stone px-2 mb-2 font-medium">Manage</div>
          <div className="flex flex-col gap-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-olive hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <Icon name={item.icon} size={15} strokeWidth={1.7} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto">
            <div className="text-[10.5px] uppercase tracking-wider text-stone px-2 mb-2 font-medium">Account</div>
            <div className="flex flex-col gap-0.5">
              {bottomNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-olive hover:bg-secondary hover:text-foreground"
                    }`
                  }
                >
                  <Icon name={item.icon} size={15} strokeWidth={1.7} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-olive hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Icon name="logout" size={15} strokeWidth={1.7} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Footer user */}
        <div className="m-3 p-2.5 rounded-xl border border-border bg-background flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif-display text-[13px]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium text-foreground truncate">{displayName}</div>
            <div className="text-[10.5px] text-stone truncate">{email}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
