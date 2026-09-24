"use client";

import { useRef } from "react";

type Props = {
  lang: "ar" | "fr";
  onPick: (f: File) => void;
  disabled?: boolean;
  remaining?: number;
};

export function AttachButton({ lang, onPick, disabled, remaining }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        aria-label={lang === "ar" ? "إرفاق صورة أو ملف" : "Joindre une image ou un fichier"}
        title={
          lang === "ar"
            ? `ارفع صورة سؤال أو ملف PDF (باقي ${remaining ?? 3}/${3})`
            : `Joindre une photo de sujet ou un PDF (reste ${remaining ?? 3}/${3})`
        }
        className="relative grid place-items-center w-11 h-11 rounded-xl border border-[var(--p)] bg-[var(--of)] text-[var(--l)] text-lg transition-all hover:text-[var(--acc)] hover:border-[var(--acc)] hover:bg-[#eef2ff] active:scale-90 disabled:opacity-40"
      >
        📎
        {typeof remaining === "number" && (
          <span
            className={`absolute -bottom-1 -end-1 min-w-[18px] h-[18px] grid place-items-center rounded-full text-[10px] font-bold text-white px-1 ${
              remaining <= 0 ? "bg-rose-500" : "bg-indigo-600"
            }`}
          >
            {remaining}
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        hidden
        accept="image/*,application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </>
  );
}