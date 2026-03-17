import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWriteupPageData, getWriteupSlugs, type Challenge } from "@/lib/writeups";
import WriteupHeader from "@/components/writeup/writeup-header";
import WriteupToc from "@/components/writeup/writeup-toc";
import WriteupLangToggle from "@/components/writeup/writeup-lang-toggle";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import WriteupContent from "@/components/writeup/writeup-content";

type ChallengeGroup = {
  category: string;
  id: string;
  items: Challenge[];
};

function groupChallengesByCategory(challenges: Challenge[], idPrefix = ""): ChallengeGroup[] {
  const grouped = new Map<string, ChallengeGroup>();
  for (const challenge of challenges) {
    const category = challenge.categories.join(" & ");
    const existing = grouped.get(category);
    if (existing) {
      existing.items.push(challenge);
    } else {
      grouped.set(category, {
        category,
        id: `${idPrefix}category-${challenge.categories.join("-")}`,
        items: [challenge],
      });
    }
  }
  return Array.from(grouped.values());
}

function toTocGroups(groups: ChallengeGroup[]) {
  return groups.map((group) => ({
    category: group.category,
    id: group.id,
    items: group.items.map((challenge) => ({
      id: challenge.anchor,
      title: challenge.title,
    })),
  }));
}

function ChallengeList({ groups }: { groups: ChallengeGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.id} className="space-y-6">
          <h3 id={group.id} className="text-xl font-semibold uppercase tracking-wide text-slate-600">
            {group.category}
          </h3>
          <div className="space-y-12">
            {group.items.map((challenge) => (
              <section key={challenge.anchor} id={challenge.anchor} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-xs uppercase tracking-wide text-gray-500">{challenge.categories.join(" & ")}</div>
                <h2 className="text-2xl font-semibold mt-1">
                  {challenge.title}{challenge.solves !== undefined && (
                    <span className="text-gray-500 font-normal"> ({challenge.solves} {challenge.solves === 1 ? "solve" : "solves"})</span>
                  )}
                </h2>
                <WriteupContent html={challenge.bodyHtml} className="mt-4" />
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await getWriteupSlugs();
  return slugs.map((contest) => ({ contest }));
}

export async function generateMetadata({ params }: { params: { contest: string } }): Promise<Metadata> {
  const writeup = await getWriteupPageData(params.contest);
  if (!writeup) return {};

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
  if (!writeup) notFound();

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

  const { meta, hasEn, overviewHtml, overviewEnHtml, challenges, enChallenges } = writeup.data;
  const jaGroups = groupChallengesByCategory(challenges);
  const enGroups = enChallenges ? groupChallengesByCategory(enChallenges, "en-") : undefined;

  return (
    <div className="text-black bg-gray-100 min-h-screen flex flex-col items-center">
      <WriteupHeader />
      <main className="flex-grow w-full">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-10 min-w-0">
              <header className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link href="/writeups" className="text-sm text-[#6292e9] hover:text-[#1f4aa8]">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    All writeups
                  </Link>
                  {hasEn && <WriteupLangToggle defaultLang="ja" />}
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">{meta.title}</h2>
                <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                  {meta.date && <span>{meta.date}</span>}
                  {meta.team && <span>Team: {meta.team}</span>}
                  {typeof meta.rank !== "undefined" && <span>Rank: {meta.rank}</span>}
                </div>
                {meta.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="writeup-tag text-xs">#{tag}</span>
                    ))}
                  </div>
                )}
              </header>

              {(overviewHtml || overviewEnHtml) && (
                <div>
                  {overviewHtml && <div className={hasEn ? "lang-ja" : ""}><WriteupContent html={overviewHtml} /></div>}
                  {overviewEnHtml && <div className="lang-en"><WriteupContent html={overviewEnHtml} /></div>}
                </div>
              )}

              <div>
                <div className={hasEn ? "lang-ja" : ""}><ChallengeList groups={jaGroups} /></div>
                {hasEn && enGroups && <div className="lang-en"><ChallengeList groups={enGroups} /></div>}
              </div>
            </div>

            {challenges.length > 0 && (
              <aside className="hidden lg:block">
                <WriteupToc groups={toTocGroups(jaGroups)} />
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
