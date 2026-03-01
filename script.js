const dropZone = document.getElementById("dropZone");
const gallery = document.getElementById("gallery");
const fileInput = document.getElementById("fileInput");
const itemCountEl = document.getElementById("itemCount");
const projectNameEl = document.getElementById("projectName");

let itemCount = 0;
const activeObjectUrls = new Set();
let hasUploadedAny = false;

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

function createGalleryItem(file) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    showToast(`Skipped unsupported file: ${file.name}`, { variant: "error" });
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
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
  removeButton.setAttribute("aria-label", `Remove ${file.name} from gallery`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    gallery.removeChild(itemEl);
    if (activeObjectUrls.has(objectUrl)) {
      URL.revokeObjectURL(objectUrl);
      activeObjectUrls.delete(objectUrl);
    }
    updateItemCount(-1);
  });
  mediaWrapper.appendChild(removeButton);

  const downloadButton = document.createElement("a");
  downloadButton.className = "download-button";
  downloadButton.href = objectUrl;
  downloadButton.download = file.name || "download";
  downloadButton.setAttribute("aria-label", `Download ${file.name}`);
  downloadButton.textContent = "↓";
  mediaWrapper.appendChild(downloadButton);

  let mediaEl;
  if (isImage) {
    mediaEl = document.createElement("img");
    mediaEl.alt = file.name;
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
  nameEl.textContent = file.name;

  const detailsEl = document.createElement("p");
  detailsEl.className = "item-details";
  const sizeSpan = document.createElement("span");
  sizeSpan.textContent = formatBytes(file.size);
  const extraSpan = document.createElement("span");
  extraSpan.textContent = isImage ? file.type.split("/")[1] || "image" : "video";

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

function handleFiles(fileList) {
  if (!fileList || fileList.length === 0) return;

  const files = Array.from(fileList);
  let accepted = 0;
  let skipped = 0;

  files.forEach((file) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      skipped += 1;
      return;
    }

    const itemEl = createGalleryItem(file);
    if (itemEl) {
      setupReorderHandlers(itemEl);
      gallery.appendChild(itemEl);
      accepted += 1;
    }
  });

  if (accepted > 0) {
    if (!hasUploadedAny) {
      hasUploadedAny = true;
      dropZone.classList.add("compact");
    }
    updateItemCount(accepted);
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
    const value = projectNameEl.textContent.trim();
    if (!value) {
      projectNameEl.textContent = "Untitled project";
    }
  });
}


