import Link from "next/link";
import { getContestData, getContestSlugs, getMiscData, getMiscSlugs } from "@/lib/writeups";
import WriteupHeader from "@/components/writeup/writeup-header";

function toTimestamp(value?: string) {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default async function WriteupsIndexPage() {
  const [contestSlugs, miscSlugs] = await Promise.all([getContestSlugs(), getMiscSlugs()]);

  const contests = (await Promise.all(contestSlugs.map((slug) => getContestData(slug))))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => toTimestamp(b.meta.date) - toTimestamp(a.meta.date) || a.slug.localeCompare(b.slug));

  const misc = (await Promise.all(miscSlugs.map((slug) => getMiscData(slug))))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="text-black bg-gray-100 min-h-screen flex flex-col items-center">
      <WriteupHeader />
      <main className="flex-grow w-full">
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contests</h2>
            {contests.length === 0 && <p className="text-gray-600">No contests yet.</p>}
            <div className="space-y-4">
              {contests.map((contest) => (
                <Link key={contest.slug} href={`/writeups/${contest.slug}`} className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-[#95caee]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{contest.meta.title}</h3>
                    {contest.meta.date && <span className="text-sm text-gray-500">{contest.meta.date}</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-3">
                    {contest.meta.team && <span>Team: {contest.meta.team}</span>}
                    {typeof contest.meta.rank !== "undefined" && <span>Rank: {contest.meta.rank}</span>}
                    {contest.meta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {contest.meta.tags.map((tag) => (
                          <span key={tag} className="writeup-tag text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Misc</h2>
            {misc.length === 0 && <p className="text-gray-600">No standalone writeups yet.</p>}
            <div className="space-y-3">
              {misc.map((item) => (
                <Link key={item.slug} href={`/writeups/${item.slug}`} className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-[#95caee]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-medium">{item.title}</span>
                    {item.date && <span className="text-sm text-gray-500">{item.date}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
