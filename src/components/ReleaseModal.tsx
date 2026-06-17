import { useEffect, useRef } from "react";
import type { ReleaseItem } from "../data/schema";
import { CATEGORY_META } from "../data/categories";
import { ReleaseImage } from "./ReleaseImage";
import { ShareButtons } from "./ShareButtons";
import { AskAIButtons } from "./AskAIButtons";
import { track } from "../lib/analytics";
import { normalizeMetrics } from "../lib/metric-labels";

const importanceLabel: Record<ReleaseItem["importance"], string> = {
  rumor: "RUMOR",
  notable: "NOTABLE",
  major: "MAJOR",
  seismic: "SEISMIC",
};

const IMPORTANCE_ORDER: ReleaseItem["importance"][] = [
  "rumor",
  "notable",
  "major",
  "seismic",
];

/** A 4-segment brutalist gauge filled to the item's importance. */
function ImportanceMeter({ level }: { level: ReleaseItem["importance"] }) {
  const idx = IMPORTANCE_ORDER.indexOf(level);
  return (
    <span
      className="imp-meter"
      role="img"
      aria-label={`Importance: ${importanceLabel[level]}`}
    >
      {IMPORTANCE_ORDER.map((l, i) => (
        <span
          key={l}
          aria-hidden="true"
          className={`imp-seg${i <= idx ? ` imp-seg-on imp-${level}` : ""}`}
        />
      ))}
    </span>
  );
}

/** Visible hostname (drops www.) — used for the source credibility chips. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ReleaseModal({
  item,
  onClose,
}: {
  item: ReleaseItem;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    // Body-scroll lock that actually holds on iOS Safari (overflow:hidden
    // alone does not): pin the body and restore the scroll position on close.
    const body = document.body;
    const prevStyle = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    // Focus the dialog so keyboard users land inside it.
    modalRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap: Tab/Shift+Tab cycles within the modal, never escaping
      // into the feed behind it. aria-modal alone does NOT trap focus.
      if (e.key === "Tab" && modalRef.current) {
        const f = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === modalRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = prevStyle.position;
      body.style.top = prevStyle.top;
      body.style.width = prevStyle.width;
      window.scrollTo(0, scrollY);
      prevFocus?.focus?.();
    };
  }, [onClose]);

  const ex = item.explainer;
  const specs = normalizeMetrics(item.metrics);
  const links =
    item.links && item.links.length > 0
      ? item.links
      : [{ label: "Source", url: item.url }];
  const outlets = new Set(links.map((l) => hostOf(l.url))).size;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className={`modal imp-band-${item.importance}`} ref={modalRef} tabIndex={-1}>
        {/* Sticky band — importance + category + date + Close. Holds the
            close button so it can never scroll away or overlap content. */}
        <div className="modal-band">
          <div className="modal-band-left">
            <ImportanceMeter level={item.importance} />
            <span className="modal-band-imp">{importanceLabel[item.importance]}</span>
            {item.categories.map((c) => (
              <span className="modal-band-cat" key={c}>
                {CATEGORY_META[c].label}
              </span>
            ))}
          </div>
          <div className="modal-band-right">
            <span className="modal-date">{item.date}</span>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕ ESC
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Left: image + sources + share/ask — scrolls independently */}
          <aside className="modal-left">
            <div className="modal-imgwrap">
              <ReleaseImage item={item} className="modal-img" />
              {item.image?.credit && (
                <p className="modal-img-credit">{item.image.credit}</p>
              )}
            </div>

            <section className="modal-sources">
              <h3 className="panel-h modal-sources-h">
                // SOURCES{outlets >= 2 ? ` · ${outlets} OUTLETS` : ""} ↓
              </h3>
              <ul className="sources-list">
                {links.map((l, i) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="source-link"
                      onClick={() =>
                        track("release:url-click", {
                          id: item.id,
                          category: item.categories[0],
                          source: "modal",
                        })
                      }
                    >
                      <span className="source-num">[{i + 1}]</span>
                      <span className="source-body">
                        <span className="source-label">{l.label}</span>
                        <span className="source-host">{hostOf(l.url)}</span>
                      </span>
                      <span className="source-arrow">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <ShareButtons item={item} source="modal" />
            <AskAIButtons item={item} source="modal" />
          </aside>

          {/* Right: content — scrolls independently */}
          <div className="modal-right">
            <header className="modal-head">
              <h2 className="modal-title">{item.title}</h2>
              {item.author ? (
                <p className="modal-org">
                  {item.author.profileUrl ? (
                    <a
                      href={item.author.profileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="modal-author-link"
                    >
                      {item.author.name}
                      {item.author.handle && (
                        <span className="modal-author-handle"> {item.author.handle}</span>
                      )}
                      <span className="modal-author-arrow"> ↗</span>
                    </a>
                  ) : (
                    <>
                      {item.author.name}
                      {item.author.handle && (
                        <span className="modal-author-handle"> {item.author.handle}</span>
                      )}
                    </>
                  )}
                </p>
              ) : (
                <p className="modal-org">{item.org}</p>
              )}
              <p className="modal-tagline">{ex.tagline}</p>
            </header>

            {/* Spec bar — promotes the otherwise-hidden metrics up top */}
            {specs.length > 0 && (
              <section className="modal-specbar" aria-label="Key specs">
                {specs.map((s) => (
                  <div
                    className={`spec-cell${s.accent ? " spec-cell-acc" : ""}`}
                    key={s.key}
                  >
                    <span className="spec-label">{s.label}</span>
                    <span className="spec-value">{s.value}</span>
                  </div>
                ))}
              </section>
            )}

            {item.quickFacts && item.quickFacts.length > 0 && (
              <section className="panel modal-qf-panel">
                <h3 className="panel-h">// QUICK FACTS</h3>
                <table className="modal-qf">
                  <tbody>
                    {item.quickFacts.map((f) => (
                      <tr key={f.label}>
                        <th scope="row">{f.label}</th>
                        <td>{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <div className="modal-grid">
              <section className="panel">
                <h3 className="panel-h">// WHAT IS IT</h3>
                <p>{ex.whatIsIt}</p>
              </section>
              <section className="panel">
                <h3 className="panel-h">// HOW IT WORKS</h3>
                <p>{ex.howItWorks}</p>
              </section>
              <section className="panel">
                <h3 className="panel-h">// WHY IT MATTERS</h3>
                <p>{ex.whyItMatters}</p>
              </section>
              {(ex.forWho || ex.tryIt) && (
                <section className="panel">
                  <h3 className="panel-h">// WHO + HOW TO TRY</h3>
                  {ex.forWho && (
                    <p>
                      <strong>For:</strong> {ex.forWho}
                    </p>
                  )}
                  {ex.tryIt && (
                    <p style={{ marginTop: 4 }}>
                      <strong>Try:</strong>{" "}
                      <code className="try-code">{ex.tryIt}</code>
                    </p>
                  )}
                </section>
              )}
            </div>

            {item.faq && item.faq.length > 0 && (
              <section className="panel modal-faq-panel">
                <h3 className="panel-h">// FAQ</h3>
                <dl className="modal-faq">
                  {item.faq.map((f) => (
                    <div className="modal-faq-item" key={f.q}>
                      <dt>{f.q}</dt>
                      <dd>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {item.tags && item.tags.length > 0 && (
              <footer className="modal-foot">
                <div className="modal-tags">
                  {item.tags.slice(0, 10).map((t) => (
                    <span className="tag" key={t}>
                      #{t}
                    </span>
                  ))}
                </div>
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
