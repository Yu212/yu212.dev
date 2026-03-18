"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faXmark } from "@fortawesome/free-solid-svg-icons";
import { TocGroup, TocList, useTocActiveId } from "./toc-list";

type WriteupTocMobileProps = {
  groups: TocGroup[];
};

export default function WriteupTocMobile({ groups }: WriteupTocMobileProps) {
  const activeId = useTocActiveId(groups);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (groups.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-12 h-12 rounded-full bg-[#6292e9] text-white shadow-lg flex items-center justify-center"
        aria-label="Open table of contents"
      >
        <FontAwesomeIcon icon={faList} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">Contents</span>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(70vh - 56px)" }}>
          <TocList groups={groups} activeId={activeId} onLinkClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}
