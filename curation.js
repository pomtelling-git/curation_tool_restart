const dropZone = document.getElementById("dropZone");
const gallery = document.getElementById("gallery");
const fileInput = document.getElementById("fileInput");
const itemCountEl = document.getElementById("itemCount");
const projectNameEl = document.getElementById("projectName");
const dropTitleEl = document.getElementById("dropTitle");
const backToProjectsButton = document.getElementById("backToProjects");

let itemCount = 0;
const activeObjectUrls = new Set();
let hasUploadedAny = false;

const PROJECTS_KEY = "visual-curator:projects";
const DB_NAME = "visual-curator-db";
const DB_VERSION = 1;
const MEDIA_STORE = "media";

function loadProjects() {
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

function openDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB not available"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const store = db.createObjectStore(MEDIA_STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("projectId", "projectId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getMediaForProject(projectId) {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, "readonly");
      const store = tx.objectStore(MEDIA_STORE);
      const index = store.index("projectId");
      const request = index.getAll(IDBKeyRange.only(projectId));

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function addMediaForProject(projectId, file) {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, "readwrite");
      const store = tx.objectStore(MEDIA_STORE);
      const record = {
        projectId,
        name: file.name,
        type: file.type,
        size: file.size,
        createdAt: Date.now(),
        blob: file,
      };
      const request = store.add(record);
      request.onsuccess = () => {
        record.id = request.result;
        resolve(record);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return {
      id: undefined,
      projectId,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: Date.now(),
      blob: file,
    };
  }
}

async function deleteMedia(id) {
  if (id == null) return;
  try {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, "readwrite");
      const store = tx.objectStore(MEDIA_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // ignore
  }
}

function getProjectIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function ensureProjectExists() {
  const idFromUrl = getProjectIdFromUrl();
  let projects = loadProjects();

  if (idFromUrl) {
    const existing = projects.find((p) => p.id === idFromUrl);
    if (existing) {
      return existing;
    }
  }

  const id = idFromUrl || `p_${Date.now().toString(36)}`;
  const project = {
    id,
    name: "Untitled project",
    createdAt: Date.now(),
  };
  projects = [...projects, project];
  saveProjects(projects);

  if (!idFromUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState(null, "", url.toString());
  }

  return project;
}

const currentProject = ensureProjectExists();

if (projectNameEl) {
  projectNameEl.textContent = currentProject.name || "Untitled project";
}

if (currentProject && currentProject.name) {
  document.title = `Visual Curator – ${currentProject.name}`;
}

function updateProjectName(name) {
  const trimmed = name.trim() || "Untitled project";
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === currentProject.id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], name: trimmed, updatedAt: Date.now() };
    saveProjects(projects);
  }
  document.title = `Visual Curator – ${trimmed}`;
}

function updateItemCount(delta) {
  itemCount += delta;
  if (itemCount < 0) itemCount = 0;
  itemCountEl.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value < 10 && exponent > 0 ? 1 : 0)} ${units[exponent]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  if (minutes === 0) return `${remaining}s`;
  return `${minutes}m ${remaining.toString().padStart(2, "0")}s`;
}

function showToast(message, { variant = "info", timeout = 2200 } = {}) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove("toast--error", "toast--success");
  if (variant === "error") toast.classList.add("toast--error");
  if (variant === "success") toast.classList.add("toast--success");

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, timeout);
}

