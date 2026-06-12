/**
 * Per-category visual identity for the Learn section: a distinct
 * hand-drawn line icon + an accent color for each of the 14 categories.
 *
 * Icons are inline SVG (stroke = currentColor, sharp square caps to match
 * the brutalist system) so they inherit the accent via `color` and are
 * fully SSR-safe (rendered by prerender-learn too). Accents are a tight
 * neon family on near-black — one identity color per category, reused
 * across the hub card, the category hero, and its subcategory modules.
 */

import type { ReactNode } from "react";

type IconFn = () => ReactNode;

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// --- the 14 icons -------------------------------------------------------

const NeuralNodes: IconFn = () => (
  <Svg>
    <line x1="8" y1="10" x2="16" y2="19" />
    <line x1="24" y1="8" x2="16" y2="19" />
    <line x1="16" y1="19" x2="25" y2="24" />
    <line x1="16" y1="19" x2="7" y2="23" />
    <line x1="8" y1="10" x2="24" y2="8" />
    <circle cx="8" cy="10" r="2.3" />
    <circle cx="24" cy="8" r="2.3" />
    <circle cx="16" cy="19" r="2.6" />
    <circle cx="25" cy="24" r="2.3" />
    <circle cx="7" cy="23" r="2.3" />
  </Svg>
);

const Terminal: IconFn = () => (
  <Svg>
    <rect x="5" y="6" width="22" height="20" />
    <polyline points="10,13 14,16 10,19" />
    <line x1="16" y1="20" x2="22" y2="20" />
  </Svg>
);

const Brackets: IconFn = () => (
  <Svg>
    <polyline points="13,7 8,7 8,25 13,25" />
    <polyline points="19,7 24,7 24,25 19,25" />
    <circle cx="16" cy="16" r="1.6" />
  </Svg>
);

const VectorSpace: IconFn = () => (
  <Svg>
    <line x1="6" y1="26" x2="6" y2="7" />
    <line x1="6" y1="26" x2="27" y2="26" />
    <line x1="6" y1="26" x2="19" y2="13" />
    <polyline points="15,13 19,13 19,17" />
    <circle cx="13" cy="19" r="1.4" />
    <circle cx="22" cy="20" r="1.4" />
    <circle cx="16" cy="22" r="1.4" />
  </Svg>
);

const Retrieval: IconFn = () => (
  <Svg>
    <line x1="9" y1="10" x2="21" y2="10" />
    <line x1="9" y1="14" x2="18" y2="14" />
    <line x1="9" y1="18" x2="14" y2="18" />
    <circle cx="20" cy="19" r="5" />
    <line x1="23.6" y1="22.6" x2="27" y2="26" />
  </Svg>
);

const Loop: IconFn = () => (
  <Svg>
    <path d="M24 12 A8 8 0 1 0 25 19" />
    <polyline points="20,11 24,12 23,16" />
    <circle cx="16" cy="16" r="2.2" />
  </Svg>
);

const Layers: IconFn = () => (
  <Svg>
    <rect x="6" y="18" width="14" height="7" />
    <rect x="9" y="12" width="14" height="7" />
    <rect x="12" y="6" width="14" height="7" />
  </Svg>
);

const Code: IconFn = () => (
  <Svg>
    <polyline points="12,11 7,16 12,21" />
    <polyline points="20,11 25,16 20,21" />
    <line x1="18" y1="9" x2="14" y2="23" />
  </Svg>
);

const Sliders: IconFn = () => (
  <Svg>
    <line x1="6" y1="10" x2="26" y2="10" />
    <line x1="6" y1="16" x2="26" y2="16" />
    <line x1="6" y1="22" x2="26" y2="22" />
    <rect x="18" y="7.5" width="5" height="5" />
    <rect x="9" y="13.5" width="5" height="5" />
    <rect x="20" y="19.5" width="5" height="5" />
  </Svg>
);

const Server: IconFn = () => (
  <Svg>
    <rect x="7" y="7" width="18" height="18" />
    <line x1="7" y1="13" x2="25" y2="13" />
    <line x1="7" y1="19" x2="25" y2="19" />
    <circle cx="10.5" cy="10" r="0.9" />
    <circle cx="10.5" cy="16" r="0.9" />
    <circle cx="10.5" cy="22" r="0.9" />
  </Svg>
);

const Multimodal: IconFn = () => (
  <Svg>
    <rect x="6" y="6" width="14" height="12" />
    <circle cx="10" cy="10" r="1.5" />
    <polyline points="7,17 11,13 14,15 19,10" />
    <line x1="7" y1="24" x2="7" y2="27" />
    <line x1="11" y1="22" x2="11" y2="27" />
    <line x1="15" y1="24" x2="15" y2="27" />
    <line x1="19" y1="21" x2="19" y2="27" />
    <line x1="23" y1="23" x2="23" y2="27" />
  </Svg>
);

const Gauge: IconFn = () => (
  <Svg>
    <path d="M6 23 A10 10 0 0 1 26 23" />
    <line x1="16" y1="23" x2="22" y2="15" />
    <circle cx="16" cy="23" r="1.6" />
    <line x1="6" y1="23" x2="8" y2="23" />
    <line x1="24" y1="23" x2="26" y2="23" />
  </Svg>
);

const Shield: IconFn = () => (
  <Svg>
    <polyline points="16,5 26,9 26,17 16,28 6,17 6,9 16,5" />
    <polyline points="11,16 15,20 22,12" />
  </Svg>
);

const Blocks: IconFn = () => (
  <Svg>
    <rect x="5" y="6" width="15" height="15" />
    <line x1="5" y1="11" x2="20" y2="11" />
    <circle cx="8" cy="8.5" r="0.8" />
    <circle cx="11" cy="8.5" r="0.8" />
    <rect x="17" y="17" width="10" height="10" />
  </Svg>
);

// --- registry -----------------------------------------------------------

interface CategoryVisual {
  accent: string;
  Icon: IconFn;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  "llm-fundamentals": { accent: "#f7ff00", Icon: NeuralNodes },
  "prompt-engineering": { accent: "#00f0a8", Icon: Terminal },
  "llm-apis": { accent: "#5b9dff", Icon: Brackets },
  "embeddings-vector-databases": { accent: "#b98cff", Icon: VectorSpace },
  rag: { accent: "#ff8a3d", Icon: Retrieval },
  "ai-agents": { accent: "#ff3b6b", Icon: Loop },
  "agent-frameworks": { accent: "#36e0ff", Icon: Layers },
  "ai-coding-tools": { accent: "#a6ff4d", Icon: Code },
  "fine-tuning": { accent: "#ff5cc8", Icon: Sliders },
  "local-open-models": { accent: "#ffc234", Icon: Server },
  "multimodal-ai": { accent: "#2bffcf", Icon: Multimodal },
  "production-llmops": { accent: "#8aa0ff", Icon: Gauge },
  "evaluation-safety": { accent: "#ff6f5e", Icon: Shield },
  "building-ai-apps": { accent: "#d6ff5c", Icon: Blocks },
};

const FALLBACK: CategoryVisual = { accent: "#f7ff00", Icon: NeuralNodes };

export function categoryVisual(slug: string): CategoryVisual {
  return CATEGORY_VISUALS[slug] ?? FALLBACK;
}
