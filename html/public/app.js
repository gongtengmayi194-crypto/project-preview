const STORAGE_KEY = "shuchao_reader_state_v2";

const state = {
  books: [],
  tags: [],
  categories: [],
  sources: [],
  searchQuery: "",
  selectedTags: new Set(),
  selectedCategory: "all",
  sort: "smart",
  favorites: new Set(),
  history: [],
  progress: {},
  tagAffinity: {},
  notes: [],
  apiReady: false,
  externalResults: []
};

const els = {};

const byId = (id) => document.getElementById(id);
const formatNumber = (num) => (Number.isFinite(num) ? num : 0);

const daysSince = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 365;
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, diff);
};

const loadLocalState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    state.favorites = new Set(data.favorites || []);
    state.history = data.history || [];
    state.progress = data.progress || {};
    state.tagAffinity = data.tagAffinity || {};
    state.notes = data.notes || [];
  } catch (err) {
    console.warn("读取本地状态失败", err);
  }
};

const saveLocalState = () => {
  const payload = {
    favorites: Array.from(state.favorites),
    history: state.history,
    progress: state.progress,
    tagAffinity: state.tagAffinity,
    notes: state.notes
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const setApiStatus = (ok, text) => {
  if (!els.apiStatus) return;
  els.apiStatus.textContent = text;
  els.apiStatus.classList.remove("ok", "warn");
  els.apiStatus.classList.add(ok ? "ok" : "warn");
};

const fetchLibrary = async () => {
  try {
    const res = await fetch("/api/books");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    state.books = data.books || [];
    state.tags = data.tags || [];
    state.categories = data.categories || [];
    state.apiReady = true;
    setApiStatus(true, "API 正常");
  } catch (err) {
    state.apiReady = false;
    setApiStatus(false, "API 未启动");
  }
};

const fetchSources = async () => {
  try {
    const res = await fetch("/api/sources");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    state.sources = data.sources || [];
  } catch (err) {
    state.sources = [];
  }
};

const getSmartScore = (book) => {
  const heat = formatNumber(book.heat) / 100;
  const rating = formatNumber(book.rating) / 5;
  const fresh = Math.max(0, 1 - daysSince(book.publish) / 365);
  const tagScore = (book.tags || []).reduce((sum, tag) => sum + (state.tagAffinity[tag] || 0), 0);
  const selectBoost = (book.tags || []).some((tag) => state.selectedTags.has(tag)) ? 0.35 : 0;
  const favoriteBoost = state.favorites.has(book.id) ? 0.3 : 0;
  const recentPenalty = state.history.includes(book.id) ? 0.25 : 0;
  return tagScore * 0.6 + heat * 0.25 + rating * 0.25 + fresh * 0.15 + selectBoost + favoriteBoost - recentPenalty;
};

const getFilteredBooks = () => {
  const query = state.searchQuery.trim().toLowerCase();
  return state.books.filter((book) => {
    const matchesCategory =
      state.selectedCategory === "all" || (book.categories || []).includes(state.selectedCategory);
    const matchesTags =
      state.selectedTags.size === 0 ||
      Array.from(state.selectedTags).every((tag) => (book.tags || []).includes(tag));
    const matchesQuery =
      !query ||
      [book.title, book.author, book.description, ...(book.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return matchesCategory && matchesTags && matchesQuery;
  });
};

const sortBooks = (books) => {
  const list = [...books];
  if (state.sort === "heat") {
    return list.sort((a, b) => formatNumber(b.heat) - formatNumber(a.heat));
  }
  if (state.sort === "rating") {
    return list.sort((a, b) => formatNumber(b.rating) - formatNumber(a.rating));
  }
  if (state.sort === "newest") {
    return list.sort((a, b) => new Date(b.publish) - new Date(a.publish));
  }
  return list.sort((a, b) => getSmartScore(b) - getSmartScore(a));
};

const updateAffinity = (book) => {
  (book.tags || []).forEach((tag) => {
    state.tagAffinity[tag] = (state.tagAffinity[tag] || 0) + 0.25;
  });
};

const updateHistory = (bookId) => {
  state.history = [bookId, ...state.history.filter((id) => id !== bookId)].slice(0, 8);
};

const getCategoryName = (categoryId) =>
  state.categories.find((category) => category.id === categoryId)?.name || "未分类";

const buildTag = (tag) => {
  const button = document.createElement("button");
  button.className = "tag" + (state.selectedTags.has(tag) ? " active" : "");
  button.textContent = tag;
  button.addEventListener("click", () => {
    if (state.selectedTags.has(tag)) {
      state.selectedTags.delete(tag);
    } else {
      state.selectedTags.add(tag);
    }
    renderAll();
  });
  return button;
};

const buildBookCard = (book, index = 0) => {
  const card = document.createElement("div");
  card.className = "book-card";
  card.style.animationDelay = `${index * 0.05}s`;

  const cover = document.createElement("div");
  cover.className = "book-cover";
  if (book.cover) {
    if (book.cover.startsWith("http")) {
      cover.style.backgroundImage = `url('${book.cover}')`;
    } else {
      cover.style.background = book.cover;
    }
  }
  const badge = document.createElement("span");
  badge.textContent = `${formatNumber(book.heat)} 热度`;
  cover.appendChild(badge);

  const title = document.createElement("div");
  title.className = "book-title";
  title.textContent = book.title;

  const meta = document.createElement("div");
  meta.className = "book-meta";
  const categoryLabel = (book.categories || []).map(getCategoryName).join(" / ");
  meta.textContent = `${book.author} · ${categoryLabel} · ${formatNumber(book.rating)} 分`;

  const desc = document.createElement("div");
  desc.className = "book-meta";
  desc.textContent = book.description || "暂无简介";

  const actionRow = document.createElement("div");
  actionRow.className = "book-actions";

  const readBtn = document.createElement("button");
  readBtn.className = "btn primary";
  readBtn.textContent = "阅读";
  readBtn.addEventListener("click", () => openReader(book.id));

  const favBtn = document.createElement("button");
  favBtn.className = "btn ghost";
  favBtn.textContent = state.favorites.has(book.id) ? "已收藏" : "收藏";
  favBtn.addEventListener("click", () => toggleFavorite(book.id));

  actionRow.append(readBtn, favBtn);

  card.append(cover, title, meta, desc, actionRow);
  return card;
};

const renderTags = () => {
  els.tagList.innerHTML = "";
  state.tags.forEach((tag) => {
    els.tagList.appendChild(buildTag(tag));
  });
};

const renderHero = () => {
  const list = sortBooks(state.books);
  const heroBook = list[0];
  if (!heroBook) {
    els.heroTitle.textContent = "暂无数据";
    els.heroDesc.textContent = "请先启动后端或录入书籍。";
    return;
  }
  els.heroTitle.textContent = heroBook.title;
  els.heroDesc.textContent = heroBook.description || "";
  if (heroBook.cover) {
    if (heroBook.cover.startsWith("http")) {
      els.heroCover.style.background = "#f2e8dc";
      els.heroCover.style.backgroundImage = `url('${heroBook.cover}')`;
      els.heroCover.style.backgroundColor = "#f2e8dc";
    } else {
      els.heroCover.style.backgroundImage = "";
      els.heroCover.style.background = heroBook.cover;
    }
  } else {
    els.heroCover.style.backgroundImage = "";
    els.heroCover.style.background = "#f2e8dc";
  }
  els.heroMeta.textContent = `${heroBook.author} · ${formatNumber(heroBook.rating)} 分 · ${heroBook.words || 0} 万字`;
  els.heroRead.onclick = () => openReader(heroBook.id);
  els.heroFavorite.onclick = () => toggleFavorite(heroBook.id);
};

const renderRecommend = () => {
  const list = sortBooks(getFilteredBooks()).slice(0, 6);
  const hint = state.selectedTags.size
    ? `根据你选择的标签：${Array.from(state.selectedTags).join("、")}`
    : state.history.length
      ? "根据最近阅读与热度综合排序"
      : "根据热度、评分与最新上架综合推荐";
  els.recommendDesc.textContent = hint;
  els.recommendGrid.innerHTML = "";
  list.forEach((book, index) => {
    els.recommendGrid.appendChild(buildBookCard(book, index));
  });
};

const renderCategoryGrid = () => {
  els.categoryGrid.innerHTML = "";
  const allCard = document.createElement("div");
  allCard.className = "category-card";
  allCard.innerHTML = `
    <strong>全部</strong>
    <div class="book-meta">查看全部馆藏</div>
  `;
  allCard.addEventListener("click", () => {
    state.selectedCategory = "all";
    renderAll();
  });
  els.categoryGrid.appendChild(allCard);

  state.categories.forEach((category) => {
    const count = state.books.filter((book) => (book.categories || []).includes(category.id)).length;
    const card = document.createElement("div");
    card.className = "category-card";
    card.style.background = `linear-gradient(135deg, #fff7ee, ${category.tone || "#f5e3cf"})`;
    card.innerHTML = `
      <strong>${category.name}</strong>
      <div class="book-meta">${category.desc || ""}</div>
      <div class="book-meta">${count} 本 · 点击进入分区</div>
    `;
    card.addEventListener("click", () => {
      state.selectedCategory = category.id;
      renderAll();
    });
    els.categoryGrid.appendChild(card);
  });
};

const renderBooks = () => {
  const filtered = sortBooks(getFilteredBooks());
  const tagPart = state.selectedTags.size ? `标签：${Array.from(state.selectedTags).join("、")}` : "";
  const categoryName =
    state.selectedCategory === "all" ? "全部" : getCategoryName(state.selectedCategory);
  const queryPart = state.searchQuery ? `关键词：${state.searchQuery}` : "";
  const hintParts = [categoryName, tagPart, queryPart].filter(Boolean).join(" · ");
  els.resultHint.textContent = hintParts ? `${hintParts} · 共 ${filtered.length} 本` : `共 ${filtered.length} 本书`;

  els.bookGrid.innerHTML = "";
  if (!state.apiReady) {
    const item = document.createElement("div");
    item.className = "book-meta";
    item.textContent = "后端未启动，请先运行 server.js。";
    els.bookGrid.appendChild(item);
    return;
  }
  if (!filtered.length) {
    const item = document.createElement("div");
    item.className = "book-meta";
    item.textContent = "没有匹配的书籍";
    els.bookGrid.appendChild(item);
    return;
  }
  filtered.forEach((book, index) => {
    els.bookGrid.appendChild(buildBookCard(book, index));
  });
};

const renderHotList = () => {
  const list = [...state.books].sort((a, b) => formatNumber(b.heat) - formatNumber(a.heat)).slice(0, 8);
  els.hotList.innerHTML = "";
  list.forEach((book, index) => {
    const item = document.createElement("div");
    item.className = "rank-item";
    item.innerHTML = `
      <div><strong>#${index + 1} ${book.title}</strong></div>
      <div class="book-meta">${book.author} · 热度 ${formatNumber(book.heat)}</div>
    `;
    item.addEventListener("click", () => openReader(book.id));
    els.hotList.appendChild(item);
  });
};

const renderHistory = () => {
  els.historyList.innerHTML = "";
  if (!state.history.length) {
    const empty = document.createElement("div");
    empty.className = "book-meta";
    empty.textContent = "还没有阅读记录";
    els.historyList.appendChild(empty);
    return;
  }
  state.history.forEach((id) => {
    const book = state.books.find((item) => item.id === id);
    if (!book) return;
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div><strong>${book.title}</strong></div>
      <div class="book-meta">${book.author} · ${state.progress[id] || 0}%</div>
    `;
    item.addEventListener("click", () => openReader(book.id));
    els.historyList.appendChild(item);
  });
};

const renderStats = () => {
  const avgProgress = Object.values(state.progress).reduce((sum, val) => sum + val, 0);
  const progressCount = Object.keys(state.progress).length || 1;
  const avgValue = Math.round(avgProgress / progressCount);
  els.sidebarStats.innerHTML = `
    <div>馆藏：${state.books.length} 本</div>
    <div>收藏：${state.favorites.size} 本</div>
    <div>平均进度：${avgValue}%</div>
  `;
};

const renderNotes = () => {
  els.noteList.innerHTML = "";
  if (!state.notes.length) {
    const empty = document.createElement("div");
    empty.className = "book-meta";
    empty.textContent = "写下第一条笔记吧";
    els.noteList.appendChild(empty);
    return;
  }
  state.notes.forEach((note, index) => {
    const item = document.createElement("div");
    item.className = "note-item";
    item.innerHTML = `
      <div>${note.text}</div>
      <div class="book-meta">${note.time}</div>
    `;
    item.addEventListener("click", () => removeNote(index));
    els.noteList.appendChild(item);
  });
};

const renderSourceMeta = () => {
  els.sourceMeta.innerHTML = "";
  if (!state.sources.length) {
    const empty = document.createElement("div");
    empty.className = "book-meta";
    empty.textContent = "暂无可用书源";
    els.sourceMeta.appendChild(empty);
    return;
  }
  state.sources.forEach((source) => {
    const item = document.createElement("div");
    item.textContent = `${source.name} · ${source.enabled ? "可用" : "未启用"}`;
    els.sourceMeta.appendChild(item);
  });
};

const renderExternalResults = () => {
  els.externalResults.innerHTML = "";
  if (!state.externalResults.length) {
    const empty = document.createElement("div");
    empty.className = "book-meta";
    empty.textContent = "暂无结果";
    els.externalResults.appendChild(empty);
    return;
  }
  state.externalResults.forEach((book) => {
    const card = document.createElement("div");
    card.className = "external-card";
    card.innerHTML = `
      <div class="book-title">${book.title}</div>
      <div class="book-meta">${book.author || "未知作者"}</div>
      <div class="book-meta">来源：${book.sourceName || book.source}</div>
    `;
    const actions = document.createElement("div");
    actions.className = "book-actions";
    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "导入";
    addBtn.addEventListener("click", () => importExternalBook(book));
    actions.appendChild(addBtn);
    card.appendChild(actions);
    els.externalResults.appendChild(card);
  });
};

const toggleFavorite = (bookId) => {
  if (state.favorites.has(bookId)) {
    state.favorites.delete(bookId);
  } else {
    state.favorites.add(bookId);
  }
  saveLocalState();
  renderStats();
  renderBooks();
};

const openReader = (bookId) => {
  const book = state.books.find((item) => item.id === bookId);
  if (book) {
    updateHistory(bookId);
    updateAffinity(book);
    saveLocalState();
    renderHistory();
    renderStats();
  }
  window.location.href = `reader.html?id=${bookId}`;
};

const addNote = () => {
  const text = els.noteInput.value.trim();
  if (!text) return;
  const time = new Date().toLocaleString("zh-CN", { hour12: false });
  state.notes = [{ text, time }, ...state.notes].slice(0, 6);
  els.noteInput.value = "";
  saveLocalState();
  renderNotes();
};

const removeNote = (index) => {
  state.notes.splice(index, 1);
  saveLocalState();
  renderNotes();
};

const updateSortButtons = () => {
  document.querySelectorAll(".sort-buttons .chip").forEach((btn) => {
    if (btn.dataset.sort === state.sort) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
};

const renderAll = () => {
  renderTags();
  renderHero();
  renderRecommend();
  renderCategoryGrid();
  renderBooks();
  renderHotList();
  renderHistory();
  renderStats();
  renderNotes();
  renderSourceMeta();
  updateSortButtons();
};

const runExternalSearch = async () => {
  const sourceId = els.externalSource.value;
  const query = els.externalQuery.value.trim();
  if (!query) return;
  els.externalSearchBtn.disabled = true;
  els.externalSearchBtn.textContent = "搜索中...";
  try {
    const res = await fetch(`/api/external/search?source=${encodeURIComponent(sourceId)}&q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("外部搜索失败");
    const data = await res.json();
    state.externalResults = data.results || [];
  } catch (err) {
    state.externalResults = [];
  } finally {
    els.externalSearchBtn.disabled = false;
    els.externalSearchBtn.textContent = "开始搜索";
  }
  renderExternalResults();
};

const importExternalBook = async (book) => {
  try {
    const res = await fetch("/api/import/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error("导入失败");
    await fetchLibrary();
    renderAll();
  } catch (err) {
    alert("导入失败，请稍后再试");
  }
};

const submitCreateForm = async (event) => {
  event.preventDefault();
  const payload = {
    title: els.createTitle.value.trim(),
    author: els.createAuthor.value.trim(),
    category: els.createCategory.value,
    tags: els.createTags.value.split(/,|，/).map((tag) => tag.trim()).filter(Boolean),
    description: els.createDescription.value.trim(),
    content: els.createContent.value.trim()
  };
  if (!payload.title || !payload.author) {
    els.createHint.textContent = "书名和作者不能为空";
    return;
  }
  try {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("保存失败");
    els.createHint.textContent = "已保存到书库";
    els.createForm.reset();
    await fetchLibrary();
    renderAll();
  } catch (err) {
    els.createHint.textContent = "保存失败，请确认后端已启动";
  }
};

const init = async () => {
  els.tagList = byId("tagList");
  els.searchInput = byId("searchInput");
  els.clearSearch = byId("clearSearch");
  els.resetFilters = byId("resetFilters");
  els.sidebarStats = byId("sidebarStats");
  els.heroTitle = byId("heroTitle");
  els.heroDesc = byId("heroDesc");
  els.heroCover = byId("heroCover");
  els.heroMeta = byId("heroMeta");
  els.heroRead = byId("heroRead");
  els.heroFavorite = byId("heroFavorite");
  els.recommendDesc = byId("recommendDesc");
  els.recommendGrid = byId("recommendGrid");
  els.categoryGrid = byId("categoryGrid");
  els.resultHint = byId("resultHint");
  els.bookGrid = byId("bookGrid");
  els.hotList = byId("hotList");
  els.historyList = byId("historyList");
  els.noteInput = byId("noteInput");
  els.addNote = byId("addNote");
  els.noteList = byId("noteList");
  els.sourceMeta = byId("sourceMeta");
  els.externalSource = byId("externalSource");
  els.externalQuery = byId("externalQuery");
  els.externalSearchBtn = byId("externalSearchBtn");
  els.externalResults = byId("externalResults");
  els.createForm = byId("createForm");
  els.createTitle = byId("createTitle");
  els.createAuthor = byId("createAuthor");
  els.createCategory = byId("createCategory");
  els.createTags = byId("createTags");
  els.createDescription = byId("createDescription");
  els.createContent = byId("createContent");
  els.createHint = byId("createHint");
  els.globalSearchInput = byId("globalSearchInput");
  els.globalSearchBtn = byId("globalSearchBtn");
  els.scrollCreate = byId("scrollCreate");
  els.apiStatus = byId("apiStatus");

  loadLocalState();

  els.searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    els.globalSearchInput.value = event.target.value;
    renderAll();
  });

  els.globalSearchBtn.addEventListener("click", () => {
    state.searchQuery = els.globalSearchInput.value;
    els.searchInput.value = state.searchQuery;
    renderAll();
  });

  els.globalSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      state.searchQuery = els.globalSearchInput.value;
      els.searchInput.value = state.searchQuery;
      renderAll();
    }
  });

  els.clearSearch.addEventListener("click", () => {
    state.searchQuery = "";
    els.searchInput.value = "";
    els.globalSearchInput.value = "";
    renderAll();
  });

  document.querySelectorAll(".sort-buttons .chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = btn.dataset.sort;
      renderAll();
    });
  });

  els.resetFilters.addEventListener("click", () => {
    state.searchQuery = "";
    state.selectedTags.clear();
    state.selectedCategory = "all";
    els.searchInput.value = "";
    els.globalSearchInput.value = "";
    renderAll();
  });

  els.addNote.addEventListener("click", addNote);
  els.noteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addNote();
  });

  els.externalSearchBtn.addEventListener("click", runExternalSearch);

  els.createForm.addEventListener("submit", submitCreateForm);

  els.scrollCreate.addEventListener("click", () => {
    document.getElementById("createSection").scrollIntoView({ behavior: "smooth" });
  });

  await fetchLibrary();
  await fetchSources();

  els.externalSource.innerHTML = "";
  const enabledSources = state.sources.filter((source) => source.enabled);
  enabledSources.forEach((source) => {
    const option = document.createElement("option");
    option.value = source.id;
    option.textContent = source.name;
    els.externalSource.appendChild(option);
  });
  if (!enabledSources.length) {
    els.externalSearchBtn.disabled = true;
    els.externalSearchBtn.textContent = "无可用书源";
  }

  els.createCategory.innerHTML = "";
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    els.createCategory.appendChild(option);
  });

  renderExternalResults();
  renderAll();
};

document.addEventListener("DOMContentLoaded", init);
