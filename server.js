const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const LIB_PATH = path.join(DATA_DIR, "library.json");
const SRC_PATH = path.join(DATA_DIR, "sources.json");

const readJson = (file, fallback) => {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
};

let library = readJson(LIB_PATH, { categories: [], tags: [], books: [] });
let sources = readJson(SRC_PATH, { sources: [] });

const collectTags = () => {
  const tagSet = new Set(library.tags || []);
  (library.books || []).forEach((book) => {
    (book.tags || []).forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet);
};

const normalizeBook = (payload) => {
  const now = new Date().toISOString();
  const content = payload.content || "";
  const words = payload.words || Math.ceil(content.length / 500);
  return {
    id: payload.id || `bk-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    title: payload.title || "未命名",
    author: payload.author || "未知作者",
    categories: payload.categories || (payload.category ? [payload.category] : []),
    tags: payload.tags || [],
    description: payload.description || "",
    heat: payload.heat || 60,
    rating: payload.rating || 4.2,
    words,
    readMinutes: payload.readMinutes || Math.max(60, words * 10),
    publish: payload.publish || now.slice(0, 10),
    cover: payload.cover || "linear-gradient(135deg, #f2c48d, #f9d7aa)",
    source: payload.source || { type: "local", name: "本地录入" },
    createdAt: payload.createdAt || now,
    content
  };
};

const stripContent = (book) => {
  const { content, ...rest } = book;
  return rest;
};

const getSourceById = (id) => sources.sources.find((source) => source.id === id);

app.use(express.json({ limit: "6mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/sources", (req, res) => {
  res.json({ sources: sources.sources || [] });
});

app.get("/api/books", (req, res) => {
  res.json({
    books: (library.books || []).map(stripContent),
    tags: collectTags(),
    categories: library.categories || []
  });
});

app.get("/api/books/:id", (req, res) => {
  const book = (library.books || []).find((item) => item.id === req.params.id);
  if (!book) {
    res.status(404).json({ message: "未找到书籍" });
    return;
  }
  res.json(stripContent(book));
});

app.get("/api/books/:id/content", (req, res) => {
  const book = (library.books || []).find((item) => item.id === req.params.id);
  if (!book) {
    res.status(404).json({ message: "未找到书籍" });
    return;
  }
  res.json({ content: book.content || "" });
});

app.post("/api/books", (req, res) => {
  const payload = req.body || {};
  if (!payload.title || !payload.author) {
    res.status(400).json({ message: "书名和作者不能为空" });
    return;
  }
  const book = normalizeBook(payload);
  library.books = [book, ...(library.books || [])];
  library.tags = collectTags();
  writeJson(LIB_PATH, library);
  res.json(stripContent(book));
});

app.post("/api/import/external", async (req, res) => {
  const payload = req.body || {};
  if (!payload.title) {
    res.status(400).json({ message: "缺少书名" });
    return;
  }
  let content = payload.content || "";
  if (!content && payload.textUrl) {
    try {
      content = await safeFetchText(payload.textUrl);
    } catch (err) {
      content = "";
    }
  }
  const book = normalizeBook({
    ...payload,
    content,
    source: { type: "external", name: payload.sourceName || payload.source || "外部书源" }
  });
  library.books = [book, ...(library.books || [])];
  library.tags = collectTags();
  writeJson(LIB_PATH, library);
  res.json(stripContent(book));
});

const safeFetchJson = async (url) => {
  if (typeof fetch !== "function") {
    throw new Error("当前 Node 版本不支持 fetch");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("外部请求失败");
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
};

const safeFetchText = async (url) => {
  if (typeof fetch !== "function") {
    throw new Error("当前 Node 版本不支持 fetch");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("外部请求失败");
    const text = await res.text();
    return text.slice(0, 200000);
  } finally {
    clearTimeout(timeout);
  }
};

const externalAdapters = {
  openlibrary: async (query, source) => {
    const url = new URL(source.baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "10");
    const data = await safeFetchJson(url.toString());
    const docs = data.docs || [];
    return docs.map((doc) => ({
      source: source.id,
      sourceName: source.name,
      remoteId: doc.key,
      title: doc.title,
      author: (doc.author_name && doc.author_name[0]) || "未知作者",
      description: (doc.subject && doc.subject.slice(0, 3).join(" / ")) || "",
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
      rating: 4.2,
      heat: 60,
      publish: doc.first_publish_year ? `${doc.first_publish_year}-01-01` : ""
    }));
  },
  gutendex: async (query, source) => {
    const url = new URL(source.baseUrl);
    url.searchParams.set("search", query);
    const data = await safeFetchJson(url.toString());
    const results = data.results || [];
    return results.map((item) => {
      const author = item.authors && item.authors.length ? item.authors[0].name : "未知作者";
      const cover = item.formats ? item.formats["image/jpeg"] : "";
      const textUrl = item.formats ? item.formats["text/plain; charset=utf-8"] : "";
      return {
        source: source.id,
        sourceName: source.name,
        remoteId: item.id,
        title: item.title,
        author,
        description: "公版图书，可导入阅读",
        cover,
        rating: 4.3,
        heat: 65,
        publish: "",
        content: "",
        textUrl
      };
    });
  }
};

app.get("/api/external/search", async (req, res) => {
  const query = (req.query.q || "").toString().trim();
  const sourceId = (req.query.source || "").toString();
  if (!query) {
    res.json({ results: [] });
    return;
  }
  const source = getSourceById(sourceId);
  if (!source || !source.enabled) {
    res.status(400).json({ message: "书源不可用" });
    return;
  }
  const adapter = externalAdapters[source.id];
  if (!adapter) {
    res.status(400).json({ message: "该书源尚未配置适配器" });
    return;
  }
  try {
    const results = await adapter(query, source);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "外部搜索失败" });
  }
});

app.listen(PORT, () => {
  console.log(`书潮服务已启动：http://localhost:${PORT}`);
});
