/**
 * Tiny dependency-free syntax highlighter for Learn code blocks.
 *
 * Deliberately minimal: comments, strings, numbers, keywords — in the
 * site's 3-color brutalist palette (see learn.css: .hl-c/.hl-s/.hl-n/.hl-k).
 * It tokenizes, it does not parse; that's enough for decorative
 * highlighting and can never crash on weird input (worst case: plain text).
 *
 * SSR-safe, shared by the SPA and the prerender script.
 */

export interface HlToken {
  t: string;
  /** css class: hl-c (comment) | hl-s (string) | hl-n (number) | hl-k (keyword) */
  c?: string;
}

interface LangCfg {
  /** Regex sources tried in order: comment, string. */
  comment?: string;
  string?: string;
  keywords?: string[];
}

const PY_KEYWORDS = [
  "def", "return", "import", "from", "class", "if", "elif", "else", "for",
  "while", "in", "not", "and", "or", "is", "None", "True", "False", "with",
  "as", "try", "except", "finally", "lambda", "yield", "async", "await",
  "raise", "pass", "global", "nonlocal", "assert", "del", "print", "self",
];

const JS_KEYWORDS = [
  "const", "let", "var", "function", "return", "import", "from", "export",
  "default", "class", "if", "else", "for", "while", "do", "new", "typeof",
  "instanceof", "interface", "type", "enum", "extends", "implements",
  "async", "await", "try", "catch", "finally", "throw", "this", "null",
  "undefined", "true", "false", "void", "switch", "case", "break",
  "continue", "of", "in", "as", "satisfies", "readonly", "string",
  "number", "boolean", "any", "unknown", "never",
];

const BASH_KEYWORDS = [
  "if", "then", "else", "elif", "fi", "for", "do", "done", "while", "case",
  "esac", "function", "echo", "export", "cd", "source", "set", "local",
  "return", "exit", "sudo", "curl", "wget", "git", "docker", "pip", "pip3",
  "python", "python3", "node", "npm", "npx", "bun", "uv", "ollama", "brew",
];

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "TABLE", "INDEX", "DROP", "ALTER", "JOIN", "LEFT",
  "RIGHT", "INNER", "OUTER", "ON", "AS", "ORDER", "BY", "GROUP", "HAVING",
  "LIMIT", "OFFSET", "AND", "OR", "NOT", "NULL", "IS", "IN", "EXISTS",
  "DISTINCT", "COUNT", "USING", "EXTENSION", "vector",
];

const STR_COMMON =
  String.raw`'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"`;
// Backtick template-literal strings (can't live inside a template literal).
const STR_BACKTICK = "`(?:[^`\\\\]|\\\\.)*`";

const LANGS: Record<string, LangCfg> = {
  python: {
    comment: String.raw`#[^\n]*`,
    string: String.raw`(?:[rbfu]{0,2})(?:"""[\s\S]*?"""|'''[\s\S]*?'''|${STR_COMMON})`,
    keywords: PY_KEYWORDS,
  },
  typescript: {
    comment: String.raw`//[^\n]*|/\*[\s\S]*?\*/`,
    string: `${STR_BACKTICK}|${STR_COMMON}`,
    keywords: JS_KEYWORDS,
  },
  javascript: {
    comment: String.raw`//[^\n]*|/\*[\s\S]*?\*/`,
    string: `${STR_BACKTICK}|${STR_COMMON}`,
    keywords: JS_KEYWORDS,
  },
  bash: {
    comment: String.raw`#[^\n]*`,
    string: STR_COMMON,
    keywords: BASH_KEYWORDS,
  },
  json: {
    string: String.raw`"(?:[^"\\\n]|\\.)*"`,
    keywords: ["true", "false", "null"],
  },
  yaml: {
    comment: String.raw`#[^\n]*`,
    string: STR_COMMON,
    keywords: ["true", "false", "null"],
  },
  sql: {
    comment: String.raw`--[^\n]*`,
    string: String.raw`'(?:[^'\n]|'')*'`,
    keywords: SQL_KEYWORDS,
  },
};

const NUMBER = String.raw`\b\d[\d_]*(?:\.\d+)?\b`;

const cache = new Map<string, RegExp>();

function langRegex(lang: string): RegExp | null {
  const cfg = LANGS[lang];
  if (!cfg) return null;
  let re = cache.get(lang);
  if (!re) {
    const parts = [
      cfg.comment ? `(${cfg.comment})` : "(\\b\\B)", // never-matching filler
      cfg.string ? `(${cfg.string})` : "(\\b\\B)",
      `(${NUMBER})`,
      cfg.keywords?.length
        ? `(\\b(?:${cfg.keywords.join("|")})\\b)`
        : "(\\b\\B)",
    ];
    re = new RegExp(parts.join("|"), lang === "sql" ? "gi" : "g");
    cache.set(lang, re);
  }
  re.lastIndex = 0;
  return re;
}

const GROUP_CLASS = ["hl-c", "hl-s", "hl-n", "hl-k"];

/** Tokenize source code into (text, class) runs for rendering. */
export function highlight(code: string, lang: string): HlToken[] {
  const re = langRegex(lang);
  if (!re) return [{ t: code }];
  const out: HlToken[] = [];
  let last = 0;
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (m.index > last) out.push({ t: code.slice(last, m.index) });
    let cls: string | undefined;
    for (let g = 1; g <= 4; g++) {
      if (m[g] !== undefined) {
        cls = GROUP_CLASS[g - 1];
        break;
      }
    }
    out.push({ t: m[0], c: cls });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++; // safety against zero-width loops
  }
  if (last < code.length) out.push({ t: code.slice(last) });
  return out;
}
