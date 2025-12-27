// Mock dataset — replace with real project data later
const projects = [
  {
    id: 'proj-1',
    title: 'Calculator Média',
    language: 'pt',
    github: 'https://github.com/felipefreitassilva/calculadoramedia',
    links: [
      { type: 'web', url: 'https://calculadoramedia.example.com', status: 'live' },
      { type: 'android', url: 'https://play.google.com/store/apps/details?id=calc', status: 'never', note: 'Mobile companion planned but not published yet.' }
    ],
    releaseFrom: 'Jan 2021',
    releaseTo: 'Dec 2022',
    description: 'A small web app to calculate student average grades.',
    tech: ['html','css','js'],
    images: [
      '/assets/qrcodes/qrcodeCalculadoramedia.png',
      '/assets/images/perfil.jpg'
    ]
  },
  {
    id: 'proj-2',
    title: 'Clube Automatizando',
    language: 'pt',
    github: 'https://github.com/felipefreitassilva/clube-automatizando',
    links: [
      { type: 'web', url: 'https://clubeautomatizando.example.com', status: 'never', note: 'No public deployment; project available on GitHub only.' }
    ],
    releaseFrom: 'Mar 2020',
    releaseTo: 'Present',
    description: 'A community site with automation examples.',
    tech: ['react','css','node'],
    images: [
      '/assets/qrcodes/qrcodeClubeautomatizando.png',
      '/assets/images/perfil.jpg'
    ]
  },
  {
    id: 'proj-3',
    title: 'Programat',
    language: 'en',
    github: 'https://github.com/felipefreitassilva/programat',
    links: [
      { type: 'web', url: 'https://programat.example.com', status: 'expired', note: 'Domain not renewed; site returns 404.' },
      { type: 'ios', url: 'https://apps.apple.com/app/id123456789', status: 'live' }
    ],
    releaseFrom: 'Jun 2019',
    releaseTo: 'Aug 2021',
    description: 'A programming challenge collection and solutions.',
    tech: ['python','flask'],
    images: [
      '/assets/qrcodes/qrcodeProgramat.png',
      '/assets/images/perfil.jpg'
    ]
  }
];

const state = {
  techFilter: new Set(),
  query: ''
};

function getAllTech(projectsList) {
  const setOfTech = new Set();
  for (let i = 0; i < projectsList.length; i++) {
    const project = projectsList[i];
    const techArray = project.tech || [];
    for (let j = 0; j < techArray.length; j++) {
      setOfTech.add(techArray[j]);
    }
  }
  const result = Array.from(setOfTech).sort();
  return result;
}

function makeChipClickHandler(tech, chipNode) {
  return function onChipClick() {
    if (state.techFilter.has(tech)) {
      state.techFilter.delete(tech);
    } else {
      state.techFilter.add(tech);
    }
    chipNode.classList.toggle('active');
    renderGrid();
  };
}

function buildTechChips(container, techs) {
  container.innerHTML = '';
  const templateElement = document.getElementById('chip-template');
  for (let i = 0; i < techs.length; i++) {
    const tech = techs[i];
    const node = templateElement.content.firstElementChild.cloneNode(true);
    node.textContent = tech;
    node.addEventListener('click', makeChipClickHandler(tech, node));
    container.appendChild(node);
  }
}

function matchesFilters(project) {
  if (state.query) {
    const q = state.query.toLowerCase();
    const title = (project.title || '').toLowerCase();
    const description = ((project.description || '')).toLowerCase();
    if (!(title.indexOf(q) !== -1 || description.indexOf(q) !== -1)) {
      return false;
    }
  }
  if (state.techFilter.size) {
    const iterator = state.techFilter.values();
    let next = iterator.next();
    while (!next.done) {
      const tech = next.value;
      if ((project.tech || []).indexOf(tech) === -1) {
        return false;
      }
      next = iterator.next();
    }
  }
  return true;
}

