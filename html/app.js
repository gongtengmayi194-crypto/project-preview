const CONFIG = {
  app: {
    name: "书潮",
    tagline: "低代码阅读平台",
    heroBookId: "bk-003",
    recommendSize: 6,
    hotSize: 8,
    historySize: 6,
    noteLimit: 6
  },
  recommendation: {
    tagWeight: 0.6,
    heatWeight: 0.25,
    ratingWeight: 0.25,
    freshWeight: 0.15,
    recentPenalty: 0.35
  },
  categories: [
    { id: "literature", name: "文学", desc: "故事、人物与城市肌理", tone: "#f2c48d" },
    { id: "tech", name: "科技", desc: "工程、算法与未来感", tone: "#9fd4d5" },
    { id: "business", name: "商业", desc: "策略、组织与增长", tone: "#f4b28e" },
    { id: "psych", name: "心理", desc: "情绪、认知与自我", tone: "#f3d6a6" },
    { id: "history", name: "历史", desc: "时间、文明与结构", tone: "#d8c4b1" },
    { id: "design", name: "设计", desc: "形式、体验与美感", tone: "#e8c1b2" }
  ],
  tags: [
    "城市", "成长", "科幻", "产品", "管理", "个人成长", "商业", "历史", "心理",
    "哲思", "设计", "算法", "用户体验", "叙事", "写作", "学习"
  ],
  books: [
    {
      id: "bk-001",
      title: "潮汐图书馆",
      author: "梁初",
      categories: ["literature"],
      tags: ["城市", "成长", "叙事"],
      description: "在不断涨落的海潮之间，一座图书馆连接了三代人的记忆与选择。",
      heat: 92,
      rating: 4.7,
      words: 32,
      readMinutes: 420,
      publish: "2024-08-10",
      cover: "linear-gradient(135deg, #f7b267, #f4845f)",
      highlights: ["关于城市情感的细腻描绘", "多视角叙事，层层递进"]
    },
    {
      id: "bk-002",
      title: "架构即版图",
      author: "顾远舟",
      categories: ["tech"],
      tags: ["算法", "产品", "学习"],
      description: "用系统视角看待技术组织，给出从微服务到协作模式的整体框架。",
      heat: 88,
      rating: 4.6,
      words: 28,
      readMinutes: 360,
      publish: "2025-02-18",
      cover: "linear-gradient(135deg, #90e0ef, #48cae4)",
      highlights: ["技术架构与组织结构的映射", "可落地的演进路线"]
    },
    {
      id: "bk-003",
      title: "微光领导力",
      author: "林澈",
      categories: ["business"],
      tags: ["管理", "个人成长", "商业"],
      description: "聚焦中层与小团队的真实挑战，强调轻量、持续的领导影响力。",
      heat: 95,
      rating: 4.8,
      words: 24,
      readMinutes: 310,
      publish: "2025-09-02",
      cover: "linear-gradient(135deg, #f9c784, #fbbf45)",
      highlights: ["轻量化管理工具箱", "真实案例拆解"]
    },
    {
      id: "bk-004",
      title: "时间褶皱史",
      author: "周祁",
      categories: ["history"],
      tags: ["历史", "叙事", "哲思"],
      description: "以时间褶皱的视角重读文明迁徙，把宏观历史拆成可触摸的片段。",
      heat: 80,
      rating: 4.5,
      words: 36,
      readMinutes: 460,
      publish: "2024-04-20",
      cover: "linear-gradient(135deg, #d9b08c, #b08968)",
      highlights: ["非线性历史叙述", "跨文明视角"]
    },
    {
      id: "bk-005",
      title: "心智弧线",
      author: "程淮",
      categories: ["psych"],
      tags: ["心理", "个人成长", "学习"],
      description: "从注意力到自我效能，拆解心智系统的常见断点与修复方法。",
      heat: 86,
      rating: 4.6,
      words: 22,
      readMinutes: 280,
      publish: "2025-05-12",
      cover: "linear-gradient(135deg, #f3d5b5, #cfe1b9)",
      highlights: ["可操作的心理训练", "认知偏差清单"]
    },
    {
      id: "bk-006",
      title: "设计的气味",
      author: "安澈",
      categories: ["design"],
      tags: ["设计", "用户体验", "产品"],
      description: "以感官类比解构设计语言，强调体验的层次与记忆点。",
      heat: 82,
      rating: 4.4,
      words: 20,
      readMinutes: 260,
      publish: "2024-11-01",
      cover: "linear-gradient(135deg, #ffd6a5, #fdffb6)",
      highlights: ["体验叙事的方法论", "情绪化设计的尺度"]
    },
    {
      id: "bk-007",
      title: "算法的温度",
      author: "白屿",
      categories: ["tech", "design"],
      tags: ["算法", "用户体验", "哲思"],
      description: "讨论算法如何塑造人的体验，并提出更有温度的产品设计策略。",
      heat: 90,
      rating: 4.7,
      words: 26,
      readMinutes: 320,
      publish: "2025-01-22",
      cover: "linear-gradient(135deg, #a2d2ff, #bde0fe)",
      highlights: ["算法伦理与体验设计", "产品策略的平衡点"]
    },
    {
      id: "bk-008",
      title: "偏见与自省",
      author: "顾语",
      categories: ["psych"],
      tags: ["心理", "学习", "哲思"],
      description: "通过20个真实场景揭示认知偏差，并给出可执行的校准方法。",
      heat: 84,
      rating: 4.5,
      words: 18,
      readMinutes: 240,
      publish: "2023-12-10",
      cover: "linear-gradient(135deg, #fbc4ab, #ffcad4)",
      highlights: ["偏差清单与对照练习", "真实场景推演"]
    },
    {
      id: "bk-009",
      title: "手账与宇宙",
      author: "沈尧",
      categories: ["literature", "design"],
      tags: ["写作", "设计", "成长"],
      description: "用图文与片段记录个人生活，把小的日常铺成星图。",
      heat: 76,
      rating: 4.3,
      words: 16,
      readMinutes: 210,
      publish: "2024-06-08",
      cover: "linear-gradient(135deg, #cdb4db, #ffc8dd)",
      highlights: ["碎片化叙事的美感", "生活记录的节奏感"]
    },
    {
      id: "bk-010",
      title: "终身学习地图",
      author: "覃修",
      categories: ["business", "tech"],
      tags: ["学习", "个人成长", "管理"],
      description: "将学习拆解成路线图，从目标、节奏到反馈闭环，构建可持续的学习系统。",
      heat: 91,
      rating: 4.6,
      words: 27,
      readMinutes: 340,
      publish: "2025-07-15",
      cover: "linear-gradient(135deg, #ffd670, #e9ff70)",
      highlights: ["学习系统设计", "适用于团队与个人"]
    },
    {
      id: "bk-011",
      title: "城市地理笔记",
      author: "孟川",
      categories: ["history", "literature"],
      tags: ["城市", "历史", "叙事"],
      description: "以地理为索引，讲述城市更新背后的故事与决策。",
      heat: 79,
      rating: 4.4,
      words: 30,
      readMinutes: 400,
      publish: "2024-02-05",
      cover: "linear-gradient(135deg, #f2e9e4, #c9ada7)",
      highlights: ["城市更新案例", "地图化叙事"]
    },
    {
      id: "bk-012",
      title: "产品叙事",
      author: "罗澄",
      categories: ["business", "design"],
      tags: ["产品", "用户体验", "叙事"],
      description: "从故事结构的角度构建产品体验，让功能具备情境与情感。",
      heat: 87,
      rating: 4.5,
      words: 21,
      readMinutes: 270,
      publish: "2025-03-30",
      cover: "linear-gradient(135deg, #ffd6a5, #fefae0)",
      highlights: ["故事化体验模型", "产品故事板模板"]
    },
    {
      id: "bk-013",
      title: "数据诗学",
      author: "苏远",
      categories: ["tech", "literature"],
      tags: ["算法", "写作", "哲思"],
      description: "在数据与语言之间架桥，探索技术叙事与人文表达的融合。",
      heat: 83,
      rating: 4.4,
      words: 19,
      readMinutes: 250,
      publish: "2024-09-19",
      cover: "linear-gradient(135deg, #b8c0ff, #a0c4ff)",
      highlights: ["数据可视化叙事", "科技与人文交汇"]
    },
    {
      id: "bk-014",
      title: "情绪工程学",
      author: "高闻",
      categories: ["psych", "business"],
      tags: ["心理", "管理", "个人成长"],
      description: "面向团队协作的情绪管理模型，从自我调节到组织氛围的搭建。",
      heat: 85,
      rating: 4.6,
      words: 23,
      readMinutes: 300,
      publish: "2025-06-05",
      cover: "linear-gradient(135deg, #fec5bb, #fcd5ce)",
      highlights: ["情绪协作框架", "团队心理安全感"]
    }
  ]
};

