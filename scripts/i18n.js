function i18n() {
  const DEFAULT_LANGUAGE = "en";
  const STORAGE_KEY = "portfolio-language";
  const SUPPORTED_LANGUAGES = ["en", "pt", "de", "es"];

  const languageButtons = Array.from(
    document.querySelectorAll(".lang-btn[data-lang]")
  );
  const languageShortcuts = Array.from(
    document.querySelectorAll(".lang-shortcut[data-lang]")
  );
  const languageSelect = document.getElementById("lang-select");
  let translations = { en: {} };

  const interpolate = (template, values = {}) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, token) => {
      return String(values[token] ?? "");
    });
  };

  const setTranslatedValue = (element, value) => {
    const i18nAttribute = element.getAttribute("data-i18n-attr");

    if (element.tagName === "META") {
      element.setAttribute("content", value);
      return;
    }

    if (i18nAttribute) {
      element.setAttribute(i18nAttribute, value);
      return;
    }

    element.textContent = value;
  };

  const getPreferredLanguage = () => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }

    const browserLanguage = (window.navigator.language || DEFAULT_LANGUAGE)
      .slice(0, 2)
      .toLowerCase();

    return SUPPORTED_LANGUAGES.includes(browserLanguage)
      ? browserLanguage
      : DEFAULT_LANGUAGE;
  };

  const createTranslator = (language) => {
    const currentTranslations = translations[language] || {};
    const fallbackTranslations = translations[DEFAULT_LANGUAGE] || {};

    return (key, values = {}) => {
      const rawValue =
        currentTranslations[key] ?? fallbackTranslations[key] ?? key;

      if (typeof rawValue !== "string") {
        return key;
      }

      return interpolate(rawValue, values);
    };
  };

  const applyLanguage = (language) => {
    const translate = createTranslator(language);

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translatedValue = translate(key);

      if (!translatedValue || translatedValue === key) {
        return;
      }

      setTranslatedValue(element, translatedValue);
    });

    const pageTitle = translate("meta.title");
    if (pageTitle && pageTitle !== "meta.title") {
      document.title = pageTitle;
    }

    if (languageButtons.length > 0) {
      languageButtons.forEach((button) => {
        const isCurrent = button.dataset.lang === language;
        button.classList.toggle("is-active", isCurrent);
        button.setAttribute("aria-pressed", isCurrent ? "true" : "false");
      });
    }

    if (languageSelect) {
      languageSelect.value = language;
    }

    window.localStorage.setItem(STORAGE_KEY, language);

    document.dispatchEvent(
      new CustomEvent("portfolio:language-changed", {
        detail: {
          language,
          translate,
        },
      })
    );
  };

  const initLanguage = async () => {
    try {
      const response = await fetch("data/translations.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load translations file");
      }

      const data = await response.json();
      if (data && typeof data === "object") {
        translations = data;
        /* Expose translations to window for easter egg and other scripts */
        window.i18nData = translations;
      }
    } catch (error) {
      console.error("Translation loading failed:", error);
    }

    const initialLanguage = getPreferredLanguage();
    applyLanguage(initialLanguage);

    if (languageButtons.length > 0) {
      languageButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const nextLanguage = button.dataset.lang;
          if (SUPPORTED_LANGUAGES.includes(nextLanguage)) {
            applyLanguage(nextLanguage);
          }
        });
      });
    }

    if (languageShortcuts.length > 0) {
      languageShortcuts.forEach((button) => {
        button.addEventListener("click", () => {
          const nextLanguage = button.dataset.lang;
          if (SUPPORTED_LANGUAGES.includes(nextLanguage)) {
            applyLanguage(nextLanguage);
          }
        });
      });
    }

    if (languageSelect) {
      languageSelect.addEventListener("change", (event) => {
        const nextLanguage = event.target.value;
        if (SUPPORTED_LANGUAGES.includes(nextLanguage)) {
          applyLanguage(nextLanguage);
        }
      });
    }
  };

  initLanguage();
}

i18n()