function createGalleryItemFromRecord(record) {
  const { id, name, type, size, blob } = record;

  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");

  if (!isImage && !isVideo) {
    return null;
  }

  const objectUrl = URL.createObjectURL(blob);
  activeObjectUrls.add(objectUrl);

  const itemEl = document.createElement("article");
  itemEl.className = "gallery-item";
  itemEl.draggable = true;

  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "media-wrapper";

  const badge = document.createElement("span");
  badge.className = "media-badge";
  badge.textContent = isImage ? "Image" : "Video";
  mediaWrapper.appendChild(badge);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${name} from gallery`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    gallery.removeChild(itemEl);
    if (activeObjectUrls.has(objectUrl)) {
      URL.revokeObjectURL(objectUrl);
      activeObjectUrls.delete(objectUrl);
    }
    updateItemCount(-1);
    deleteMedia(id);
  });
  mediaWrapper.appendChild(removeButton);

  const downloadButton = document.createElement("a");
  downloadButton.className = "download-button";
  downloadButton.href = objectUrl;
  downloadButton.download = name || "download";
  downloadButton.setAttribute("aria-label", `Download ${name}`);
  downloadButton.textContent = "↓";
  mediaWrapper.appendChild(downloadButton);

  let mediaEl;
  if (isImage) {
    mediaEl = document.createElement("img");
    mediaEl.alt = name;
  } else {
    mediaEl = document.createElement("video");
    mediaEl.controls = true;
    mediaEl.muted = true;
    mediaEl.loop = true;
  }

  mediaEl.src = objectUrl;
  mediaWrapper.appendChild(mediaEl);

  const metaEl = document.createElement("div");
  metaEl.className = "item-meta";

  const nameEl = document.createElement("p");
  nameEl.className = "item-name";
  nameEl.textContent = name;

  const detailsEl = document.createElement("p");
  detailsEl.className = "item-details";
  const sizeSpan = document.createElement("span");
  sizeSpan.textContent = formatBytes(size);
  const extraSpan = document.createElement("span");
  extraSpan.textContent = isImage ? type.split("/")[1] || "image" : "video";

  detailsEl.appendChild(sizeSpan);
  detailsEl.appendChild(extraSpan);

  metaEl.appendChild(nameEl);
  metaEl.appendChild(detailsEl);

  itemEl.appendChild(mediaWrapper);
  itemEl.appendChild(metaEl);

  if (isVideo) {
    mediaEl.addEventListener("loadedmetadata", () => {
      const info = [];
      if (mediaEl.videoWidth && mediaEl.videoHeight) {
        info.push(`${mediaEl.videoWidth}×${mediaEl.videoHeight}`);
      }
      if (mediaEl.duration && Number.isFinite(mediaEl.duration)) {
        const durationLabel = formatDuration(mediaEl.duration);
        if (durationLabel) info.push(durationLabel);
      }
      if (info.length) {
        extraSpan.textContent = info.join(" • ");
      }
    });
  }

  return itemEl;
}

let draggedItem = null;

function setupReorderHandlers(itemEl) {
  itemEl.addEventListener("dragstart", (event) => {
    draggedItem = itemEl;
    itemEl.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  });

  itemEl.addEventListener("dragend", () => {
    itemEl.classList.remove("dragging");
    draggedItem = null;
  });

  itemEl.addEventListener("dragover", (event) => {
    if (!draggedItem || draggedItem === itemEl) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const bounding = itemEl.getBoundingClientRect();
    const offset = event.clientY - bounding.top;
    const shouldInsertBefore = offset < bounding.height / 2;

    if (shouldInsertBefore) {
      gallery.insertBefore(draggedItem, itemEl);
    } else {
      gallery.insertBefore(draggedItem, itemEl.nextSibling);
    }
  });
}

async function handleFiles(fileList) {
  if (!fileList || fileList.length === 0) return;

  const files = Array.from(fileList);
  let accepted = 0;
  let skipped = 0;

  for (const file of files) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      skipped += 1;
      continue;
    }

    const record = await addMediaForProject(currentProject.id, file);
    const itemEl = createGalleryItemFromRecord(record);
    if (itemEl) {
      setupReorderHandlers(itemEl);
      gallery.appendChild(itemEl);
      accepted += 1;
      updateItemCount(1);
    }
  }

  if (accepted > 0 && !hasUploadedAny) {
    hasUploadedAny = true;
    dropZone.classList.add("compact");
    if (dropTitleEl) {
      dropTitleEl.hidden = true;
    }
    showToast(`Added ${accepted} file${accepted === 1 ? "" : "s"} to the collection`, {
      variant: "success",
    });
  }

  if (skipped > 0) {
    showToast(`Skipped ${skipped} unsupported file${skipped === 1 ? "" : "s"}`, {
      variant: "error",
    });
  }
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  dropZone.classList.add("drag-over");
}

function onDragLeave() {
  dropZone.classList.remove("drag-over");
}

function onDrop(event) {
  event.preventDefault();
  dropZone.classList.remove("drag-over");
  const files = event.dataTransfer?.files;
  handleFiles(files);
}

dropZone.addEventListener("click", () => {
  fileInput.click();
});

if (backToProjectsButton) {
  backToProjectsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/curation\.html?$/, "index.html");
    url.search = "";
    window.location.href = url.toString();
  });
}

fileInput.addEventListener("change", (event) => {
  handleFiles(event.target.files);
  fileInput.value = "";
});

["dragenter", "dragover"].forEach((type) => {
  window.addEventListener(type, onDragOver);
});

["dragleave", "dragend"].forEach((type) => {
  window.addEventListener(type, onDragLeave);
});

window.addEventListener("drop", onDrop);

window.addEventListener("beforeunload", () => {
  activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  activeObjectUrls.clear();
});

if (projectNameEl) {
  projectNameEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      projectNameEl.blur();
    }
  });

  projectNameEl.addEventListener("blur", () => {
    const value = projectNameEl.textContent || "";
    const trimmed = value.trim() || "Untitled project";
    projectNameEl.textContent = trimmed;
    updateProjectName(trimmed);
  });
}

async function loadExistingMedia() {
  const records = await getMediaForProject(currentProject.id);
  if (!records || !records.length) return;

  const sorted = records.slice().sort((a, b) => {
    const ta = a.createdAt || 0;
    const tb = b.createdAt || 0;
    return ta - tb;
  });

  sorted.forEach((record) => {
    const itemEl = createGalleryItemFromRecord(record);
    if (itemEl) {
      setupReorderHandlers(itemEl);
      gallery.appendChild(itemEl);
      updateItemCount(1);
    }
  });

  if (itemCount > 0 && !hasUploadedAny) {
    hasUploadedAny = true;
    dropZone.classList.add("compact");
    if (dropTitleEl) {
      dropTitleEl.hidden = true;
    }
  }
}

loadExistingMedia();

