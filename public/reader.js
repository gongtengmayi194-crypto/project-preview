const STORAGE_KEY = "shuchao_reader_state_v2";

const els = {
  title: document.getElementById("readerTitle"),
  meta: document.getElementById("readerMeta"),
  content: document.getElementById("readerContent"),
  progress: document.getElementById("readerProgress"),
  progressValue: document.getElementById("readerProgressValue")
};

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const loadLocalState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (err) {
    return {};
  }
};

const saveLocalState = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const renderContent = (text) => {
  els.content.innerHTML = "";
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  if (!paragraphs.length) {
    els.content.innerHTML = "<div class=\"book-meta\">暂无正文内容</div>";
    return;
  }
  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    els.content.appendChild(p);
  });
};

const updateProgress = (value) => {
  const clamped = Math.max(0, Math.min(100, value));
  els.progress.value = clamped;
  els.progressValue.textContent = `${clamped}%`;
  const data = loadLocalState();
  data.progress = data.progress || {};
  if (bookId) data.progress[bookId] = clamped;
  saveLocalState(data);
};

const init = async () => {
  if (!bookId) {
    els.title.textContent = "未找到书籍";
    return;
  }

  try {
    const [bookRes, contentRes] = await Promise.all([
      fetch(`/api/books/${bookId}`),
      fetch(`/api/books/${bookId}/content`)
    ]);

    if (!bookRes.ok) throw new Error("书籍不存在");
    const book = await bookRes.json();
    const contentData = contentRes.ok ? await contentRes.json() : { content: "" };

    els.title.textContent = book.title || "未命名";
    els.meta.textContent = `${book.author || "未知作者"} · ${book.publish || ""}`;
    renderContent(contentData.content || "");

    const data = loadLocalState();
    const progress = data.progress && data.progress[bookId] ? data.progress[bookId] : 0;
    updateProgress(progress);
  } catch (err) {
    els.title.textContent = "读取失败，请确认后端已启动";
  }

  els.progress.addEventListener("input", (event) => {
    updateProgress(Number(event.target.value));
  });
};

document.addEventListener("DOMContentLoaded", init);
