import { Newsletter } from "@/components/Newsletter";

interface FooterColumn {
  heading: string;
  links: string[];
}

const columns: FooterColumn[] = [
  {
    heading: "Product",
    links: ["Live pipelines", "Anomaly engine", "Alerting", "Changelog"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Security", "Status"],
  },
  {
    heading: "Resources",
    links: ["Docs", "API reference", "Community", "Support"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-mono text-lg font-semibold tracking-tight text-text-primary">
              nexus
            </span>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              The analytics layer that reads every event once and tells you the one thing that
              changed.
            </p>
            <div className="mt-6 max-w-sm">
              <Newsletter />
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h4 className="text-sm font-semibold text-text-primary">{column.heading}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-muted hover:text-text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Nexus Analytics, Inc.</span>
          <span>Built for teams who ship before the anomaly does.</span>
        </div>
      </div>
    </footer>
  );
}
