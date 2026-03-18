"use client";

import { TocGroup, TocList, useTocActiveId } from "./toc-list";

type WriteupTocProps = {
  groups: TocGroup[];
};

export default function WriteupToc({ groups }: WriteupTocProps) {
  const activeId = useTocActiveId(groups);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-600">Contents</div>
      <TocList groups={groups} activeId={activeId} />
    </div>
  );
}
