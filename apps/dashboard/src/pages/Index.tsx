import { Link } from "react-router-dom";
import { Icon } from "@/components/Icon";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 flex items-center justify-between max-w-[1240px] mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Icon name="sparkle" size={16} strokeWidth={1.8} />
          </div>
          <span className="font-serif-display text-[19px]">Space</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="h-9 px-4 rounded-lg text-[13px] text-olive hover:text-foreground hover:bg-secondary flex items-center font-medium transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="h-9 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:bg-dark-warm flex items-center transition-colors">
            Get started
          </Link>
        </nav>
      </header>

      <main className="max-w-[1100px] mx-auto px-8 pt-16 pb-24">
        <div className="text-center max-w-[760px] mx-auto">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-stone font-medium mb-5">
            Discord knowledge bots, made calmer
          </div>
          <h1 className="font-serif-display text-[64px] leading-[1.05] text-foreground tracking-tight mb-6">
            A literary salon for the questions your community keeps asking.
          </h1>
          <p className="text-[18px] text-olive leading-[1.6] mb-9 max-w-[600px] mx-auto">
            Space is a quiet control room for your Discord knowledge bot. Curate the documents,
            review the answers, refine what drifts — and the bot gets a little wiser every day.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/register" className="h-12 px-6 rounded-xl bg-accent text-accent-foreground text-[14.5px] font-medium hover:bg-[hsl(var(--brand-hover))] flex items-center gap-2 transition-colors">
              Open the studio <Icon name="arrowRight" size={15} strokeWidth={2} />
            </Link>
            <Link to="/login" className="h-12 px-6 rounded-xl bg-card border border-border text-foreground text-[14.5px] font-medium hover:bg-secondary flex items-center gap-2 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <section className="grid md:grid-cols-3 gap-5 mt-24">
          {[
            { icon: "book" as const, title: "Knowledge base", body: "Drop in your docs. Edit any passage and the bot's next answer reflects it." },
            { icon: "message" as const, title: "Reviewable chats", body: "Every reply is logged and editable. Corrections train the bot quietly in the background." },
            { icon: "terminal" as const, title: "Live console", body: "Watch the bot think in real time. Stream logs, trigger commands, and see every event as it happens." },
          ].map((f) => (
            <div key={f.title} className="card-elevated p-6">
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border-warm flex items-center justify-center text-olive mb-4">
                <Icon name={f.icon} size={17} strokeWidth={1.7} />
              </div>
              <h3 className="font-serif-display text-[20px] text-foreground mb-1.5">{f.title}</h3>
              <p className="text-[13.5px] text-olive leading-relaxed">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-7 text-center">
        <p className="text-[12.5px] text-stone">A quiet tool for loud servers.</p>
      </footer>
    </div>
  );
}
