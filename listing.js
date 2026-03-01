const PROJECTS_KEY = "visual-curator:projects";

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

function showToast(message, { timeout = 2000 } = {}) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, timeout);
}

function openProject(projectId) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/index\.html?$/, "curation.html");
  url.search = "";
  url.searchParams.set("id", projectId);
  window.location.href = url.toString();
}

function buildShareUrl(projectId) {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/index\.html?$/, "curation.html");
  url.search = "";
  url.searchParams.set("id", projectId);
  return url.toString();
}

function renderProjects() {
  const listEl = document.getElementById("projectList");
  const projects = loadProjects().slice().sort((a, b) => {
    const tA = a.updatedAt || a.createdAt || 0;
    const tB = b.updatedAt || b.createdAt || 0;
    return tB - tA;
  });

  listEl.innerHTML = "";

  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-empty";
    empty.textContent = "No pages yet.";
    listEl.appendChild(empty);
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement("div");
    row.className = "project-row";
    row.dataset.id = project.id;

    const title = document.createElement("span");
    title.className = "project-title";
    title.textContent = project.name || "Untitled project";
    title.contentEditable = "true";
    title.spellcheck = false;

    title.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        title.blur();
      }
    });

    title.addEventListener("focus", () => {
      row.classList.add("project-row--editing");
    });

    title.addEventListener("blur", () => {
      row.classList.remove("project-row--editing");
      const projects = loadProjects();
      const idx = projects.findIndex((p) => p.id === project.id);
      const value = title.textContent || "";
      const trimmed = value.trim() || "Untitled project";
      title.textContent = trimmed;
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], name: trimmed, updatedAt: Date.now() };
        saveProjects(projects);
      }
      renderProjects();
    });

    row.addEventListener("click", (event) => {
      if (event.target === title) return;
      if (event.target.closest(".share-button")) return;
      openProject(project.id);
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const shareButton = document.createElement("button");
    shareButton.className = "share-button";
    shareButton.type = "button";
    shareButton.setAttribute("aria-label", `Copy share link for ${project.name}`);
    shareButton.textContent = "↗";

    shareButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      const link = buildShareUrl(project.id);
      try {
        await navigator.clipboard.writeText(link);
        shareButton.textContent = "Link copied";
        shareButton.classList.add("share-button--copied");
        shareButton.disabled = true;
        setTimeout(() => {
          shareButton.textContent = "↗";
          shareButton.classList.remove("share-button--copied");
          shareButton.disabled = false;
        }, 2000);
      } catch {
        showToast(link);
      }
    });

    actions.appendChild(shareButton);

    row.appendChild(title);
    row.appendChild(actions);
    listEl.appendChild(row);
  });
}

document.getElementById("newProjectButton").addEventListener("click", () => {
  const id = `p_${Date.now().toString(36)}`;
  const projects = loadProjects();
  const project = {
    id,
    name: "Untitled project",
    createdAt: Date.now(),
  };
  projects.push(project);
  saveProjects(projects);
  openProject(id);
});

renderProjects();

