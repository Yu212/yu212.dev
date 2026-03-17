import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { compile, run } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import { renderToStaticMarkup } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { visit } from "unist-util-visit";

const writeupsRoot = path.join(process.cwd(), "content", "writeups");
const miscRoot = path.join(writeupsRoot, "misc");
const publicWriteupsRoot = path.join(process.cwd(), "public", "writeups");
const generatedRoot = path.join(writeupsRoot, ".generated");
const challengeFilePattern = /^(\d{2})-(.+)\.mdx$/;

const errors = [];

function addError(message) {
  errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTags(value) {
  if (Array.isArray(value)) {
    return value.every((tag) => isNonEmptyString(String(tag))) && value.length > 0;
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0).length > 0;
  }
  return false;
}

async function renderMarkdown(markdown, basePath = "") {
  const compiled = await compile(markdown, {
    outputFormat: "function-body",
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
      rehypeKatex,
      ...(basePath ? [() => (tree) => {
        visit(tree, "element", (node) => {
          if (node.tagName === "img" && typeof node.properties?.src === "string") {
            const src = node.properties.src;
            if (!src.startsWith("http") && !src.startsWith("/") && !src.startsWith("data:")) {
              node.properties.src = `${basePath}/${src.replace(/^\.\//, "")}`;
            }
          }
        });
      }] : []),
      [
        rehypePrettyCode,
        {
          theme: "dark-plus",
          defaultLang: "text",
          keepBackground: false,
        },
      ],
    ],
    remarkRehypeOptions: { allowDangerousHtml: true },
  });

  const WriteupPre = ({ children, ...props }) => {
    const { className, ...rest } = props ?? {};
    return jsxs("div", {
      className: "writeup-code-block",
      children: [
        jsx("pre", {
          className,
          ...rest,
          children,
        }),
        jsx("button", {
          type: "button",
          className: "writeup-code-copy",
          "aria-label": "Copy code",
          children: jsx(FontAwesomeIcon, { icon: faCopy }),
        }),
      ],
    });
  };

  const { default: Content } = await run(compiled, {
    Fragment,
    jsx,
    jsxs,
    useMDXComponents: () => ({ pre: WriteupPre }),
  });

  return renderToStaticMarkup(jsx(Content, {}));
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

async function copyImages(srcDir, destSlug) {
  const entries = await readDirSafe(srcDir);
  if (!entries) return;
  const destDir = path.join(publicWriteupsRoot, destSlug);
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) continue;
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(path.join(srcDir, entry.name), path.join(destDir, entry.name));
  }
}

async function readDirSafe(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function readContestIndexSource(contestDir) {
  const mdxPath = path.join(contestDir, "index.mdx");
  return await readFileSafe(mdxPath);
}

async function writeJson(filePath, payload) {
  const json = JSON.stringify(payload, null, 2);
  await fs.writeFile(filePath, `${json}\n`, "utf8");
}

async function buildChallenges(contestDir, basePath, anchorPrefix = "") {
  const files = await fs.readdir(contestDir);
  const challengeFiles = files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("index."))
    .map((file) => {
      const match = file.match(challengeFilePattern);
      if (!match) return null;
      return {
        file,
        order: Number.parseInt(match[1], 10),
        slug: `${match[1]}-${match[2]}`,
        name: match[2],
      };
    })
    .filter(Boolean);

  const challenges = [];
  for (const { file, order, slug, name } of challengeFiles) {
    const source = await fs.readFile(path.join(contestDir, file), "utf8");
    const { data: challengeData, content: challengeContent } = matter(source);
    const title = typeof challengeData.title === "string" ? challengeData.title : "";
    const categories = challengeData.categories.map((c) => String(c));
    const solves = typeof challengeData.solves === "number" ? challengeData.solves : undefined;
    const bodyHtml = await renderMarkdown(challengeContent, basePath);

    challenges.push({
      title,
      order,
      orderLabel: String(order).padStart(2, "0"),
      categories,
      solves,
      bodyHtml,
      filename: file,
      slug,
      name,
    });
  }

  return challenges
    .sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename))
    .map((challenge) => ({ ...challenge, anchor: anchorPrefix + challenge.name }));
}

async function validateChallengeFiles(dir, label) {
  const entries = await readDirSafe(dir);
  if (!entries) return;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx") || entry.name.startsWith("index.")) continue;
    if (!challengeFilePattern.test(entry.name)) {
      addError(`[writeups] Challenge filename invalid: ${path.join(dir, entry.name)}`);
      continue;
    }
    const source = await readFileSafe(path.join(dir, entry.name));
    if (!source) {
      addError(`[writeups] Could not read challenge file: ${path.join(dir, entry.name)}`);
      continue;
    }
    const { data } = matter(source);
    if (!isNonEmptyString(data.title)) {
      addError(`[writeups] ${label} challenge missing title: ${path.join(dir, entry.name)}`);
    }
    if (!isValidTags(data.categories)) {
      addError(`[writeups] ${label} challenge missing categories: ${path.join(dir, entry.name)}`);
    }
  }
}

