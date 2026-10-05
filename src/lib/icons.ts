/**
 * Icon names plus the slug -> icon lookups, kept free of React so that server
 * code (API routes, metadata) can share them with the UI. See
 * docs/DESIGN-LOCK.md §7 — do not add emoji as icons.
 */

export type IconName =
  | "math"
  | "dna"
  | "flask"
  | "book"
  | "briefcase"
  | "palette"
  | "cap"
  | "gift"
  | "wifiOff"
  | "landmark"
  | "sparkles"
  | "target"
  | "trend"
  | "arrowRight"
  | "check"
  | "file"
  | "plus"
  | "close"
  | "search"
  | "play"
  | "pin"
  | "chevronRight"
  | "chevronLeft"
  | "menu"
  | "message"
  | "paperclip"
  | "calendar"
  | "download"
  | "layers"
  | "inbox"
  | "refresh"
  | "alert"
  | "language"
  | "pen"
  | "clipboard"
  | "star"
  | "thumbsUp"
  | "thumbsDown";

const BRANCH_ICONS: Record<string, IconName> = {
  sm: "math",
  svt: "dna",
  sp: "flask",
  lettres: "book",
  eco: "briefcase",
  arts: "palette",
  tech: "sparkles",
};

/** Maps a branch slug to its icon. Falls back to a graduation cap. */
export function branchIcon(slug: string): IconName {
  return BRANCH_ICONS[slug] ?? "cap";
}

const SUBJECT_ICONS: Record<string, IconName> = {
  maths: "math",
  math: "math",
  sm: "math",
  svt: "dna",
  vie: "dna",
  pc: "flask",
  sp: "flask",
  physique: "flask",
  lettres: "book",
  hg: "landmark",
  histoire: "landmark",
  geo: "landmark",
  philo: "landmark",
  eco: "briefcase",
  gestion: "briefcase",
  commerce: "briefcase",
  economie: "briefcase",
  arts: "palette",
  anglais: "message",
  tech: "sparkles",
};

/** Maps a subject slug to its icon. Falls back to a document. */
export function subjectIcon(slug: string): IconName {
  return SUBJECT_ICONS[slug] ?? "file";
}
