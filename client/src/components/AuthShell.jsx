export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-ink text-paper p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, #faf9f5 0%, transparent 40%), radial-gradient(circle at 70% 80%, #c8553d 0%, transparent 50%)'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-paper text-ink grid place-items-center font-display text-xl font-semibold">
              T
            </div>
            <div className="font-display text-xl font-semibold">Tessera</div>
          </div>
        </div>
        <div className="relative space-y-6">
          <div className="font-display text-3xl leading-tight max-w-md">
            A quiet, focused way for small teams to ship work — together.
          </div>
          <div className="flex gap-1">
            <div className="w-12 h-0.5 bg-paper" />
            <div className="w-3 h-0.5 bg-paper/30" />
            <div className="w-3 h-0.5 bg-paper/30" />
          </div>
          <div className="text-sm text-paper/60 max-w-md leading-relaxed">
            Projects, members, tasks, status — kept simple. Role-based access keeps the right
            people on the right work.
          </div>
        </div>
        <div className="relative flex items-center justify-between">
          <span className="text-xs text-paper/40 uppercase tracking-widest">
            Tessera · Team Task Manager
          </span>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ExplorerAditya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/40 hover:text-paper/80 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a
              href="https://www.linkedin.com/in/aditya-singh-explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/40 hover:text-paper/80 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="display text-3xl font-semibold mb-2">{title}</h1>
            {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
