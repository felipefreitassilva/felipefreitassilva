function repos() {
  const reposGrid = document.getElementById("repos-grid");
  const reposStatus = document.getElementById("repos-status");
  const languageFilter = document.getElementById("filter-language");
  const typeFilter = document.getElementById("filter-type");

  if (!reposGrid || !reposStatus || !languageFilter || !typeFilter) {
    return;
  }

  let repositories = [];
  let isExpanded = false;

  const getInitialVisibleCount = () => {
    const width = window.innerWidth;
    if (width < 768) return 2;
    if (width < 1024) return 4;
    return 8;
  };

  let translate = (key, values = {}) => {
    const fallbackMap = {
      "github.filters.type.web": "Web",
      "github.filters.type.mobile": "Mobile",
      "github.filters.type.other": "Other",
      "github.card.language": "Language",
      "github.card.type": "Type",
      "github.card.topics": "Topics",
      "github.card.open": "Open repository",
      "github.card.noDescription": "No description provided.",
      "github.status.empty": "No projects match this filter yet.",
      "github.status.error": "Could not load repository data right now.",
      "github.status.count": "Showing {{count}} projects.",
      "github.status.loading": "Loading projects...",
    };

    const template = fallbackMap[key] || key;
    return template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
      return String(values[token] ?? "");
    });
  };

  const normalizeLanguage = (repo) => {
    if (typeof repo.language === "string" && repo.language.trim().length > 0) {
      return repo.language.trim();
    }
    return "Other";
  };

  const inferType = (repo) => {
    if (typeof repo.type === "string" && repo.type.trim().length > 0) {
      return repo.type.trim().toLowerCase();
    }

    const tokens = [
      repo.name,
      repo.description,
      normalizeLanguage(repo),
      Array.isArray(repo.topics) ? repo.topics.join(" ") : "",
    ]
      .join(" ")
      .toLowerCase();

    if (/(mobile|react native|expo|android|ios|flutter)/.test(tokens)) {
      return "mobile";
    }

    if (/(web|frontend|backend|fullstack|next|react|site|landing|api|node)/.test(tokens)) {
      return "web";
    }

    return "other";
  };

  const setStatus = (key, values = {}) => {
    reposStatus.textContent = translate(key, values);
  };

  const renderLoadingSkeleton = (count = 6) => {
    reposGrid.innerHTML = "";

    for (let index = 0; index < count; index += 1) {
      const skeletonCard = document.createElement("div");
      skeletonCard.className = "repo-card repo-card-skeleton";
      skeletonCard.setAttribute("aria-hidden", "true");

      const title = document.createElement("div");
      title.className = "skeleton skeleton-title";

      const copyLineOne = document.createElement("div");
      copyLineOne.className = "skeleton skeleton-copy";

      const copyLineTwo = document.createElement("div");
      copyLineTwo.className = "skeleton skeleton-copy-short";

      const chipRow = document.createElement("div");
      chipRow.className = "skeleton-chip-row";

      const firstChip = document.createElement("span");
      firstChip.className = "skeleton skeleton-chip";

      const secondChip = document.createElement("span");
      secondChip.className = "skeleton skeleton-chip";

      chipRow.append(firstChip, secondChip);
      skeletonCard.append(title, copyLineOne, copyLineTwo, chipRow);
      reposGrid.append(skeletonCard);
    }
  };

  const buildLanguageOptions = () => {
    const allOption = languageFilter.querySelector("option[value='all']");
    const currentValue = languageFilter.value || "all";
    const languageValues = [...new Set(repositories.map(normalizeLanguage))].sort(
      (a, b) => a.localeCompare(b)
    );

    languageFilter.innerHTML = "";
    if (allOption) {
      languageFilter.append(allOption);
    }

    languageValues.forEach((language) => {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      languageFilter.append(option);
    });

    languageFilter.value =
      currentValue === "all" || languageValues.includes(currentValue)
        ? currentValue
        : "all";
  };

  const buildRepoCard = (repo) => {
    const cardLink = document.createElement("a");
    cardLink.href = repo.url;
    cardLink.target = "_blank";
    cardLink.rel = "noopener noreferrer";
    cardLink.className = "repo-card";
    cardLink.setAttribute("role", "listitem");

    const card = document.createElement("article");

    const heading = document.createElement("h3");
    heading.textContent = repo.name;

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "card-content";

    const description = document.createElement("p");
    description.className = "repo-description";
    description.textContent = repo.description || translate("github.card.noDescription");

    const metaList = document.createElement("ul");
    metaList.className = "repo-meta";

    const languageItem = document.createElement("li");
    const languageLabel = document.createElement("span");
    languageLabel.className = "repo-label";
    languageLabel.textContent = translate("github.card.language");
    const languageValue = document.createElement("span");
    languageValue.textContent = normalizeLanguage(repo);
    languageItem.append(languageLabel, languageValue);

    const typeItem = document.createElement("li");
    const typeLabel = document.createElement("span");
    typeLabel.className = "repo-label";
    typeLabel.textContent = translate("github.card.type");
    const typeValue = document.createElement("span");
    typeValue.textContent = translate(`github.filters.type.${inferType(repo)}`);
    typeItem.append(typeLabel, typeValue);

    metaList.append(languageItem, typeItem);

    contentWrapper.append(description, metaList);

    card.append(heading, contentWrapper);

    if (Array.isArray(repo.topics) && repo.topics.length > 0) {
      const topicLabel = document.createElement("span");
      topicLabel.className = "repo-label";
      topicLabel.textContent = translate("github.card.topics");

      const topicList = document.createElement("ul");
      topicList.className = "repo-topic-list";

      repo.topics.slice(0, 5).forEach((topic) => {
        const topicItem = document.createElement("li");
        topicItem.textContent = topic;
        topicList.append(topicItem);
      });

      contentWrapper.append(topicLabel, topicList);
    }

    const repoLink = document.createElement("div");
    repoLink.className = "repo-link";
    repoLink.textContent = translate("github.card.open");

    card.append(repoLink);
    cardLink.append(card);

    return cardLink;
  };

  const matchesFilters = (repo) => {
    const typeValue = inferType(repo);

    const languageMatch =
      languageFilter.value === "all" || normalizeLanguage(repo) === languageFilter.value;

    const typeMatch = typeFilter.value === "all" || typeValue === typeFilter.value;

    return languageMatch && typeMatch;
  };

  const renderRepositories = () => {
    reposGrid.innerHTML = "";

    const visibleRepositories = repositories.filter(matchesFilters);

    if (visibleRepositories.length === 0) {
      setStatus("github.status.empty");
      return;
    }

    reposStatus.textContent = "";

    const initialCount = getInitialVisibleCount();
    const itemsToShow = isExpanded ? visibleRepositories.length : Math.min(initialCount, visibleRepositories.length);
    const hasMore = visibleRepositories.length > initialCount;

    visibleRepositories.slice(0, itemsToShow).forEach((repo) => {
      reposGrid.append(buildRepoCard(repo));
    });

    if (hasMore) {
      const toggleContainer = document.createElement("div");
      toggleContainer.className = "repo-toggle-container";
      toggleContainer.style.gridColumn = "1 / -1";
      toggleContainer.style.display = "flex";
      toggleContainer.style.justifyContent = "center";
      toggleContainer.style.marginTop = "1.5rem";

      const toggleButton = document.createElement("button");
      toggleButton.className = "button button-secondary";
      toggleButton.type = "button";
      toggleButton.textContent = isExpanded ? "Show less" : "Show more";
      toggleButton.addEventListener("click", () => {
        isExpanded = !isExpanded;
        renderRepositories();
      });

      toggleContainer.append(toggleButton);
      reposGrid.append(toggleContainer);
    }
  };

  const loadRepositories = async () => {
    setStatus("github.status.loading");
    renderLoadingSkeleton();

    try {
      const response = await fetch("data/repos.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load repos file");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        repositories = data;
      } else if (Array.isArray(data.repositories)) {
        repositories = data.repositories;
      } else {
        repositories = [];
      }

      buildLanguageOptions();
      renderRepositories();
    } catch (error) {
      console.error("Repository loading failed:", error);
      repositories = [];
      reposGrid.innerHTML = "";
      renderErrorUI();
    }
  };

  const renderErrorUI = () => {
    const errorContainer = document.createElement("div");
    errorContainer.className = "repo-error-container";
    errorContainer.style.gridColumn = "1 / -1";
    errorContainer.style.textAlign = "center";
    errorContainer.style.padding = "3rem 1rem";

    const errorMessage = document.createElement("p");
    errorMessage.className = "repo-error-message";
    errorMessage.style.fontSize = "1rem";
    errorMessage.style.color = "var(--text-muted)";
    errorMessage.style.marginBottom = "1rem";
    errorMessage.textContent = "Couldn't load projects right now.";

    const errorSubtext = document.createElement("p");
    errorSubtext.style.fontSize = "0.95rem";
    errorSubtext.style.color = "var(--text-muted)";
    errorSubtext.style.marginBottom = "1.5rem";
    errorSubtext.textContent = "You can still browse everything on GitHub.";

    const ctaButton = document.createElement("a");
    ctaButton.href = "https://github.com/felipefreitassilva?tab=repositories";
    ctaButton.target = "_blank";
    ctaButton.rel = "noopener noreferrer";
    ctaButton.className = "button button-secondary";
    ctaButton.textContent = "Browse all repositories";

    errorContainer.append(errorMessage, errorSubtext, ctaButton);
    reposGrid.append(errorContainer);
    setStatus("github.status.error");
  }

  languageFilter.addEventListener("change", renderRepositories);
  typeFilter.addEventListener("change", renderRepositories);

  document.addEventListener("portfolio:language-changed", (event) => {
    if (event.detail && typeof event.detail.translate === "function") {
      translate = event.detail.translate;
    }
    renderRepositories();
  });

  loadRepositories();
}

repos();
