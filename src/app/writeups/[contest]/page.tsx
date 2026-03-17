import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWriteupPageData, getWriteupSlugs, type Problem } from "@/lib/writeups";
import WriteupHeader from "@/components/writeup/writeup-header";
import WriteupToc from "@/components/writeup/writeup-toc";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import WriteupContent from "@/components/writeup/writeup-content";

function formatCategoryId(categories: string[]) {
  return `category-${categories.join("-")}`;
}

type ProblemGroup = {
  category: string;
  id: string;
  items: Problem[];
};

function groupProblemsByCategory(problems: Problem[]): ProblemGroup[] {
  const grouped = new Map<string, ProblemGroup>();
  for (const problem of problems) {
    const category = problem.categories.join(" & ");
    const existing = grouped.get(category);
    if (existing) {
      existing.items.push(problem);
    } else {
      grouped.set(category, {
        category,
        id: formatCategoryId(problem.categories),
        items: [problem],
      });
    }
  }
  return Array.from(grouped.values());
}

export async function generateStaticParams() {
  const slugs = await getWriteupSlugs();
  return slugs.map((contest) => ({ contest }));
}

export async function generateMetadata({ params }: { params: { contest: string } }): Promise<Metadata> {
  const writeup = await getWriteupPageData(params.contest);
  if (!writeup) {
    return {};
  }

  const title = writeup.kind === "contest"
      ? `${writeup.data.meta.title} | Writeups`
      : `${writeup.data.title} | Writeups`;
  const description = writeup.kind === "contest"
      ? `CTF writeup: ${writeup.data.meta.title}`
      : `Writeup: ${writeup.data.title}`;

  return {
    title,
    description,
    keywords: writeup.kind === "contest" ? writeup.data.meta.tags : undefined,
  };
}

export default async function WriteupPage({ params }: { params: { contest: string } }) {
  const writeup = await getWriteupPageData(params.contest);
  if (!writeup) {
    notFound();
  }

  if (writeup.kind === "misc") {
    return (
      <div className="text-black bg-gray-100 min-h-screen flex flex-col items-center">
        <WriteupHeader />
        <main className="flex-grow w-full">
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
            <header className="space-y-2">
              <Link href="/writeups" className="text-sm text-[#6292e9] hover:text-[#1f4aa8]">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                All writeups
              </Link>
              <h2 className="text-2xl md:text-3xl font-semibold">{writeup.data.title}</h2>
              {writeup.data.date && <div className="text-sm text-gray-600">{writeup.data.date}</div>}
            </header>
            <WriteupContent html={writeup.data.bodyHtml} />
          </div>
        </main>
      </div>
    );
  }

  const { meta, overviewHtml, problems } = writeup.data;
  const groupedProblems = groupProblemsByCategory(problems);
  const tocGroups = groupedProblems.map((group) => ({
    category: group.category,
    id: group.id,
    items: group.items.map((problem) => ({
      id: problem.anchor,
      title: problem.title,
    })),
  }));

  return (
    <div className="text-black bg-gray-100 min-h-screen flex flex-col items-center">
      <WriteupHeader />
      <main className="flex-grow w-full">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-10 min-w-0">
              <header className="space-y-2">
                <Link href="/writeups" className="text-sm text-[#6292e9] hover:text-[#1f4aa8]">
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  All writeups
                </Link>
                <h2 className="text-2xl md:text-3xl font-semibold">{meta.title}</h2>
                <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                  {meta.date && <span>{meta.date}</span>}
                  {meta.team && <span>Team: {meta.team}</span>}
                  {typeof meta.rank !== "undefined" && <span>Rank: {meta.rank}</span>}
                </div>
                {meta.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="writeup-tag text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {overviewHtml && <WriteupContent html={overviewHtml} />}

              <div className="space-y-12">
                {groupedProblems.map((group) => (
                  <section key={group.category} className="space-y-6">
                    <h3 id={group.id} className="text-xl font-semibold uppercase tracking-wide text-slate-600">
                      {group.category}
                    </h3>
                    <div className="space-y-12">
                      {group.items.map((problem) => (
                        <section key={problem.anchor} id={problem.anchor} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="text-xs uppercase tracking-wide text-gray-500">{problem.categories.join(" & ")}</div>
                          <h2 className="text-2xl font-semibold mt-1">
                            {problem.title}{problem.solves !== undefined && <span className="text-gray-500 font-normal"> ({problem.solves} {problem.solves === 1 ? "solve" : "solves"})</span>}
                          </h2>
                          <WriteupContent html={problem.bodyHtml} className="mt-4" />
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {problems.length > 0 && (
              <aside className="hidden lg:block">
                <WriteupToc groups={tocGroups} />
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
