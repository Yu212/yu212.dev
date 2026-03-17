"use client";

import { useEffect, useMemo, useState } from "react";

type TocItem = {
  id: string;
  title: string;
};

type TocGroup = {
  category: string;
  id: string;
  items: TocItem[];
};

type WriteupTocProps = {
  groups: TocGroup[];
};

export default function WriteupToc({ groups }: WriteupTocProps) {
  const ids = useMemo(() => groups.flatMap((group) => group.items.map((item) => item.id)), [groups]);
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    setActiveId(ids[0] ?? null);
  }, [ids]);

  useEffect(() => {
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    let ticking = false;
    const updateActive = () => {
      ticking = false;
      let currentId = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= 160) {
          currentId = element.id;
        } else {
          break;
        }
      }
      setActiveId(currentId);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActive);
      }
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-600">Contents</div>
      <div className="space-y-4 text-sm">
        {groups.map((group) => (
          <div key={group.id} className="space-y-2">
            <a href={`#${group.id}`} className="block text-xs uppercase tracking-wide text-gray-500 hover:text-[#6292e9]">
              {group.category}
            </a>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={`block border-l-2 pl-3 transition-colors ${isActive ? "border-[#6292e9] text-[#1f4aa8]" : "border-transparent text-gray-600 hover:text-[#6292e9]"}`}>
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
