import "./App.css";

const GithubIcon = () => (
  <svg viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function App() {
  return (
    <div className="page">

      {/* HERO */}
      <header className="hero">
        <img
          src="./brewnet-site-banner.png"
          alt="Brewnet — Your server on tap. Just brew it."
          className="hero-banner"
        />
        <p className="hero-tagline">Self-hosted home server platform — deploy everything with one command</p>
        <div className="hero-links">
          <a href="https://brewnet.dev" className="hero-domain" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            brewnet.dev
          </a>
          <a href="https://github.com/claude-code-expert" className="hero-github" target="_blank" rel="noopener">
            <GithubIcon />
            claude-code-expert
          </a>
        </div>
      </header>

      {/* PROJECTS */}
      <section className="section">
        <div className="section-label">Open Source Projects</div>
        <h2 className="section-title">Brew your stack <span>from scratch</span></h2>

        <div className="repo-grid">

          {/* brewnet */}
          <article className="repo-card">
            <div className="repo-header">
              <div className="repo-name-group">
                <div className="repo-icon amber">&#9749;</div>
                <span className="repo-name">brewnet</span>
              </div>
              <a href="https://github.com/claude-code-expert/brewnet" className="repo-link" target="_blank" rel="noopener">
                <GithubIcon />
                View on GitHub
              </a>
            </div>
            <p className="repo-desc">
              Self-hosted home server CLI platform.{" "}
              <strong>7-step interactive wizard</strong> handles everything from Docker auto-install to
              Git &middot; DB &middot; File &middot; Media servers, plus external access via Cloudflare Tunnel &mdash; all in one command.
            </p>
            <div className="repo-tags">
              <span className="tag amber">TypeScript</span>
              <span className="tag">Docker Compose</span>
              <span className="tag">Traefik</span>
              <span className="tag">Authelia</span>
              <span className="tag">Cloudflare Tunnel</span>
              <span className="tag">Nextcloud</span>
              <span className="tag">Gitea</span>
              <span className="tag">PostgreSQL</span>
            </div>
          </article>

          {/* brewnet-boilerplate */}
          <article className="repo-card">
            <div className="repo-header">
              <div className="repo-name-group">
                <div className="repo-icon teal">&#9889;</div>
                <span className="repo-name">brewnet-boilerplate</span>
              </div>
              <a href="https://github.com/claude-code-expert/brewnet-boilerplate" className="repo-link" target="_blank" rel="noopener">
                <GithubIcon />
                View on GitHub
              </a>
            </div>
            <p className="repo-desc">
              <strong>6 languages &middot; 16 frameworks</strong> &mdash; production-ready fullstack boilerplate collection.
              Run <code>brewnet create-app</code> and get a Docker-based app running instantly with React 19 frontend.
            </p>
            <div className="repo-tags">
              <span className="tag teal">Go</span>
              <span className="tag teal">Rust</span>
              <span className="tag teal">Java</span>
              <span className="tag teal">Kotlin</span>
              <span className="tag teal">Node.js</span>
              <span className="tag teal">Python</span>
              <span className="tag">React 19</span>
              <span className="tag">Docker</span>
              <span className="tag">PostgreSQL / MySQL / SQLite</span>
            </div>
          </article>

          {/* tika */}
          <article className="repo-card">
            <div className="repo-header">
              <div className="repo-name-group">
                <div className="repo-icon green">&#128203;</div>
                <span className="repo-name">tika</span>
              </div>
              <a href="https://github.com/claude-code-expert/tika" className="repo-link" target="_blank" rel="noopener">
                <GithubIcon />
                View on GitHub
              </a>
            </div>
            <p className="repo-desc">
              Spec-Driven Development (SDD) <strong>Kanban board TODO app</strong>.
              Built with Next.js 15 App Router + Drizzle ORM + Vercel Postgres, featuring @dnd-kit drag &amp; drop.
            </p>
            <div className="repo-tags">
              <span className="tag green">Next.js 15</span>
              <span className="tag green">TypeScript</span>
              <span className="tag">Tailwind CSS</span>
              <span className="tag">Drizzle ORM</span>
              <span className="tag">Vercel Postgres</span>
              <span className="tag">@dnd-kit</span>
            </div>
          </article>

        </div>
      </section>

      {/* LICENSE */}
      <div className="license-bar">
        License:{" "}
        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener">
          MIT License
        </a>
      </div>

      {/* FOOTER */}
      <footer>
        <p className="footer-contact">
          <a href="mailto:brewnet.dev@gmail.com">brewnet.dev@gmail.com</a>
        </p>
        <p className="footer-copy">&copy; 2025 Brewnet &mdash; codevillain</p>
      </footer>

    </div>
  );
}