const STORAGE_KEY = "codex_reader_state_v1";

const state = {
  searchQuery: "",
  selectedTags: new Set(),
  selectedCategory: "all",
  sort: "smart",
  favorites: new Set(),
  history: [],
  progress: {},
  tagAffinity: {},
  notes: []
};

const els = {};
let activeBookId = null;

const byId = (id) => document.getElementById(id);
const formatNumber = (num) => (Number.isFinite(num) ? num : 0);

const daysSince = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 365;
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, diff);
};

const getBookById = (id) => CONFIG.books.find((book) => book.id === id);

const loadState = () => {
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

const saveState = () => {
  const payload = {
    favorites: Array.from(state.favorites),
    history: state.history,
    progress: state.progress,
    tagAffinity: state.tagAffinity,
    notes: state.notes
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const getSmartScore = (book) => {
  const cfg = CONFIG.recommendation;
  const heat = formatNumber(book.heat) / 100;
  const rating = formatNumber(book.rating) / 5;
  const fresh = Math.max(0, 1 - daysSince(book.publish) / 365);
  const tagScore = (book.tags || []).reduce((sum, tag) => sum + (state.tagAffinity[tag] || 0), 0);
  const selectBoost = (book.tags || []).some((tag) => state.selectedTags.has(tag)) ? 0.4 : 0;
  const favoriteBoost = state.favorites.has(book.id) ? 0.35 : 0;
  const recentPenalty = state.history.includes(book.id) ? cfg.recentPenalty : 0;
  return (
    tagScore * cfg.tagWeight +
    heat * cfg.heatWeight +
    rating * cfg.ratingWeight +
    fresh * cfg.freshWeight +
    selectBoost +
    favoriteBoost -
    recentPenalty
  );
};

const getFilteredBooks = () => {
  const query = state.searchQuery.trim().toLowerCase();
  return CONFIG.books.filter((book) => {
    const matchesCategory =
      state.selectedCategory === "all" || book.categories.includes(state.selectedCategory);
    const matchesTags =
      state.selectedTags.size === 0 ||
      Array.from(state.selectedTags).every((tag) => book.tags.includes(tag));
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
    return list.sort((a, b) => b.heat - a.heat);
  }
  if (state.sort === "rating") {
    return list.sort((a, b) => b.rating - a.rating);
  }
  if (state.sort === "newest") {
    return list.sort((a, b) => new Date(b.publish) - new Date(a.publish));
  }
  return list.sort((a, b) => getSmartScore(b) - getSmartScore(a));
};

const getRecommendList = () => {
  const list = getFilteredBooks();
  return sortBooks(list).slice(0, CONFIG.app.recommendSize);
};

const updateAffinity = (book) => {
  (book.tags || []).forEach((tag) => {
    state.tagAffinity[tag] = (state.tagAffinity[tag] || 0) + 0.25;
  });
};

const updateHistory = (bookId) => {
  state.history = [bookId, ...state.history.filter((id) => id !== bookId)].slice(0, CONFIG.app.historySize);
};

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
  cover.style.background = book.cover;
  const badge = document.createElement("span");
  badge.textContent = `${book.heat} 热度`;
  cover.appendChild(badge);

  const title = document.createElement("div");
  title.className = "book-title";
  title.textContent = book.title;

  const meta = document.createElement("div");
  meta.className = "book-meta";
  meta.textContent = `${book.author} · ${book.rating} 分`;

  const desc = document.createElement("div");
  desc.className = "book-meta";
  desc.textContent = book.description;

  const actionRow = document.createElement("div");
  actionRow.className = "book-actions";

  const readBtn = document.createElement("button");
  readBtn.className = "btn ghost";
  readBtn.textContent = "详情";
  readBtn.addEventListener("click", () => openModal(book.id));

  const favBtn = document.createElement("button");
  favBtn.className = "btn primary";
  favBtn.textContent = state.favorites.has(book.id) ? "已收藏" : "收藏";
  favBtn.addEventListener("click", () => toggleFavorite(book.id));

  actionRow.append(readBtn, favBtn);

  card.append(cover, title, meta, desc, actionRow);
  return card;
};

const renderTags = () => {
  els.tagList.innerHTML = "";
  CONFIG.tags.forEach((tag) => {
    els.tagList.appendChild(buildTag(tag));
  });
};

const renderHero = () => {
  const heroBook = getBookById(CONFIG.app.heroBookId) || sortBooks(CONFIG.books)[0];
  if (!heroBook) return;
  els.heroTitle.textContent = heroBook.title;
  els.heroDesc.textContent = heroBook.description;
  els.heroCover.style.background = heroBook.cover;
  els.heroMeta.textContent = `${heroBook.author} · ${heroBook.rating} 分 · ${heroBook.words} 万字`;
  els.heroRead.onclick = () => openModal(heroBook.id);
  els.heroFavorite.onclick = () => toggleFavorite(heroBook.id);
};

const renderRecommend = () => {
  const list = getRecommendList();
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
  CONFIG.categories.forEach((category) => {
    const count = CONFIG.books.filter((book) => book.categories.includes(category.id)).length;
    const card = document.createElement("div");
    card.className = "category-card";
    card.style.background = `linear-gradient(135deg, #fff7ee, ${category.tone})`;
    card.innerHTML = `
      <strong>${category.name}</strong>
      <div class="book-meta">${category.desc}</div>
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
    state.selectedCategory === "all"
      ? "全部"
      : CONFIG.categories.find((c) => c.id === state.selectedCategory)?.name || "";
  const queryPart = state.searchQuery ? `关键词：${state.searchQuery}` : "";
  const hintParts = [categoryName, tagPart, queryPart].filter(Boolean).join(" · ");
  els.resultHint.textContent = hintParts ? `${hintParts} · 共 ${filtered.length} 本` : `共 ${filtered.length} 本书`;

  els.bookGrid.innerHTML = "";
  filtered.forEach((book, index) => {
    els.bookGrid.appendChild(buildBookCard(book, index));
  });
};

const renderHotList = () => {
  const list = [...CONFIG.books].sort((a, b) => b.heat - a.heat).slice(0, CONFIG.app.hotSize);
  els.hotList.innerHTML = "";
  list.forEach((book, index) => {
    const item = document.createElement("div");
    item.className = "rank-item";
    item.innerHTML = `
      <div><strong>#${index + 1} ${book.title}</strong></div>
      <div class="book-meta">${book.author} · 热度 ${book.heat}</div>
    `;
    item.addEventListener("click", () => openModal(book.id));
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
    const book = getBookById(id);
    if (!book) return;
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div><strong>${book.title}</strong></div>
      <div class="book-meta">${book.author} · ${state.progress[id] || 0}%</div>
    `;
    item.addEventListener("click", () => openModal(book.id));
    els.historyList.appendChild(item);
  });
};

const renderStats = () => {
  const avgProgress = Object.values(state.progress).reduce((sum, val) => sum + val, 0);
  const progressCount = Object.keys(state.progress).length || 1;
  const avgValue = Math.round(avgProgress / progressCount);
  els.sidebarStats.innerHTML = `
    <div>馆藏：${CONFIG.books.length} 本</div>
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

const openModal = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return;
  activeBookId = bookId;
  updateHistory(bookId);
  updateAffinity(book);

  els.modalCover.style.background = book.cover;
  els.modalTitle.textContent = book.title;
  els.modalMeta.textContent = `${book.author} · ${book.rating} 分 · ${book.words} 万字`;
  els.modalDesc.textContent = book.description;
  els.modalTags.innerHTML = "";
  book.tags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tag";
    chip.textContent = tag;
    els.modalTags.appendChild(chip);
  });
  els.modalHighlights.innerHTML = "";
  book.highlights.forEach((text) => {
    const item = document.createElement("div");
    item.className = "highlight";
    item.textContent = text;
    els.modalHighlights.appendChild(item);
  });

  const progressValue = state.progress[bookId] || 0;
  els.progressRange.value = progressValue;
  els.progressValue.textContent = `${progressValue}%`;
  els.modalFavorite.textContent = state.favorites.has(bookId) ? "已收藏" : "加入收藏";

  els.bookModal.classList.add("show");
  els.bookModal.setAttribute("aria-hidden", "false");
  saveState();
  renderHistory();
  renderStats();
  renderRecommend();
};

const closeModal = () => {
  els.bookModal.classList.remove("show");
  els.bookModal.setAttribute("aria-hidden", "true");
  activeBookId = null;
};

const toggleFavorite = (bookId) => {
  if (state.favorites.has(bookId)) {
    state.favorites.delete(bookId);
  } else {
    state.favorites.add(bookId);
  }
  saveState();
  renderStats();
  renderRecommend();
  renderBooks();
  renderHero();
  if (activeBookId === bookId) {
    els.modalFavorite.textContent = state.favorites.has(bookId) ? "已收藏" : "加入收藏";
  }
};

const resetFilters = () => {
  state.searchQuery = "";
  state.selectedTags.clear();
  state.selectedCategory = "all";
  renderAll();
};

const addNote = () => {
  const text = els.noteInput.value.trim();
  if (!text) return;
  const time = new Date().toLocaleString("zh-CN", { hour12: false });
  state.notes = [{ text, time }, ...state.notes].slice(0, CONFIG.app.noteLimit);
  els.noteInput.value = "";
  saveState();
  renderNotes();
};

const removeNote = (index) => {
  state.notes.splice(index, 1);
  saveState();
  renderNotes();
};

const renderConfigPreview = () => {
  const clone = JSON.parse(JSON.stringify(CONFIG));
  els.configPreview.textContent = JSON.stringify(clone, null, 2);
};

const copyConfig = async () => {
  const text = els.configPreview.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    els.copyConfig.textContent = "已复制";
    setTimeout(() => {
      els.copyConfig.textContent = "复制配置 JSON";
    }, 1500);
  } catch (err) {
    console.warn("复制失败", err);
    els.copyConfig.textContent = "请手动复制";
  }
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
  renderConfigPreview();
  updateSortButtons();
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

const init = () => {
  els.tagList = byId("tagList");
  els.searchInput = byId("searchInput");
  els.clearSearch = byId("clearSearch");
  els.resetFilters = byId("resetFilters");
  els.openConfig = byId("openConfig");
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
  els.bookModal = byId("bookModal");
  els.modalCover = byId("modalCover");
  els.modalTitle = byId("modalTitle");
  els.modalMeta = byId("modalMeta");
  els.modalDesc = byId("modalDesc");
  els.modalTags = byId("modalTags");
  els.modalFavorite = byId("modalFavorite");
  els.modalRead = byId("modalRead");
  els.progressRange = byId("progressRange");
  els.progressValue = byId("progressValue");
  els.modalHighlights = byId("modalHighlights");
  els.configDrawer = byId("configDrawer");
  els.configPreview = byId("configPreview");
  els.copyConfig = byId("copyConfig");
  els.closeConfig = byId("closeConfig");

  loadState();

  els.searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    renderAll();
  });

  els.clearSearch.addEventListener("click", () => {
    state.searchQuery = "";
    els.searchInput.value = "";
    renderAll();
  });

  document.querySelectorAll(".sort-buttons .chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = btn.dataset.sort;
      renderAll();
    });
  });

  els.resetFilters.addEventListener("click", resetFilters);

  els.addNote.addEventListener("click", addNote);
  els.noteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addNote();
  });

  els.openConfig.addEventListener("click", () => {
    els.configDrawer.classList.add("show");
    els.configDrawer.setAttribute("aria-hidden", "false");
  });

  els.closeConfig.addEventListener("click", () => {
    els.configDrawer.classList.remove("show");
    els.configDrawer.setAttribute("aria-hidden", "true");
  });

  els.copyConfig.addEventListener("click", copyConfig);

  els.bookModal.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true") {
      closeModal();
    }
  });

  els.configDrawer.addEventListener("click", (event) => {
    if (event.target.dataset.close === "true") {
      els.configDrawer.classList.remove("show");
      els.configDrawer.setAttribute("aria-hidden", "true");
    }
  });

  els.modalFavorite.addEventListener("click", () => {
    if (activeBookId) toggleFavorite(activeBookId);
  });

  els.modalRead.addEventListener("click", () => {
    if (!activeBookId) return;
    state.progress[activeBookId] = 100;
    els.progressRange.value = 100;
    els.progressValue.textContent = "100%";
    saveState();
    renderHistory();
    renderStats();
  });

  els.progressRange.addEventListener("input", (event) => {
    if (!activeBookId) return;
    const value = Number(event.target.value);
    state.progress[activeBookId] = value;
    els.progressValue.textContent = `${value}%`;
    saveState();
    renderHistory();
    renderStats();
  });

  renderAll();
};

document.addEventListener("DOMContentLoaded", init);