async function validateContestDir(dirent) {
  const contestDir = path.join(writeupsRoot, dirent.name);
  const source = await readContestIndexSource(contestDir);

  if (!source) {
    addError(`[writeups] Missing index.mdx: ${contestDir}`);
    return;
  }

  const { data } = matter(source);

  if (!isNonEmptyString(data.title)) {
    addError(`[writeups] index.mdx missing title: ${contestDir}`);
  }
  if (!isNonEmptyString(data.date)) {
    addError(`[writeups] index.mdx missing date: ${contestDir}`);
  }
  if (!isValidTags(data.tags)) {
    addError(`[writeups] index.mdx missing tags: ${contestDir}`);
  }
  if (data.team !== undefined && !isNonEmptyString(String(data.team))) {
    addError(`[writeups] index.mdx invalid team: ${contestDir}`);
  }
  if (data.rank !== undefined && !isNonEmptyString(String(data.rank))) {
    addError(`[writeups] index.mdx invalid rank: ${contestDir}`);
  }

  await validateChallengeFiles(contestDir, "ja");

  const enDir = path.join(contestDir, "en");
  const enIndex = await readFileSafe(path.join(enDir, "index.mdx"));
  if (enIndex !== null) {
    await validateChallengeFiles(enDir, "en");
  }
}

async function validateWriteups() {
  const entries = await readDirSafe(writeupsRoot);
  if (!entries) {
    addError(`[writeups] Missing writeups directory: ${writeupsRoot}`);
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "misc" || entry.name === ".generated") continue;
    if (entry.name.startsWith("_")) continue;
    await validateContestDir(entry);
  }

  const miscEntries = await readDirSafe(miscRoot);
  if (miscEntries) {
    for (const entry of miscEntries) {
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
      const miscPath = path.join(miscRoot, entry.name);
      const source = await readFileSafe(miscPath);
      if (!source) {
        addError(`[writeups] Could not read misc file: ${miscPath}`);
        continue;
      }
      const { data } = matter(source);
      if (!isNonEmptyString(data.title)) {
        addError(`[writeups] misc missing title: ${miscPath}`);
      }
      if (!isNonEmptyString(data.date)) {
        addError(`[writeups] misc missing date: ${miscPath}`);
      }

      const slug = entry.name.replace(/\.mdx$/, "");
      const contestDir = path.join(writeupsRoot, slug);
      try {
        const stat = await fs.stat(contestDir);
        if (stat.isDirectory()) {
          addError(`[writeups] Slug conflict between contest and misc: ${slug}`);
        }
      } catch {
        // no conflict
      }
    }
  }
}

async function buildContests() {
  const entries = await readDirSafe(writeupsRoot);
  const contestSlugs = [];

  if (!entries) return contestSlugs;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "misc" || entry.name === ".generated") continue;

    const contestDir = path.join(writeupsRoot, entry.name);
    const indexSource = await readContestIndexSource(contestDir);
    if (!indexSource) continue;

    const { data, content } = matter(indexSource);
    const basePath = `/writeups/${entry.name}`;
    await copyImages(contestDir, entry.name);
    const overviewHtml = await renderMarkdown(content, basePath);

    const meta = {
      title: typeof data.title === "string" ? data.title : entry.name,
      date: typeof data.date === "string" ? data.date : undefined,
      tags: Array.isArray(data.tags)
        ? data.tags.map((tag) => String(tag)).filter((tag) => tag.length > 0)
        : typeof data.tags === "string"
          ? data.tags.split(",")
          : [],
      rank: typeof data.rank === "string" || typeof data.rank === "number" ? String(data.rank) : undefined,
      team: typeof data.team === "string" ? data.team : undefined,
    };

    const challenges = await buildChallenges(contestDir, basePath);

    const enDir = path.join(contestDir, "en");
    const enIndexSource = await readFileSafe(path.join(enDir, "index.mdx"));
    const hasEn = enIndexSource !== null;

    let overviewEnHtml;
    let enChallenges;
    if (hasEn) {
      const { content: enContent } = matter(enIndexSource);
      overviewEnHtml = await renderMarkdown(enContent, basePath);
      enChallenges = await buildChallenges(enDir, basePath, "en-");
    }

    const contestPayload = {
      slug: entry.name,
      meta,
      hasEn,
      overviewHtml,
      ...(hasEn && { overviewEnHtml, enChallenges }),
      challenges,
    };

    await writeJson(path.join(generatedRoot, `contest-${entry.name}.json`), contestPayload);
    contestSlugs.push(entry.name);
  }

  return contestSlugs;
}

async function buildMisc() {
  const entries = await readDirSafe(miscRoot);
  const miscSlugs = [];

  if (!entries) return miscSlugs;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
    const slug = entry.name.replace(/\.mdx$/, "");
    const source = await fs.readFile(path.join(miscRoot, entry.name), "utf8");
    const { data, content } = matter(source);
    const title = typeof data.title === "string" ? data.title : "";
    const date = typeof data.date === "string" ? data.date : undefined;
    await copyImages(miscRoot, "misc");
    const bodyHtml = await renderMarkdown(content, `/writeups/misc`);

    await writeJson(path.join(generatedRoot, `misc-${slug}.json`), {
      slug,
      title,
      date,
      bodyHtml,
    });

    miscSlugs.push(slug);
  }

  return miscSlugs;
}

async function buildWriteups() {
  await fs.mkdir(generatedRoot, { recursive: true });
  const [contestSlugs, miscSlugs] = await Promise.all([buildContests(), buildMisc()]);

  await writeJson(path.join(generatedRoot, "index.json"), {
    contestSlugs,
    miscSlugs,
  });
}

await validateWriteups();

if (errors.length > 0) {
  console.error("Writeup validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

await buildWriteups();
console.log("Writeup build + validation completed.");
