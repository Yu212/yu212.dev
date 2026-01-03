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

const writeupsRoot = path.join(process.cwd(), "content", "writeups");
const miscRoot = path.join(writeupsRoot, "misc");
const generatedRoot = path.join(writeupsRoot, ".generated");
const problemFilePattern = /^(\d{2})-([^-]+)-(.+)\.mdx$/;

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

async function renderMarkdown(markdown) {
  const compiled = await compile(markdown, {
    outputFormat: "function-body",
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
      rehypeKatex,
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

  const entries = await readDirSafe(contestDir);
  if (!entries) {
    addError(`[writeups] Could not read contest directory: ${contestDir}`);
    return;
  }

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".mdx")) {
      continue;
    }
    if (entry.name.startsWith("index.")) {
      continue;
    }
    if (!problemFilePattern.test(entry.name)) {
      addError(`[writeups] Problem filename invalid: ${path.join(contestDir, entry.name)}`);
      continue;
    }
    const problemPath = path.join(contestDir, entry.name);
    const problemSource = await readFileSafe(problemPath);
    if (!problemSource) {
      addError(`[writeups] Could not read problem file: ${problemPath}`);
      continue;
    }
    const { data: problemData } = matter(problemSource);
    if (!isNonEmptyString(problemData.title)) {
      addError(`[writeups] Problem missing title: ${problemPath}`);
    }
  }
}

async function validateWriteups() {
  const entries = await readDirSafe(writeupsRoot);
  if (!entries) {
    addError(`[writeups] Missing writeups directory: ${writeupsRoot}`);
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === "misc" || entry.name === ".generated") {
      continue;
    }
    await validateContestDir(entry);
  }

  const miscEntries = await readDirSafe(miscRoot);
  if (miscEntries) {
    for (const entry of miscEntries) {
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
        continue;
      }
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

  if (!entries) {
    return contestSlugs;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === "misc" || entry.name === ".generated") {
      continue;
    }

    const contestDir = path.join(writeupsRoot, entry.name);
    const indexSource = await readContestIndexSource(contestDir);
    if (!indexSource) {
      continue;
    }

    const { data, content } = matter(indexSource);
    const overviewHtml = await renderMarkdown(content);

    const meta = {
      title: typeof data.title === "string" ? data.title : entry.name,
      date: typeof data.date === "string" ? data.date : undefined,
      tags: Array.isArray(data.tags)
        ? data.tags.map((tag) => String(tag)).filter((tag) => tag.length > 0)
        : typeof data.tags === "string"
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
      rank: typeof data.rank === "string" || typeof data.rank === "number" ? String(data.rank) : undefined,
      team: typeof data.team === "string" ? data.team : undefined,
    };

    const files = await fs.readdir(contestDir);
    const problemFiles = files
      .filter((file) => file.endsWith(".mdx") && !file.startsWith("index."))
      .map((file) => {
        const match = file.match(problemFilePattern);
        if (!match) {
          return null;
        }
        return {
          file,
          order: Number.parseInt(match[1], 10),
          category: match[2],
          slug: `${match[1]}-${match[2]}-${match[3]}`,
        };
      })
      .filter(Boolean);

    const problems = [];
    for (const { file, order, category, slug } of problemFiles) {
      const source = await fs.readFile(path.join(contestDir, file), "utf8");
      const { data: problemData, content: problemContent } = matter(source);
      const title = typeof problemData.title === "string" ? problemData.title : "";
      const bodyHtml = await renderMarkdown(problemContent);

      problems.push({
        title,
        order,
        orderLabel: String(order).padStart(2, "0"),
        category,
        bodyHtml,
        filename: file,
        slug,
      });
    }

    const sortedProblems = problems
      .sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename))
      .map((problem) => ({
        ...problem,
        anchor: problem.slug,
      }));

    const contestPayload = {
      slug: entry.name,
      meta,
      overviewHtml,
      problems: sortedProblems,
    };

    await writeJson(path.join(generatedRoot, `contest-${entry.name}.json`), contestPayload);
    contestSlugs.push(entry.name);
  }

  return contestSlugs;
}

async function buildMisc() {
  const entries = await readDirSafe(miscRoot);
  const miscSlugs = [];

  if (!entries) {
    return miscSlugs;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
      continue;
    }
    const slug = entry.name.replace(/\.mdx$/, "");
    const source = await fs.readFile(path.join(miscRoot, entry.name), "utf8");
    const { data, content } = matter(source);
    const title = typeof data.title === "string" ? data.title : "";
    const date = typeof data.date === "string" ? data.date : undefined;
    const bodyHtml = await renderMarkdown(content);

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