function renderGrid() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  const filtered = [];
  for (let i = 0; i < projects.length; i++) {
    const item = projects[i];
    if (matchesFilters(item)) {
      filtered.push(item);
    }
  }
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="muted">No projects match your filters.</p>';
    return;
  }
  const templateElement = document.getElementById('project-template');
  for (let k = 0; k < filtered.length; k++) {
    const project = filtered[k];
    const node = templateElement.content.firstElementChild.cloneNode(true);
    // carousel
  const carousel = node.querySelector('.carousel');
  carousel.dataset.project = project.id;
  const imageElement = carousel.querySelector('img');
  imageElement.src = (project.images && project.images[0]) ? project.images[0] : '';
  imageElement.alt = project.title + ' preview';
    // title
    node.querySelector('.proj-title').textContent = project.title;
    // deploy links: show only the first link as preview
    const deployRow = node.querySelector('.deploy-row');
    if (project.links && project.links.length) {
      const firstLink = project.links[0];
      if (firstLink.status === 'live') {
        deployRow.innerHTML = '<a class="project-link project-link-' + firstLink.type + '" href="' + firstLink.url + '" target="_blank" rel="noopener">' + firstLink.type.toUpperCase() + ': ' + firstLink.url + '</a>';
      } else {
        deployRow.innerHTML = '<span class="project-link disabled project-link-' + firstLink.type + '" title="' + (firstLink.note || 'Not available') + '">' + firstLink.type.toUpperCase() + ': ' + firstLink.url + '</span>';
      }
    } else {
      deployRow.innerHTML = '<span class="deploy-badge unknown">No links</span>';
    }
    // release dates
    const releaseRow = node.querySelector('.release-row');
    if (project.releaseFrom || project.releaseTo) {
      const from = project.releaseFrom || 'Unknown';
      const to = project.releaseTo || 'Present';
      releaseRow.innerHTML = '<span class="release-badge">' + from + ' — ' + to + '</span>';
    } else {
      releaseRow.innerHTML = '';
    }
    // meta
    const meta = node.querySelector('.meta');
    meta.innerHTML = '';
    const lang = document.createElement('span');
    lang.className = 'badge';
    lang.textContent = project.language.toUpperCase();
    meta.appendChild(lang);
    for (let ti = 0; ti < (project.tech || []).length; ti++) {
      const tech = project.tech[ti];
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = tech;
      meta.appendChild(badge);
    }
    // description
    node.querySelector('.description').textContent = project.description;

    // links-list inside details: show GitHub first then all links
    const linksList = node.querySelector('.links-list');
    linksList.innerHTML = '';
    const ghLink = document.createElement('a');
    ghLink.className = 'project-link github-link';
    ghLink.href = project.github || '#';
    ghLink.target = '_blank';
    ghLink.rel = 'noopener';
    ghLink.textContent = 'GitHub: ' + (project.github || '—');
    linksList.appendChild(ghLink);
    if (project.links && project.links.length) {
      const ul = document.createElement('div');
      ul.className = 'links-list-inner';
      for (let li = 0; li < project.links.length; li++) {
        const link = project.links[li];
        const item = document.createElement(link.status === 'live' ? 'a' : 'span');
        item.className = (link.status === 'live' ? 'project-link' : 'project-link disabled') + ' project-link-' + link.type;
        if (link.status === 'live') {
          item.href = link.url;
          item.target = '_blank';
          item.rel = 'noopener';
        } else {
          item.title = link.note || 'Not available';
        }
        item.textContent = link.type.toUpperCase() + ': ' + link.url;
        ul.appendChild(item);
        if (li < project.links.length - 1) {
          const sep = document.createElement('span');
          sep.textContent = ' • ';
          ul.appendChild(sep);
        }
      }
      linksList.appendChild(ul);
    }

    grid.appendChild(node);
  }

  initCarousels();
}

function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');
  for (let ci = 0; ci < carousels.length; ci++) {
    const car = carousels[ci];
    const id = car.dataset.project;
    let project = null;
    for (let pi = 0; pi < projects.length; pi++) {
      if (projects[pi].id === id) {
        project = projects[pi];
        break;
      }
    }
    if (!project) {
      continue;
    }
    let idx = 0;
    const imageElement = car.querySelector('img');
    const prevButton = car.querySelector('.prev');
    const nextButton = car.querySelector('.next');
    function showImage(i) {
      idx = (i + project.images.length) % project.images.length;
      imageElement.src = project.images[idx];
      imageElement.alt = project.title + ' preview ' + (idx + 1);
    }
    function onPrevClick() {
      showImage(idx - 1);
    }
    function onNextClick() {
      showImage(idx + 1);
    }
    prevButton.onclick = onPrevClick;
    nextButton.onclick = onNextClick;
  car.tabIndex = 0;
    function onCarouselKeydown(e) {
      if (e.key === 'ArrowLeft') {
        showImage(idx - 1);
      }
      if (e.key === 'ArrowRight') {
        showImage(idx + 1);
      }
    }
    car.addEventListener('keydown', onCarouselKeydown);
    showImage(0);
  }
}

function onSearchInput(e) {
  state.query = e.target.value;
  renderGrid();
}

function init() {
  const techChips = document.getElementById('techChips');
  buildTechChips(techChips, getAllTech(projects));
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', onSearchInput);
  renderGrid();
}

document.addEventListener('DOMContentLoaded', init);
