(() => {
  "use strict";

  const DEFAULT_CONNECTION = {
    owner: "guo-yuxuan",
    repository: "guo-yuxuan.github.io",
    branch: "main"
  };

  const SESSION_KEY = "yuxuan-site-admin-session-v1";
  const GITHUB_API = "https://api.github.com";
  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
  const COLLECTIONS = {
    publications: { label: "论文成果", singular: "论文", prefix: "_publications/", icon: "◈" },
    projects: { label: "项目作品", singular: "项目", prefix: "_projects/", icon: "▣" },
    news: { label: "新闻动态", singular: "新闻", prefix: "_news/", icon: "◷" }
  };

  const NAVIGATION = [
    { id: "overview", label: "概览", icon: "▦" },
    { id: "profile", label: "个人资料", icon: "◎" },
    { id: "publications", label: "论文成果", icon: "◈" },
    { id: "projects", label: "项目作品", icon: "▣" },
    { id: "news", label: "新闻动态", icon: "◷" },
    { id: "media", label: "图片与文件", icon: "▧" },
    { id: "history", label: "版本记录", icon: "↺" }
  ];

  const state = {
    session: null,
    page: "overview",
    loading: false,
    loginError: "",
    files: new Map(),
    tree: [],
    collections: { publications: [], projects: [], news: [] },
    profile: null,
    display: null,
    history: [],
    historyLoaded: false,
    search: "",
    projectFilter: "all",
    editor: null,
    uploadResult: ""
  };

  const application = document.getElementById("application");
  const modalRoot = document.getElementById("modal-root");
  const notifications = document.getElementById("notifications");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function encodeBase64(bytes) {
    const chunks = [];
    for (let offset = 0; offset < bytes.length; offset += 8192) {
      chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
    }
    return btoa(chunks.join(""));
  }

  function encodeText(content) {
    return encodeBase64(new TextEncoder().encode(content));
  }

  function decodeText(content) {
    const binary = atob(content.replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function slugify(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "untitled";
  }

  function formatNow() {
    const date = new Date();
    const pad = (number) => String(number).padStart(2, "0");
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const zone = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}${pad(Math.abs(offset) % 60)}`;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${zone}`;
  }

  function yearFromDate(value) {
    return String(value ?? "").match(/\b(19|20)\d{2}\b/)?.[0] || String(new Date().getFullYear());
  }

  function dateTimestamp(value) {
    const match = String(value ?? "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return 0;
    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  function formatDate(value) {
    const match = String(value ?? "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    return match ? `${match[1]}.${match[2].padStart(2, "0")}.${match[3].padStart(2, "0")}` : String(value || "未设置日期");
  }

  function compareValues(left, right) {
    if (left === right) return true;
    if (left == null || right == null) return left == null && right == null;
    if (Array.isArray(left) || Array.isArray(right)) {
      return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => compareValues(value, right[index]));
    }
    if (typeof left === "object" && typeof right === "object") {
      const leftKeys = Object.keys(left).sort();
      const rightKeys = Object.keys(right).sort();
      return compareValues(leftKeys, rightKeys) && leftKeys.every((key) => compareValues(left[key], right[key]));
    }
    return false;
  }

  function stripInlineComment(value) {
    let quote = "";
    let escaped = false;
    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];
      if (escaped) {
        escaped = false;
      } else if (character === "\\" && quote === '"') {
        escaped = true;
      } else if (quote && character === quote) {
        if (quote === "'" && value[index + 1] === "'") {
          index += 1;
        } else {
          quote = "";
        }
      } else if (!quote && (character === '"' || character === "'")) {
        quote = character;
      } else if (!quote && character === "#" && (index === 0 || /\s/.test(value[index - 1]))) {
        return { value: value.slice(0, index).trimEnd(), comment: value.slice(index) };
      }
    }
    return { value: value.trimEnd(), comment: "" };
  }

  function parseScalar(rawValue) {
    const value = stripInlineComment(String(rawValue ?? "")).value.trim();
    if (!value || value === "null" || value === "~") return "";
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "[]") return [];
    if (value === "{}") return {};
    if (value.startsWith('"') && value.endsWith('"')) {
      const normalized = value.replace(/\r?\n\s*/g, " ");
      try {
        return JSON.parse(normalized);
      } catch {
        return normalized.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/''/g, "'");
    }
    return value;
  }

  function getYamlEntry(source, key) {
    const expression = new RegExp(`^${escapeRegExp(key)}[\\t ]*:[\\t ]*(.*)$`, "m");
    const match = expression.exec(source);
    if (!match) return null;

    const lineEnd = source.indexOf("\n", match.index);
    const contentEnd = lineEnd === -1 ? source.length : lineEnd + 1;
    const following = source.slice(contentEnd);
    const nextEntry = /^[A-Za-z_][\w-]*[\t ]*:/m.exec(following);
    const limit = nextEntry ? contentEnd + nextEntry.index : source.length;
    const firstValue = match[1];

    let end = contentEnd;
    let openQuote = "";
    const trimmed = stripInlineComment(firstValue).value.trim();
    if ((trimmed.startsWith('"') && !trimmed.endsWith('"')) || (trimmed.startsWith("'") && !trimmed.endsWith("'"))) {
      openQuote = trimmed[0];
    }

    while (end < limit) {
      const nextLineEnd = source.indexOf("\n", end);
      const lineLimit = nextLineEnd === -1 || nextLineEnd >= limit ? limit : nextLineEnd + 1;
      const line = source.slice(end, lineLimit);
      if (openQuote) {
        end = lineLimit;
        if (line.trimEnd().endsWith(openQuote)) openQuote = "";
        continue;
      }
      if (/^[\t ]+\S/.test(line) || !line.trim()) {
        end = lineLimit;
        continue;
      }
      break;
    }

    return { key, firstValue, start: match.index, end, valueEnd: limit, raw: source.slice(match.index, end) };
  }

  function blockLines(entry) {
    if (!entry) return [];
    return entry.raw.split("\n").slice(1).filter((line) => /^\s+\S/.test(line));
  }

  function readField(source, key) {
    const entry = getYamlEntry(source, key);
    if (!entry) return undefined;
    const first = stripInlineComment(entry.firstValue).value.trim();

    if (/^[>|][+-]?\d*$/.test(first)) {
      const lines = entry.raw.split("\n").slice(1);
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      const indentationLevels = lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length);
      const indentation = indentationLevels.length ? Math.min(...indentationLevels) : 0;
      return lines.map((line) => line.slice(indentation)).join("\n");
    }

    if (!first) {
      const lines = blockLines(entry);
      if (lines.some((line) => /^\s+-\s+/.test(line))) return parseList(entry);
      if (lines.some((line) => /^\s+(?:"[^"]+"|'[^']+'|[\w-]+)\s*:/.test(line))) return parseMap(entry);
      return "";
    }

    if ((first.startsWith('"') && !first.endsWith('"')) || (first.startsWith("'") && !first.endsWith("'"))) {
      return parseScalar(entry.raw.slice(entry.raw.indexOf(":") + 1));
    }

    return parseScalar(first);
  }

  function parseList(entry) {
    const lines = entry.raw.split("\n").slice(1);
    const items = [];
    for (let index = 0; index < lines.length; index += 1) {
      const itemMatch = /^\s{2,}-\s*(.*)$/.exec(lines[index]);
      if (!itemMatch) continue;
      const objectMatch = /^([\w-]+)\s*:\s*(.*)$/.exec(itemMatch[1]);
      if (!objectMatch) {
        items.push(parseScalar(itemMatch[1]));
        continue;
      }

      const item = { [objectMatch[1]]: parseScalar(objectMatch[2]) };
      while (index + 1 < lines.length && !/^\s{2,}-\s*/.test(lines[index + 1])) {
        index += 1;
        const property = /^\s{4}([\w-]+)\s*:\s*(.*)$/.exec(lines[index]);
        if (!property) continue;
        if (/^[>|][+-]?$/.test(property[2].trim())) {
          const nested = [];
          while (index + 1 < lines.length && (/^\s{6}/.test(lines[index + 1]) || !lines[index + 1].trim())) {
            index += 1;
            nested.push(lines[index].replace(/^\s{6}/, ""));
          }
          while (nested.length && !nested[nested.length - 1].trim()) nested.pop();
          item[property[1]] = nested.join("\n");
        } else {
          item[property[1]] = parseScalar(property[2]);
        }
      }
      items.push(item);
    }
    return items;
  }

  function parseMap(entry) {
    const result = {};
    for (const line of entry.raw.split("\n").slice(1)) {
      const match = /^\s{2}([^:#][^:]*?)\s*:\s*(.*)$/.exec(line);
      if (match) result[parseScalar(match[1])] = parseScalar(match[2]);
    }
    return result;
  }

  function quoteScalar(value) {
    return JSON.stringify(String(value ?? ""));
  }

  function serializeField(key, value) {
    if (typeof value === "boolean") return `${key}: ${value}\n`;
    if (typeof value === "number") return `${key}: ${value}\n`;

    if (Array.isArray(value)) {
      if (!value.length) return `${key}: []\n`;
      const lines = [`${key}:`];
      for (const item of value) {
        if (item && typeof item === "object") {
          const entries = Object.entries(item).filter(([, itemValue]) => itemValue !== "" && itemValue != null);
          if (!entries.length) continue;
          entries.forEach(([itemKey, itemValue], index) => {
            const prefix = index === 0 ? `  - ${itemKey}:` : `    ${itemKey}:`;
            if (String(itemValue).includes("\n")) {
              lines.push(`${prefix} |-`);
              lines.push(...String(itemValue).split("\n").map((line) => `      ${line}`));
            } else {
              lines.push(`${prefix} ${quoteScalar(itemValue)}`);
            }
          });
        } else {
          lines.push(`  - ${quoteScalar(item)}`);
        }
      }
      return `${lines.join("\n")}\n`;
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value).filter(([, itemValue]) => itemValue !== "" && itemValue != null);
      if (!entries.length) return `${key}: {}\n`;
      return `${key}:\n${entries.map(([mapKey, mapValue]) => `  ${quoteScalar(mapKey)}: ${quoteScalar(mapValue)}`).join("\n")}\n`;
    }

    const text = String(value ?? "");
    if (text.includes("\n")) return `${key}: |-\n${text.split("\n").map((line) => `  ${line}`).join("\n")}\n`;
    return `${key}: ${quoteScalar(text)}\n`;
  }

  function patchField(source, key, value) {
    const entry = getYamlEntry(source, key);
    const replacement = serializeField(key, value);
    if (!entry) return `${source}${source && !source.endsWith("\n") ? "\n" : ""}${replacement}`;

    let suffix = "";
    const originalFirst = entry.raw.split("\n")[0];
    const inlineComment = stripInlineComment(originalFirst.slice(originalFirst.indexOf(":") + 1)).comment;
    if (inlineComment && !replacement.includes("\n", 0 + replacement.indexOf("\n") + 1)) {
      suffix = ` ${inlineComment}`;
    }
    const normalized = suffix ? replacement.replace(/\n$/, `${suffix}\n`) : replacement;
    return `${source.slice(0, entry.start)}${normalized}${source.slice(entry.end)}`;
  }

  function splitFrontMatter(source) {
    const match = /^---\s*\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/.exec(source);
    if (!match) return null;
    return { yaml: `${match[1]}\n`, body: source.slice(match[0].length) };
  }

  function joinFrontMatter(yaml, body) {
    const content = yaml.endsWith("\n") ? yaml : `${yaml}\n`;
    return `---\n${content}---\n${body || ""}`;
  }

  function readDocument(source) {
    const parts = splitFrontMatter(source);
    if (!parts) return null;
    const keys = [
      "title", "date", "selected", "description", "pub", "pub_pre", "pub_post", "pub_last", "pub_date",
      "cover", "authors", "authors_with_affiliations", "links", "abstract", "has_blog", "blog_url",
      "layout", "is_blog_page", "card_layout", "show_date", "show_reading_time", "show_authors", "show_affiliations"
    ];
    const data = Object.fromEntries(keys.map((key) => [key, readField(parts.yaml, key)]));
    return { ...parts, data };
  }

  function readProfile(source) {
    const keys = [
      "primary_name", "secondary_name", "navbar_name", "email", "cv_link", "gscholar", "github", "twitter",
      "linkedin", "orcid", "short_bio_text_justify", "short_bio", "portrait_url", "education", "experience", "awards"
    ];
    return Object.fromEntries(keys.map((key) => [key, readField(source, key)]));
  }

  function readDisplay(source) {
    const homepage = getYamlEntry(source, "homepage");
    const values = homepage ? parseMap(homepage) : {};
    return { homepage: values, footer_text: readField(source, "footer_text") };
  }

  function notify(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    notifications.appendChild(toast);
    window.setTimeout(() => toast.remove(), type === "error" ? 7000 : 4300);
  }

  function saveSession(session) {
    state.session = session;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    state.session = null;
    state.files.clear();
    state.tree = [];
    state.collections = { publications: [], projects: [], news: [] };
    state.profile = null;
    state.display = null;
    state.history = [];
    state.historyLoaded = false;
    closeEditor();
    render();
  }

  function restoreSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      return session?.token && session.owner && session.repository && session.branch ? session : null;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function repoApiPath(suffix) {
    return `/repos/${encodeURIComponent(state.session.owner)}/${encodeURIComponent(state.session.repository)}${suffix}`;
  }

  async function githubRequest(path, options = {}) {
    const response = await fetch(`${GITHUB_API}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${state.session.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {})
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });

    const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error("GitHub 令牌无效或已经过期，请重新登录。");
      if (response.status === 403) throw new Error("GitHub 拒绝访问，请确认令牌对这个仓库拥有 Contents 的读写权限。");
      if (response.status === 404) throw new Error("找不到仓库、分支或文件，请检查仓库设置和令牌权限。");
      if (response.status === 409) throw new Error("文件刚刚被其他操作修改，请刷新数据后重新保存。");
      if (response.status === 422) throw new Error(`GitHub 无法处理这次修改：${payload.message || "请检查文件路径和内容。"}`);
      throw new Error(payload.message || `GitHub API 请求失败：${response.status}`);
    }
    return payload;
  }

  async function readRepositoryFile(path, force = false) {
    if (!force && state.files.has(path)) return state.files.get(path);
    const result = await githubRequest(repoApiPath(`/contents/${encodePath(path)}?ref=${encodeURIComponent(state.session.branch)}`));
    if (Array.isArray(result) || result.encoding !== "base64") throw new Error(`无法读取文件 ${path}。`);
    const file = { path, sha: result.sha, content: decodeText(result.content) };
    state.files.set(path, file);
    return file;
  }

  async function writeRepositoryFile(path, content, message, existingSha) {
    const body = { message, content: encodeText(content), branch: state.session.branch };
    if (existingSha) body.sha = existingSha;
    const result = await githubRequest(repoApiPath(`/contents/${encodePath(path)}`), { method: "PUT", body });
    state.files.set(path, { path, sha: result.content.sha, content });
    state.historyLoaded = false;
    return result;
  }

  async function writeBinaryFile(path, bytes, message, existingSha) {
    const body = { message, content: encodeBase64(bytes), branch: state.session.branch };
    if (existingSha) body.sha = existingSha;
    const result = await githubRequest(repoApiPath(`/contents/${encodePath(path)}`), { method: "PUT", body });
    state.historyLoaded = false;
    return result;
  }

  async function deleteRepositoryFile(path, sha) {
    await githubRequest(repoApiPath(`/contents/${encodePath(path)}`), {
      method: "DELETE",
      body: { message: `admin: 删除 ${path}`, sha, branch: state.session.branch }
    });
    state.files.delete(path);
    state.historyLoaded = false;
  }

  function itemFromFile(file, collection) {
    const parsed = readDocument(file.content);
    if (!parsed?.data.title) return null;
    return { path: file.path, sha: file.sha, collection, ...parsed };
  }

  async function loadRepository({ showLoading = true } = {}) {
    if (showLoading) {
      state.loading = true;
      render();
    }

    try {
      const tree = await githubRequest(repoApiPath(`/git/trees/${encodeURIComponent(state.session.branch)}?recursive=1`));
      if (tree.truncated) throw new Error("仓库文件数量超出 GitHub 单次目录读取限制，请联系开发者调整读取方式。");
      state.tree = tree.tree.filter((entry) => entry.type === "blob");
      const paths = state.tree
        .filter((entry) => Object.values(COLLECTIONS).some(({ prefix }) => entry.path.startsWith(prefix)) && entry.path.endsWith(".md"))
        .map((entry) => entry.path);

      const requiredPaths = ["_data/profile.yml", "_data/display.yml"];
      const files = await Promise.all([...requiredPaths, ...paths].map((path) => readRepositoryFile(path)));
      state.profile = { file: files[0], data: readProfile(files[0].content) };
      state.display = { file: files[1], data: readDisplay(files[1].content) };

      for (const [id, definition] of Object.entries(COLLECTIONS)) {
        state.collections[id] = files.slice(requiredPaths.length)
          .filter((file) => file.path.startsWith(definition.prefix))
          .map((file) => itemFromFile(file, id))
          .filter(Boolean)
          .sort((left, right) => dateTimestamp(right.data.date) - dateTimestamp(left.data.date) || left.data.title.localeCompare(right.data.title));
      }
    } finally {
      state.loading = false;
      render();
    }
  }

  function checked(value) {
    return value ? "checked" : "";
  }

  function fieldMarkup({ name, label, value = "", hint = "", type = "text", placeholder = "", required = false, rows = 0, id = "" }) {
    const identifier = id || `field-${name}`;
    const attributes = `id="${escapeHtml(identifier)}" name="${escapeHtml(name)}" ${required ? "required" : ""} placeholder="${escapeHtml(placeholder)}"`;
    const input = rows
      ? `<textarea ${attributes} rows="${rows}">\n${escapeHtml(value)}</textarea>`
      : `<input ${attributes} type="${escapeHtml(type)}" value="${escapeHtml(value)}">`;
    return `<div class="field"><label for="${escapeHtml(identifier)}">${escapeHtml(label)}</label>${input}${hint ? `<p class="field-hint">${escapeHtml(hint)}</p>` : ""}</div>`;
  }

  function checkboxMarkup(name, label, value) {
    return `<label class="checkbox-label"><input type="checkbox" name="${escapeHtml(name)}" ${checked(value)}> ${escapeHtml(label)}</label>`;
  }

  function loginMarkup() {
    const connection = DEFAULT_CONNECTION;
    return `<main class="login-page"><section class="login-card">
      <p class="eyebrow">Personal website studio</p>
      <h1>网站管理后台</h1>
      <p class="supporting-copy">使用 GitHub 令牌管理你的学术主页，无须部署额外服务器。</p>
      <form id="login-form" class="login-form">
        ${fieldMarkup({ name: "token", label: "GitHub Personal Access Token", type: "password", placeholder: "github_pat_…", required: true, hint: "令牌只存放在当前标签页的会话中，不会写入仓库。" })}
        <div class="field-grid">
          ${fieldMarkup({ name: "owner", label: "GitHub 用户名", value: connection.owner, required: true })}
          ${fieldMarkup({ name: "branch", label: "发布分支", value: connection.branch, required: true })}
        </div>
        ${fieldMarkup({ name: "repository", label: "仓库名称", value: connection.repository, required: true })}
        ${state.loginError ? `<div class="notice notice-error">${escapeHtml(state.loginError)}</div>` : ""}
        <button class="button button-primary button-wide" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? "正在连接 GitHub…" : "连接并进入后台"}</button>
      </form>
      <p class="login-footnote">首次使用？<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">创建 Fine-grained Token</a>，将仓库权限中的 <strong>Contents</strong> 设置为 <strong>Read and write</strong>。</p>
    </section></main>`;
  }

  function navigationMarkup() {
    return NAVIGATION.map((item) => {
      const count = state.collections[item.id]?.length;
      return `<button class="nav-button ${state.page === item.id ? "is-active" : ""}" type="button" data-action="navigate" data-page="${item.id}">
        <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>${count == null ? "" : `<span class="nav-count">${count}</span>`}
      </button>`;
    }).join("");
  }

  function dashboardMarkup() {
    return `<div class="dashboard">
      <aside class="sidebar">
        <div class="brand"><span class="brand-title">Yuxuan Studio</span><span class="brand-subtitle">个人网站内容管理</span></div>
        <nav class="navigation" aria-label="后台导航">${navigationMarkup()}</nav>
        <div class="sidebar-footer">
          <span class="connection-label">${escapeHtml(state.session.owner)}/${escapeHtml(state.session.repository)} · ${escapeHtml(state.session.branch)}</span>
          <a class="button button-ghost button-small" href="/" target="_blank" rel="noopener noreferrer">查看网站 ↗</a>
          <button class="button button-ghost button-small" type="button" data-action="refresh">刷新数据</button>
          <button class="button button-ghost button-small" type="button" data-action="logout">退出登录</button>
        </div>
      </aside>
      <main class="main-content">${state.loading ? `<div class="loading-panel"><span class="spinner" aria-hidden="true"></span><span>正在读取 GitHub 仓库…</span></div>` : pageMarkup()}</main>
    </div>`;
  }

  function pageHeading(title, description, actions = "") {
    return `<header class="page-heading"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</header>`;
  }

  function pageMarkup() {
    if (!state.profile || !state.display) return `<div class="loading-panel"><span class="spinner"></span></div>`;
    switch (state.page) {
      case "profile": return profileMarkup();
      case "publications":
      case "projects":
      case "news": return collectionMarkup(state.page);
      case "media": return mediaMarkup();
      case "history": return historyMarkup();
      default: return overviewMarkup();
    }
  }

  function render() {
    application.innerHTML = state.session ? dashboardMarkup() : loginMarkup();
  }

  function overviewMarkup() {
    const cards = state.collections.projects.filter((item) => !isProjectDetail(item));
    const details = state.collections.projects.filter(isProjectDetail);
    const latest = [...state.collections.publications, ...cards, ...state.collections.news]
      .sort((left, right) => dateTimestamp(right.data.date) - dateTimestamp(left.data.date))
      .slice(0, 6);

    const stats = [
      { label: "论文成果", value: state.collections.publications.length, note: `${state.collections.publications.filter((item) => item.data.selected).length} 篇在首页展示` },
      { label: "项目卡片", value: cards.length, note: `${cards.filter((item) => item.data.selected).length} 个在首页展示` },
      { label: "项目详情页", value: details.length, note: "现有页面布局保持不变" },
      { label: "新闻动态", value: state.collections.news.length, note: state.display.data.homepage.show_news ? "首页栏目已开启" : "首页栏目目前隐藏" }
    ];

    return `${pageHeading("欢迎回来", "所有修改都会直接保存到 GitHub，并保留完整版本历史。")}
      <section class="stats-grid">${stats.map((item) => `<article class="card stat-card"><span class="stat-label">${item.label}</span><strong class="stat-value">${item.value}</strong><span class="stat-note">${escapeHtml(item.note)}</span></article>`).join("")}</section>
      <div class="overview-grid">
        <section class="card"><div class="card-header"><div><h2 class="card-title">最近内容</h2><p class="card-description">按照内容发布日期排列</p></div></div>
          <div class="recent-list">${latest.length ? latest.map((item) => `<div class="recent-item"><span class="recent-title">${escapeHtml(item.data.title)}</span><span class="recent-meta">${COLLECTIONS[item.collection].singular} · ${formatDate(item.data.date)}</span></div>`).join("") : emptyState("还没有内容", "可以从右侧快捷操作开始。")}</div>
        </section>
        <section class="card"><div class="card-header"><div><h2 class="card-title">快捷操作</h2><p class="card-description">新增内容不会改变原有网站模板</p></div></div>
          <div class="quick-actions">
            <button class="quick-action" type="button" data-action="new-item" data-collection="publications"><span>新增论文成果</span><span>→</span></button>
            <button class="quick-action" type="button" data-action="new-item" data-collection="projects"><span>新增项目作品</span><span>→</span></button>
            <button class="quick-action" type="button" data-action="navigate" data-page="profile"><span>修改个人简介</span><span>→</span></button>
            <button class="quick-action" type="button" data-action="navigate" data-page="media"><span>上传图片或 PDF</span><span>→</span></button>
          </div>
        </section>
      </div>`;
  }

  function repeaterMarkup(name, title, items, fields) {
    const entries = Array.isArray(items) ? items : [];
    return `<section class="form-section" data-repeater="${name}">
      <div class="card-header"><h3 class="form-section-title">${escapeHtml(title)}</h3><button class="button button-secondary button-small" type="button" data-action="add-repeat" data-repeater-name="${name}">添加一项</button></div>
      <div class="repeater">${entries.map((item, index) => repeaterItemMarkup(name, index, item, fields)).join("")}</div>
    </section>`;
  }

  function repeaterItemMarkup(name, index, item, fields) {
    return `<div class="repeater-item" data-repeat-item="${name}" data-repeat-index="${index}"><div class="repeater-heading"><strong>${escapeHtml(item?.name || `第 ${index + 1} 项`)}</strong><button class="button button-ghost button-small" type="button" data-action="remove-repeat">移除</button></div>
      <div class="field-grid">${fields.map((field) => fieldMarkup({ name: `${name}-${field.name}`, id: `field-${name}-${index}-${field.name}`, label: field.label, value: item?.[field.name] || "", rows: field.rows || 0 })).join("")}</div>
    </div>`;
  }

  const PROFILE_REPEATERS = {
    education: [
      { name: "name", label: "学校或机构" },
      { name: "date", label: "时间" },
      { name: "position", label: "专业、职位或说明", rows: 3 },
      { name: "logo", label: "标志图片路径" }
    ],
    experience: [
      { name: "name", label: "公司或机构" },
      { name: "date", label: "时间" },
      { name: "position", label: "职位或说明", rows: 3 },
      { name: "logo", label: "标志图片路径" }
    ],
    awards: [
      { name: "name", label: "奖项名称" },
      { name: "date", label: "获奖时间" }
    ]
  };

  function profileMarkup() {
    const profile = state.profile.data;
    const homepage = state.display.data.homepage;
    return `${pageHeading("个人资料", "修改首页资料和展示开关；前台仍然使用你现在的页面布局。")}
      <form id="profile-form" class="section-stack">
        <section class="card form-section"><div><h2 class="card-title">基本信息</h2><p class="card-description">对应仓库中的 _data/profile.yml</p></div>
          <div class="field-grid three-columns">
            ${fieldMarkup({ name: "navbar_name", label: "导航栏姓名", value: profile.navbar_name || "" })}
            ${fieldMarkup({ name: "primary_name", label: "主名称", value: profile.primary_name || "" })}
            ${fieldMarkup({ name: "secondary_name", label: "副名称", value: profile.secondary_name || "" })}
          </div>
          <div class="field-grid">
            ${fieldMarkup({ name: "email", label: "联系邮箱", type: "email", value: profile.email || "" })}
            ${fieldMarkup({ name: "cv_link", label: "简历链接", value: profile.cv_link || "", hint: "例如 /assets/YuxuanGuoCV.pdf" })}
            ${fieldMarkup({ name: "portrait_url", label: "头像路径", value: profile.portrait_url || "" })}
            ${fieldMarkup({ name: "gscholar", label: "Google Scholar ID", value: profile.gscholar || "" })}
            ${fieldMarkup({ name: "github", label: "GitHub 用户名", value: profile.github || "" })}
            ${fieldMarkup({ name: "linkedin", label: "LinkedIn 用户名", value: profile.linkedin || "" })}
            ${fieldMarkup({ name: "twitter", label: "X / Twitter 用户名", value: profile.twitter || "" })}
            ${fieldMarkup({ name: "orcid", label: "ORCID", value: profile.orcid || "" })}
          </div>
          ${fieldMarkup({ name: "short_bio", label: "个人简介", value: profile.short_bio || "", rows: 12, hint: "保留现有 HTML 格式，可以继续使用 <p>、<strong>、<ul> 等标签。" })}
          <div class="checkbox-row">${checkboxMarkup("short_bio_text_justify", "个人简介两端对齐", profile.short_bio_text_justify)}</div>
        </section>

        <section class="card">
          ${repeaterMarkup("education", "教育经历", profile.education, PROFILE_REPEATERS.education)}
          ${repeaterMarkup("experience", "工作与研究经历", profile.experience, PROFILE_REPEATERS.experience)}
          ${repeaterMarkup("awards", "奖项", profile.awards, PROFILE_REPEATERS.awards)}
        </section>

        <section class="card form-section"><div><h2 class="card-title">首页展示设置</h2><p class="card-description">对应仓库中的 _data/display.yml</p></div>
          <div class="checkbox-row">
            ${checkboxMarkup("show_experience", "展示经历", homepage.show_experience)}
            ${checkboxMarkup("show_news", "展示新闻动态", homepage.show_news)}
            ${checkboxMarkup("show_selected_publications", "展示精选论文", homepage.show_selected_publications)}
            ${checkboxMarkup("show_selected_projects", "展示精选项目", homepage.show_selected_projects)}
          </div>
          ${fieldMarkup({ name: "num_news", label: "首页最多显示的新闻数量", type: "number", value: homepage.num_news || "10" })}
          ${fieldMarkup({ name: "footer_text", label: "页脚内容", value: state.display.data.footer_text || "", rows: 3, hint: "支持原有 HTML 格式。" })}
        </section>

        <div class="form-actions"><span class="field-hint">只会更新发生变化的字段；保存后 GitHub Pages 会自动重新部署。</span><button class="button button-primary" type="submit">保存个人资料和设置</button></div>
      </form>`;
  }

  function isProjectDetail(item) {
    return item.data.is_blog_page === true || item.data.layout === "blog";
  }

  function safeAssetSource(path) {
    if (!path) return "";
    try {
      const url = new URL(path, window.location.origin);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function emptyState(title, description) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div>`;
  }

  function collectionMarkup(collection) {
    const definition = COLLECTIONS[collection];
    const description = collection === "projects"
      ? "项目卡片与项目详情页分别管理；现有详情页正文和布局均会保留。"
      : collection === "publications" ? "管理论文标题、作者、发表信息、封面和外部链接。" : "管理首页新闻动态，支持 HTML 链接与富文本标记。";

    const searchTerm = state.search.trim().toLowerCase();
    let items = state.collections[collection].filter((item) => {
      const searchable = `${item.data.title} ${item.data.pub || ""} ${item.data.description || ""} ${item.path}`.toLowerCase();
      return !searchTerm || searchable.includes(searchTerm);
    });
    if (collection === "projects" && state.projectFilter !== "all") {
      items = items.filter((item) => state.projectFilter === "details" ? isProjectDetail(item) : !isProjectDetail(item));
    }

    const filters = collection === "projects" ? `<div class="filter-group">
      ${[{ id: "all", label: "全部" }, { id: "cards", label: "项目卡片" }, { id: "details", label: "项目详情页" }].map((filter) => `<button class="filter-chip ${state.projectFilter === filter.id ? "is-active" : ""}" type="button" data-action="filter-projects" data-filter="${filter.id}">${filter.label}</button>`).join("")}
    </div>` : "";

    return `${pageHeading(definition.label, description, `<button class="button button-primary" type="button" data-action="new-item" data-collection="${collection}">新增${definition.singular}</button>`)}
      <section class="card"><div class="toolbar"><input class="search-field" id="content-search" type="search" placeholder="搜索标题、路径或说明" value="${escapeHtml(state.search)}">${filters}</div>
      <div class="content-list">${items.length ? items.map(contentItemMarkup).join("") : emptyState("没有找到对应内容", "可以调整筛选条件，或者新建一条内容。")}</div></section>`;
  }

  function contentItemMarkup(item) {
    const cover = safeAssetSource(item.data.cover);
    const image = cover
      ? `<img class="content-cover" src="${escapeHtml(cover)}" alt="" loading="lazy">`
      : `<div class="content-cover content-placeholder" aria-hidden="true">${COLLECTIONS[item.collection].icon}</div>`;

    const tags = [];
    if (item.collection === "projects") tags.push(`<span class="tag ${isProjectDetail(item) ? "tag-warning" : "tag-accent"}">${isProjectDetail(item) ? "详情页" : "项目卡片"}</span>`);
    if (item.data.selected) tags.push('<span class="tag tag-success">首页展示</span>');
    const subtitle = item.data.pub || item.data.description || formatDate(item.data.date);

    return `<article class="content-item">${image}<div class="content-copy"><strong class="content-title">${escapeHtml(item.data.title)}</strong><span class="content-subtitle">${tags.join("")}${escapeHtml(subtitle)}</span><span class="content-path">${escapeHtml(item.path)}</span></div>
      <div class="content-actions"><button class="button button-secondary button-small" type="button" data-action="edit-item" data-path="${escapeHtml(item.path)}">编辑</button><button class="button button-danger button-small" type="button" data-action="delete-item" data-path="${escapeHtml(item.path)}">删除</button></div>
    </article>`;
  }

  function mediaMarkup() {
    return `${pageHeading("图片与文件", "上传图片或 PDF 后，可以将生成的路径填入论文、项目、头像或简历链接。")}
      <section class="card"><form id="upload-form" class="form-section">
        ${fieldMarkup({ name: "directory", label: "保存目录", value: "assets/images/uploads", hint: "也可以改为 assets/images/projects/项目名 或 assets/papers。" })}
        <div class="upload-zone"><strong>选择图片或 PDF 文件</strong><p class="supporting-copy">支持 JPG、PNG、WebP、GIF、SVG 和 PDF，单个文件不超过 8 MB。</p><input name="asset" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,.pdf" required></div>
        <div class="form-actions"><span class="field-hint">上传成功后会产生一条独立的 GitHub 提交记录。</span><button class="button button-primary" type="submit">上传到 GitHub</button></div>
        ${state.uploadResult ? `<div class="asset-result notice notice-info"><strong>文件路径：</strong><code>${escapeHtml(state.uploadResult)}</code><button class="button button-secondary button-small" type="button" data-action="copy-upload-path">复制路径</button></div>` : ""}
      </form></section>`;
  }

  function historyMarkup() {
    const content = state.historyLoaded
      ? state.history.length ? `<div class="history-list">${state.history.map((commit) => {
        const date = commit.commit?.author?.date ? new Date(commit.commit.author.date).toLocaleString("zh-CN") : "";
        return `<article class="history-item"><span class="history-title">${escapeHtml(commit.commit?.message?.split("\n")[0] || "未命名提交")}</span><span class="history-meta">${escapeHtml(commit.commit?.author?.name || "GitHub")} · ${escapeHtml(date)} · <a href="${escapeHtml(commit.html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(commit.sha.slice(0, 7))}</a></span></article>`;
      }).join("")}</div>` : emptyState("还没有提交记录", "保存任何内容后会出现在这里。")
      : `<div class="loading-panel"><span class="spinner"></span><span>正在读取提交记录…</span></div>`;

    return `${pageHeading("版本记录", "后台保存的每一次修改都是独立的 Git 提交，可以在 GitHub 中查看和恢复。", `<a class="button button-secondary" href="https://github.com/${encodeURIComponent(state.session.owner)}/${encodeURIComponent(state.session.repository)}/commits/${encodeURIComponent(state.session.branch)}" target="_blank" rel="noopener noreferrer">在 GitHub 查看全部记录 ↗</a>`)}
      <section class="card">${content}</section>
      <div class="notice notice-info notice-spaced">以后如果不再需要这个后台，只需删除仓库中的 <strong>admin1261/</strong> 目录；通过后台发布的论文、项目和图片都会保留。</div>`;
  }

  function linksToText(links) {
    if (!links || typeof links !== "object" || Array.isArray(links)) return "";
    return Object.entries(links).map(([label, url]) => `${label} | ${url}`).join("\n");
  }

  function textToLinks(value) {
    const links = {};
    for (const [index, line] of String(value || "").split("\n").entries()) {
      if (!line.trim()) continue;
      const separator = line.indexOf("|");
      if (separator === -1) throw new Error(`第 ${index + 1} 个链接格式不正确，请使用“名称 | 地址”。`);
      const label = line.slice(0, separator).trim();
      const url = line.slice(separator + 1).trim();
      if (!label || !url || /[\r\n]/.test(label)) throw new Error(`第 ${index + 1} 个链接缺少名称或地址。`);
      links[label] = url;
    }
    return links;
  }

  function authorsToText(data, useAffiliations) {
    if (useAffiliations && Array.isArray(data.authors_with_affiliations)) {
      return data.authors_with_affiliations.map((author) => [author.name, author.affiliation].filter(Boolean).join(" | ")).join("\n");
    }
    return Array.isArray(data.authors) ? data.authors.join("\n") : "";
  }

  function textToAuthors(value, useAffiliations) {
    return String(value || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      if (!useAffiliations) return line;
      const separator = line.indexOf("|");
      if (separator === -1) return { name: line };
      const name = line.slice(0, separator).trim();
      const affiliation = line.slice(separator + 1).trim();
      return affiliation ? { name, affiliation } : { name };
    });
  }

  function editorMarkup() {
    const editor = state.editor;
    const item = editor.item;
    const definition = COLLECTIONS[editor.collection];
    const isNew = editor.isNew;
    const title = isNew ? `新增${definition.singular}` : `编辑${definition.singular}`;

    return `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div class="modal-heading"><div><h2 id="editor-title">${escapeHtml(title)}</h2><p>${escapeHtml(item.path || "保存后将创建新的 GitHub 文件")}</p></div><button class="button button-ghost button-small" type="button" data-action="close-editor">关闭 ✕</button></div>
      <div class="editor-tabs"><button class="filter-chip ${editor.mode === "form" ? "is-active" : ""}" type="button" data-action="editor-mode" data-mode="form">表单编辑</button><button class="filter-chip ${editor.mode === "source" ? "is-active" : ""}" type="button" data-action="editor-mode" data-mode="source">完整源码</button></div>
      <form id="item-form">${editor.mode === "source" ? sourceEditorMarkup() : itemEditorMarkup()}
        <div class="form-actions"><span class="field-hint">保存后会立即创建 GitHub 提交，网站稍后自动更新。</span><div class="form-actions-right"><button class="button button-secondary" type="button" data-action="close-editor">取消</button><button class="button button-primary" type="submit">保存${definition.singular}</button></div></div>
      </form>
    </section></div>`;
  }

  function sourceEditorMarkup() {
    const editor = state.editor;
    const source = editor.sourceDraft ?? (editor.isNew ? createDocumentTemplate(editor.collection, editor.item.data, editor.item.body) : state.files.get(editor.item.path)?.content || "");
    return `<div class="notice notice-warning">源码模式会直接保存整个 Markdown 文件。请保留开头和结尾的 <span class="inline-code">---</span>，并确认 YAML 格式正确。</div>
      ${editor.isNew ? fieldMarkup({ name: "path", label: "文件路径", value: editor.item.path || "", required: true, hint: "例如 _publications/2026/new-paper.md" }) : ""}
      <div class="field"><label for="field-source">Markdown 完整源码</label><textarea class="code-textarea" id="field-source" name="source" rows="22" required>${escapeHtml(source)}</textarea></div>`;
  }

  function itemEditorMarkup() {
    const editor = state.editor;
    const { collection, item, isNew } = editor;
    const data = item.data;
    const detail = collection === "projects" && isProjectDetail(item);
    const useAffiliations = detail || Array.isArray(data.authors_with_affiliations);
    const date = data.date || (isNew ? formatNow() : "");

    if (collection === "news") {
      return `<div class="form-section">${fieldMarkup({ name: "title", label: "新闻内容", value: data.title || "", rows: 5, required: true, hint: "可以使用 <a>、<strong> 等现有 HTML 标签。" })}
        ${fieldMarkup({ name: "date", label: "发布时间", value: date, required: true, hint: "例如 2026-08-25 10:00:00 +0800" })}
        ${isNew ? fieldMarkup({ name: "path", label: "文件路径", value: item.path || "", hint: "留空时根据标题自动生成 _news/ 文件路径。" }) : ""}
        ${fieldMarkup({ name: "body", label: "补充正文", value: item.body || "", rows: 5, hint: "现有新闻通常只使用上方标题；如有正文也会完整保留。" })}
      </div>`;
    }

    const kindField = collection === "projects" && isNew
      ? `<div class="field"><label for="field-project_kind">项目类型</label><select id="field-project_kind" name="project_kind"><option value="card" ${detail ? "" : "selected"}>项目卡片：显示在项目列表与首页</option><option value="detail" ${detail ? "selected" : ""}>项目详情页：独立的项目介绍页面</option></select><p class="field-hint">如果需要完整项目介绍，可以先创建卡片，再另外创建详情页。</p></div>`
      : "";

    const publicationFields = collection === "publications"
      ? `<div class="field-grid">${fieldMarkup({ name: "pub", label: "期刊或会议", value: data.pub || "" })}${fieldMarkup({ name: "pub_date", label: "发表年份", value: data.pub_date || (isNew ? yearFromDate(date) : "") })}</div>
        <div class="field-grid">${fieldMarkup({ name: "pub_pre", label: "类别标签 HTML", value: data.pub_pre || "", hint: "例如 Poster、Journal、Conference 标签。" })}${fieldMarkup({ name: "pub_post", label: "发表状态补充", value: data.pub_post || "" })}</div>`
      : `<div class="field-grid">${fieldMarkup({ name: "description", label: "项目说明", value: data.description || "" })}${fieldMarkup({ name: "pub_date", label: "项目年份", value: data.pub_date || (isNew ? yearFromDate(date) : "") })}</div>`;

    const details = collection === "projects"
      ? `<section class="form-section" data-detail-fields ${detail ? "" : "hidden"}><h3 class="form-section-title">详情页布局设置</h3>
          <div class="field"><label for="field-card_layout">页面卡片布局</label><select id="field-card_layout" name="card_layout">${["flexible", "separated", "compact", "single"].map((layout) => `<option value="${layout}" ${String(data.card_layout || "flexible") === layout ? "selected" : ""}>${layout}</option>`).join("")}</select></div>
          <div class="checkbox-row">${checkboxMarkup("show_date", "显示发布日期", data.show_date !== false)}${checkboxMarkup("show_reading_time", "显示阅读时间", data.show_reading_time !== false)}${checkboxMarkup("show_authors", "显示作者", data.show_authors !== false)}${checkboxMarkup("show_affiliations", "显示作者单位", data.show_affiliations !== false)}</div>
        </section>`
      : "";

    return `<section class="form-section">${kindField}
        ${fieldMarkup({ name: "title", label: collection === "publications" ? "论文标题" : "项目标题", value: data.title || "", required: true })}
        <div class="field-grid">${fieldMarkup({ name: "date", label: "排序与发布日期", value: date, hint: "例如 2026-08-25 10:00:00 +0800" })}${fieldMarkup({ name: "cover", label: "封面图片路径", value: data.cover || "", hint: "例如 /assets/images/projects/my-project/cover.jpg" })}</div>
        ${publicationFields}
        ${fieldMarkup({ name: "authors", label: "作者", value: authorsToText(data, useAffiliations), rows: 5, hint: useAffiliations ? "每行一位作者；如需单位，使用“作者姓名 | 所属单位”。" : "每行一位作者，可保留 *、# 等共同作者标记。" })}
        ${fieldMarkup({ name: "links", label: "相关链接", value: linksToText(data.links), rows: 5, hint: "每行一个链接，格式：名称 | 地址，例如 DOI | https://doi.org/..." })}
        ${fieldMarkup({ name: "abstract", label: "简短摘要", value: data.abstract || "", rows: 4 })}
        <div class="checkbox-row">${checkboxMarkup("selected", "在首页精选区域展示", data.selected === true || (isNew && !detail))}${checkboxMarkup("has_blog", "显示项目详情页链接", data.has_blog === true)}</div>
        ${fieldMarkup({ name: "blog_url", label: "详情页地址", value: data.blog_url || "", hint: "例如 /projects/artisanai/；只有启用详情页链接时才显示。" })}
        ${isNew ? fieldMarkup({ name: "path", label: "文件路径", value: item.path || "", hint: "留空时根据类型、年份和标题自动生成。" }) : ""}
      </section>
      ${details}
      <section class="form-section"><h3 class="form-section-title">正文内容</h3>${fieldMarkup({ name: "body", label: "Markdown / HTML 正文", value: item.body || "", rows: detail ? 16 : 7, hint: "会原样保留项目详情页现有的 Markdown、HTML、样式和其他正文内容。" })}</section>`;
  }

  function renderEditor() {
    modalRoot.innerHTML = state.editor ? editorMarkup() : "";
    document.body.classList.toggle("has-modal", Boolean(state.editor));
  }

  function closeEditor() {
    state.editor = null;
    modalRoot.innerHTML = "";
    document.body.classList.remove("has-modal");
  }

  function findItem(path) {
    return Object.values(state.collections).flat().find((item) => item.path === path) || null;
  }

  function openNewEditor(collection) {
    state.editor = {
      collection,
      isNew: true,
      mode: "form",
      sourceDraft: null,
      item: { path: "", collection, data: {}, body: "", yaml: "" }
    };
    renderEditor();
  }

  function openExistingEditor(path) {
    const item = findItem(path);
    if (!item) throw new Error("没有找到这条内容，请先刷新页面。");
    state.editor = { collection: item.collection, isNew: false, mode: "form", sourceDraft: null, item };
    renderEditor();
  }

  function createDocumentTemplate(collection, data, body = "") {
    const order = collection === "news"
      ? ["title", "date"]
      : ["layout", "title", "date", "selected", "description", "pub", "pub_pre", "pub_post", "pub_date", "cover", "authors", "authors_with_affiliations", "abstract", "has_blog", "blog_url", "is_blog_page", "show_date", "show_reading_time", "show_authors", "show_affiliations", "card_layout", "links"];

    let yaml = "";
    for (const key of order) {
      const value = data[key];
      if (value === undefined || value === null || value === "") continue;
      if ((Array.isArray(value) || typeof value === "object") && !Object.keys(value).length) continue;
      yaml += serializeField(key, value);
    }
    return joinFrontMatter(yaml, body);
  }

  function defaultContentPath(collection, title, date, isDetail = false) {
    const slug = slugify(title);
    if (collection === "news") return `_news/${yearFromDate(date)}-${slug}.md`;
    if (collection === "projects" && isDetail) return `_projects/${slug}.md`;
    return `${COLLECTIONS[collection].prefix}${yearFromDate(date)}/${slug}.md`;
  }

  function validateContentPath(path, collection) {
    if (!path.startsWith(COLLECTIONS[collection].prefix) || !path.endsWith(".md")) {
      throw new Error(`文件必须保存在 ${COLLECTIONS[collection].prefix} 目录中，并以 .md 结尾。`);
    }
    if (path.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
      throw new Error("文件路径不正确，请检查是否存在空目录或 .. 路径。");
    }
  }

  function checkedFormField(form, name) {
    return Boolean(form.elements.namedItem(name)?.checked);
  }

  function buildEditorDocument(form) {
    const editor = state.editor;
    if (editor.mode === "source") {
      const source = form.elements.namedItem("source").value;
      const parsed = readDocument(source);
      if (!parsed?.data.title) throw new Error("源码必须包含有效的 YAML Front Matter，并设置 title 字段。");
      const path = editor.isNew ? form.elements.namedItem("path").value.trim() : editor.item.path;
      validateContentPath(path, editor.collection);
      return { path, content: source.endsWith("\n") ? source : `${source}\n`, data: parsed.data };
    }

    const data = {};
    const title = form.elements.namedItem("title").value.trim();
    if (!title) throw new Error("标题不能为空。");
    const date = form.elements.namedItem("date")?.value.trim() || "";
    const detail = editor.collection === "projects" && (editor.isNew ? form.elements.namedItem("project_kind")?.value === "detail" : isProjectDetail(editor.item));
    const useAffiliations = detail || Array.isArray(editor.item.data.authors_with_affiliations);
    data.title = title;
    if (date) data.date = date;

    if (editor.collection !== "news") {
      const textFields = ["cover", "pub_date", "abstract", "blog_url"];
      if (editor.collection === "publications") textFields.push("pub", "pub_pre", "pub_post");
      if (editor.collection === "projects") textFields.push("description");
      for (const key of textFields) {
        const value = form.elements.namedItem(key)?.value || "";
        data[key] = ["cover", "pub_date", "blog_url"].includes(key) ? value.trim() : value;
      }
      data.selected = checkedFormField(form, "selected");
      data.has_blog = checkedFormField(form, "has_blog");
      data[useAffiliations ? "authors_with_affiliations" : "authors"] = textToAuthors(form.elements.namedItem("authors").value, useAffiliations);
      data.links = textToLinks(form.elements.namedItem("links").value);

      if (detail) {
        data.layout = "blog";
        data.is_blog_page = true;
        data.card_layout = form.elements.namedItem("card_layout").value;
        for (const key of ["show_date", "show_reading_time", "show_authors", "show_affiliations"]) {
          data[key] = checkedFormField(form, key);
        }
      }
    }

    const body = form.elements.namedItem("body")?.value || "";
    const pathInput = editor.isNew ? form.elements.namedItem("path")?.value.trim() : editor.item.path;
    const path = pathInput || defaultContentPath(editor.collection, title, date, detail);
    validateContentPath(path, editor.collection);

    if (editor.isNew) return { path, content: createDocumentTemplate(editor.collection, data, body), data };

    let yaml = editor.item.yaml;
    for (const [key, value] of Object.entries(data)) {
      const original = editor.item.data[key];
      const empty = value === "" || (Array.isArray(value) && !value.length) || (value && typeof value === "object" && !Object.keys(value).length);
      if (original === undefined && (empty || value === false || (["show_date", "show_reading_time", "show_authors", "show_affiliations"].includes(key) && value === true))) continue;
      if (!compareValues(value, original)) yaml = patchField(yaml, key, value);
    }

    if (yaml === editor.item.yaml && body === editor.item.body) {
      return { path, content: state.files.get(path)?.content || joinFrontMatter(yaml, body), data };
    }

    return { path, content: joinFrontMatter(yaml, body), data };
  }

  async function handleLogin(form) {
    const formData = new FormData(form);
    const session = {
      owner: String(formData.get("owner") || "").trim(),
      repository: String(formData.get("repository") || "").trim(),
      branch: String(formData.get("branch") || "").trim(),
      token: String(formData.get("token") || "").trim()
    };
    if (!session.owner || !session.repository || !session.branch || !session.token) throw new Error("请完整填写令牌、用户名、仓库和分支。");

    state.loginError = "";
    state.loading = true;
    saveSession(session);
    render();

    try {
      await githubRequest(repoApiPath(""));
      await loadRepository({ showLoading: false });
      notify("已连接 GitHub 仓库。", "success");
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      state.session = null;
      state.loading = false;
      state.loginError = error.message;
      render();
    }
  }

  function readRepeater(form, name) {
    return [...form.querySelectorAll(`[data-repeat-item="${name}"]`)].map((row) => {
      const values = {};
      for (const field of PROFILE_REPEATERS[name]) {
        const value = row.querySelector(`[name="${name}-${field.name}"]`)?.value.trim() || "";
        if (value) values[field.name] = value;
      }
      return values;
    }).filter((item) => item.name);
  }

  function homepageField(source, name, value) {
    const homepage = getYamlEntry(source, "homepage");
    if (!homepage) throw new Error("display.yml 中缺少 homepage 配置段。");

    const expression = new RegExp(`^(\\s{2}${escapeRegExp(name)}\\s*:\\s*)([^\\n]*)(\\n|$)`, "m");
    if (expression.test(homepage.raw)) {
      const updated = homepage.raw.replace(expression, (_, prefix, original, newline) => {
        const comment = stripInlineComment(original).comment;
        return `${prefix}${value}${comment ? ` ${comment}` : ""}${newline || "\n"}`;
      });
      return `${source.slice(0, homepage.start)}${updated}${source.slice(homepage.end)}`;
    }

    const updated = `${homepage.raw.trimEnd()}\n  ${name}: ${value}\n`;
    return `${source.slice(0, homepage.start)}${updated}${source.slice(homepage.end)}`;
  }

  async function handleProfileSave(form) {
    const scalarKeys = ["primary_name", "secondary_name", "navbar_name", "email", "cv_link", "gscholar", "github", "twitter", "linkedin", "orcid", "portrait_url", "short_bio"];
    let profileSource = state.profile.file.content;
    for (const key of scalarKeys) {
      const value = form.elements.namedItem(key)?.value.trim() || "";
      const original = state.profile.data[key];
      if (original === undefined && !value) continue;
      if (!compareValues(value, original ?? "")) profileSource = patchField(profileSource, key, value);
    }

    const bioJustify = checkedFormField(form, "short_bio_text_justify");
    if (!compareValues(bioJustify, state.profile.data.short_bio_text_justify ?? false)) {
      profileSource = patchField(profileSource, "short_bio_text_justify", bioJustify);
    }

    for (const key of Object.keys(PROFILE_REPEATERS)) {
      const values = readRepeater(form, key);
      const original = Array.isArray(state.profile.data[key]) ? state.profile.data[key] : [];
      if (!compareValues(values, original)) profileSource = patchField(profileSource, key, values);
    }

    let displaySource = state.display.file.content;
    for (const key of ["show_experience", "show_news", "show_selected_publications", "show_selected_projects"]) {
      const value = checkedFormField(form, key);
      if (!compareValues(value, state.display.data.homepage[key] ?? false)) displaySource = homepageField(displaySource, key, value);
    }

    const rawNewsCount = form.elements.namedItem("num_news").value.trim();
    const newsCount = Number(rawNewsCount);
    if (!Number.isInteger(newsCount) || newsCount < 0) throw new Error("新闻数量必须是大于或等于 0 的整数。");
    if (!compareValues(String(newsCount), String(state.display.data.homepage.num_news ?? ""))) {
      displaySource = homepageField(displaySource, "num_news", newsCount);
    }

    const footer = form.elements.namedItem("footer_text").value.trim();
    if (!compareValues(footer, state.display.data.footer_text ?? "")) displaySource = patchField(displaySource, "footer_text", footer);

    const profileChanged = profileSource !== state.profile.file.content;
    const displayChanged = displaySource !== state.display.file.content;
    if (!profileChanged && !displayChanged) {
      notify("没有发现需要保存的修改。", "info");
      return;
    }

    setSubmitBusy(form, true);
    try {
      if (profileChanged) {
        await writeRepositoryFile("_data/profile.yml", profileSource, "admin: 更新个人资料", state.profile.file.sha);
      }
      if (displayChanged) {
        await writeRepositoryFile("_data/display.yml", displaySource, "admin: 更新首页展示设置", state.display.file.sha);
      }
      await loadRepository({ showLoading: false });
      notify("个人资料已保存，GitHub Pages 正在自动更新。", "success");
    } finally {
      setSubmitBusy(form, false);
    }
  }

  function setSubmitBusy(form, busy) {
    const button = form.querySelector('[type="submit"]');
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = "正在保存…";
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
    }
  }

  async function handleItemSave(form) {
    const editor = state.editor;
    const documentData = buildEditorDocument(form);
    const existing = state.files.get(documentData.path);
    if (editor.isNew && (existing || state.tree.some((entry) => entry.path === documentData.path))) {
      throw new Error("这个路径已经存在，请修改标题或手动指定其他文件路径。");
    }

    if (!editor.isNew && existing?.content === documentData.content) {
      notify("没有发现需要保存的修改。", "info");
      closeEditor();
      return;
    }

    setSubmitBusy(form, true);
    try {
      const action = editor.isNew ? "新增" : "更新";
      await writeRepositoryFile(documentData.path, documentData.content, `admin: ${action}${COLLECTIONS[editor.collection].singular} ${documentData.data.title}`, editor.isNew ? undefined : existing.sha);
      closeEditor();
      await loadRepository({ showLoading: false });
      notify(`${COLLECTIONS[editor.collection].singular}已保存，GitHub Pages 正在自动更新。`, "success");
    } finally {
      setSubmitBusy(form, false);
    }
  }

  async function handleDelete(path) {
    const item = findItem(path);
    if (!item) throw new Error("找不到要删除的内容，请先刷新数据。");
    const confirmed = window.confirm(`确定删除“${item.data.title}”？\n\n这会在 GitHub 创建一条删除提交；仍可通过 Git 历史恢复。`);
    if (!confirmed) return;
    await deleteRepositoryFile(path, item.sha);
    await loadRepository({ showLoading: false });
    notify("内容已删除；如有需要，可以通过版本记录恢复。", "success");
  }

  function sanitizeDirectory(directory) {
    const normalized = directory.trim().replace(/^\/+|\/+$/g, "");
    if (!normalized || !normalized.startsWith("assets/")) throw new Error("上传目录必须位于 assets/ 目录下。");
    if (normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
      throw new Error("上传目录不能包含空目录或 .. 路径。");
    }
    return normalized;
  }

  function sanitizeFilename(filename) {
    const name = filename.replace(/[\\/\x00-\x1f]/g, "-").trim();
    if (!name || name === "." || name === "..") throw new Error("文件名无效。");
    if (!/\.(?:jpe?g|png|webp|gif|svg|pdf)$/i.test(name)) throw new Error("只支持 JPG、PNG、WebP、GIF、SVG 和 PDF 文件。");
    return name;
  }

  async function handleUpload(form) {
    const upload = form.elements.namedItem("asset").files?.[0];
    if (!upload) throw new Error("请先选择需要上传的图片或 PDF 文件。");
    if (upload.size > MAX_UPLOAD_BYTES) throw new Error("文件超过 8 MB，请压缩后重新上传。");

    const directory = sanitizeDirectory(form.elements.namedItem("directory").value);
    const filename = sanitizeFilename(upload.name);
    const path = `${directory}/${filename}`;
    const existing = state.tree.find((entry) => entry.path === path);
    if (existing && !window.confirm(`文件 ${path} 已存在。确定覆盖吗？原版本仍然保存在 Git 历史中。`)) return;

    setSubmitBusy(form, true);
    try {
      const bytes = new Uint8Array(await upload.arrayBuffer());
      await writeBinaryFile(path, bytes, `admin: 上传文件 ${filename}`, existing?.sha);
      state.uploadResult = `/${path}`;
      await loadRepository({ showLoading: false });
      notify("文件上传完成，可以复制生成的路径。", "success");
    } finally {
      setSubmitBusy(form, false);
    }
  }

  async function loadHistory() {
    if (state.historyLoaded) return;
    try {
      state.history = await githubRequest(repoApiPath(`/commits?sha=${encodeURIComponent(state.session.branch)}&per_page=30`));
      state.historyLoaded = true;
      render();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  function addRepeaterItem(name) {
    const section = application.querySelector(`[data-repeater="${name}"] .repeater`);
    if (!section || !PROFILE_REPEATERS[name]) return;
    const indices = [...section.querySelectorAll("[data-repeat-index]")].map((row) => Number(row.dataset.repeatIndex));
    const nextIndex = indices.length ? Math.max(...indices) + 1 : 0;
    const item = document.createElement("div");
    item.innerHTML = repeaterItemMarkup(name, nextIndex, {}, PROFILE_REPEATERS[name]);
    section.appendChild(item.firstElementChild);
  }

  function switchEditorMode(mode) {
    if (!state.editor || state.editor.mode === mode) return;
    const form = modalRoot.querySelector("#item-form");

    if (mode === "source") {
      const draft = buildEditorDocument(form);
      state.editor.sourceDraft = draft.content;
      state.editor.item = { ...state.editor.item, path: draft.path };
    } else {
      const source = form.elements.namedItem("source").value;
      const parsed = readDocument(source);
      if (!parsed?.data.title) throw new Error("源码格式无效，无法切换回表单模式。");
      const path = state.editor.isNew ? form.elements.namedItem("path").value.trim() : state.editor.item.path;
      state.editor.sourceDraft = source;
      state.editor.item = { ...state.editor.item, path, ...parsed };
    }

    state.editor.mode = mode;
    renderEditor();
  }

  async function performAction(action, button) {
    switch (action) {
      case "navigate":
        state.page = button.dataset.page;
        state.search = "";
        render();
        if (state.page === "history") await loadHistory();
        return;
      case "refresh":
        state.files.clear();
        await loadRepository();
        notify("已经重新读取 GitHub 仓库。", "success");
        return;
      case "logout":
        clearSession();
        return;
      case "new-item":
        openNewEditor(button.dataset.collection);
        return;
      case "edit-item":
        openExistingEditor(button.dataset.path);
        return;
      case "delete-item":
        await handleDelete(button.dataset.path);
        return;
      case "close-editor":
        closeEditor();
        return;
      case "modal-backdrop":
        if (button === eventTarget) closeEditor();
        return;
      case "editor-mode":
        switchEditorMode(button.dataset.mode);
        return;
      case "filter-projects":
        state.projectFilter = button.dataset.filter;
        render();
        return;
      case "add-repeat":
        addRepeaterItem(button.dataset.repeaterName);
        return;
      case "remove-repeat":
        button.closest("[data-repeat-item]")?.remove();
        return;
      case "copy-upload-path":
        await navigator.clipboard.writeText(state.uploadResult);
        notify("文件路径已复制。", "success");
        return;
      default:
        return;
    }
  }

  let eventTarget = null;

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    eventTarget = event.target;
    try {
      await performAction(button.dataset.action, button);
    } catch (error) {
      notify(error.message || "操作失败，请稍后重试。", "error");
    } finally {
      eventTarget = null;
    }
  });

  document.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      if (event.target.id === "login-form") await handleLogin(event.target);
      if (event.target.id === "profile-form") await handleProfileSave(event.target);
      if (event.target.id === "item-form") await handleItemSave(event.target);
      if (event.target.id === "upload-form") await handleUpload(event.target);
    } catch (error) {
      notify(error.message || "保存失败，请稍后重试。", "error");
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id !== "content-search") return;
    const input = event.target;
    const cursor = input.selectionStart;
    state.search = input.value;
    render();
    const restored = document.getElementById("content-search");
    restored?.focus();
    restored?.setSelectionRange(cursor, cursor);
  });

  document.addEventListener("change", (event) => {
    if (event.target.name !== "project_kind") return;
    const detail = event.target.value === "detail";
    const fields = modalRoot.querySelector("[data-detail-fields]");
    if (fields) fields.hidden = !detail;
    const authorHint = modalRoot.querySelector('[name="authors"]')?.closest(".field")?.querySelector(".field-hint");
    if (authorHint) authorHint.textContent = detail ? "每行一位作者；如需单位，使用“作者姓名 | 所属单位”。" : "每行一位作者，可保留 *、# 等共同作者标记。";
    const selected = modalRoot.querySelector('[name="selected"]');
    if (selected) selected.checked = !detail;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.editor) closeEditor();
  });

  async function initialize() {
    const restored = restoreSession();
    if (!restored) {
      render();
      return;
    }

    state.session = restored;
    try {
      await loadRepository();
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      state.session = null;
      state.loading = false;
      state.loginError = error.message;
      render();
    }
  }

  initialize();
})();
