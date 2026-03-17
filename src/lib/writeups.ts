import path from "path";
import fs from "fs/promises";

export type ContestMeta = {
  title: string;
  date?: string;
  tags: string[];
  rank?: string;
  team?: string;
};

export type Problem = {
  title: string;
  order: number;
  orderLabel: string;
  categories: string[];
  solves?: number;
  anchor: string;
  bodyHtml: string;
  filename: string;
};

export type ContestData = {
  slug: string;
  meta: ContestMeta;
  overviewHtml: string;
  problems: Problem[];
};

export type StandaloneData = {
  slug: string;
  title: string;
  date?: string;
  bodyHtml: string;
};

export type WriteupPageData =
  | { kind: "contest"; data: ContestData }
  | { kind: "misc"; data: StandaloneData };

const writeupsRoot = path.join(process.cwd(), "content", "writeups");
const generatedRoot = path.join(writeupsRoot, ".generated");

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function readGeneratedIndex(): Promise<{ contestSlugs: string[]; miscSlugs: string[] }> {
  const indexPath = path.join(generatedRoot, "index.json");
  const source = await readFileIfExists(indexPath);
  if (!source) {
    return { contestSlugs: [], miscSlugs: [] };
  }
  try {
    const parsed = JSON.parse(source) as { contestSlugs?: string[]; miscSlugs?: string[] };
    return {
      contestSlugs: Array.isArray(parsed.contestSlugs) ? parsed.contestSlugs : [],
      miscSlugs: Array.isArray(parsed.miscSlugs) ? parsed.miscSlugs : [],
    };
  } catch {
    return { contestSlugs: [], miscSlugs: [] };
  }
}

export async function getContestSlugs(): Promise<string[]> {
  const index = await readGeneratedIndex();
  return index.contestSlugs;
}

export async function getMiscSlugs(): Promise<string[]> {
  const index = await readGeneratedIndex();
  return index.miscSlugs;
}

export async function getWriteupSlugs(): Promise<string[]> {
  const [contestSlugs, miscSlugs] = await Promise.all([getContestSlugs(), getMiscSlugs()]);
  const all = new Set<string>();
  contestSlugs.forEach((slug) => all.add(slug));
  miscSlugs.forEach((slug) => all.add(slug));
  return Array.from(all);
}

export async function getContestData(slug: string): Promise<ContestData | null> {
  if (slug === "misc") {
    return null;
  }
  const contestPath = path.join(generatedRoot, `contest-${slug}.json`);
  const source = await readFileIfExists(contestPath);
  if (!source) {
    return null;
  }
  try {
    return JSON.parse(source) as ContestData;
  } catch {
    return null;
  }
}

export async function getMiscData(slug: string): Promise<StandaloneData | null> {
  const miscPath = path.join(generatedRoot, `misc-${slug}.json`);
  const source = await readFileIfExists(miscPath);
  if (!source) {
    return null;
  }
  try {
    return JSON.parse(source) as StandaloneData;
  } catch {
    return null;
  }
}

export async function getWriteupPageData(slug: string): Promise<WriteupPageData | null> {
  const contest = await getContestData(slug);
  if (contest && contest.problems.length > 0) {
    return { kind: "contest", data: contest };
  }
  const misc = await getMiscData(slug);
  if (misc) {
    return { kind: "misc", data: misc };
  }
  if (contest) {
    return { kind: "contest", data: contest };
  }
  return null;
}
