const language_mapper = {
  en: translation_en,
  pt: translation_pt,
  de: translation_de,
  es: translation_es
};

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('language-select');
  const browserLang = navigator.language.split('-')[0];
  const savedLang = localStorage.getItem('lang') || browserLang || 'en';
  select.value = savedLang;
  loadLanguage(savedLang);

  select.addEventListener('change', () => {
    const lang = select.value;
    localStorage.setItem('lang', lang);
    loadLanguage(lang);
  });
});

function loadLanguage(language = 'en') {
  const translations = language_mapper[language] || language_mapper['en'];

  if (!translations) {
    return console.error('Translation not found for:', language);
  }

  const elements = document.querySelectorAll('[data-i18n]')
  for (const el of elements) {
    const key = el.getAttribute('data-i18n');
    const text = translations[key];
    if (text !== undefined) {
      if (el.tagName === 'META' && el.getAttribute('name') === 'description') {
        el.setAttribute('content', text);
      } else if (el.tagName === 'TITLE') {
        document.title = text;
      } else {
        el.textContent = text;
      }
    }
  };

  document.documentElement.lang = language === 'pt' ? 'pt-br' : language;
}
