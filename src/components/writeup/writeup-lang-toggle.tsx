"use client";

import { useEffect, useState } from "react";

type WriteupLangToggleProps = {
  defaultLang: string;
};

export default function WriteupLangToggle({ defaultLang }: WriteupLangToggleProps) {
  const [activeLang, setActiveLang] = useState<string | null>(null);

  useEffect(() => {
    setActiveLang(document.documentElement.getAttribute("data-lang") ?? defaultLang);
  }, [defaultLang]);

  function switchLang(lang: string) {
    document.documentElement.setAttribute("data-lang", lang);
    try {
      localStorage.setItem("writeup-lang", lang);
    } catch {
      // ignore
    }
    setActiveLang(lang);
  }

  return (
    <div className="flex gap-1 rounded border border-gray-200 overflow-hidden text-sm font-medium">
      {(["ja", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLang(lang)}
          className={`px-3 py-1.5 uppercase transition-colors ${activeLang === lang ? "bg-[#6292e9] text-white" : "text-gray-500 hover:text-gray-800"}`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
