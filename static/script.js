/**
 * SZI Optimization — Клиентская логика.
 * Навигация, темизация, генерация матриц, решение задачи, импорт файлов.
 */
document.addEventListener('DOMContentLoaded', () => {
  // ── DOM-ссылки ──────────────────────────────────────────
  const fileInput = document.getElementById('fileInput');
  const mInput = document.getElementById('m_input');
  const nInput = document.getElementById('n_input');
  const lamInput = document.getElementById('lam_input');
  const generateTablesBtn = document.getElementById('generateTablesBtn');
  const solveBtn = document.getElementById('solveBtn');
  const manualInputBtn = document.getElementById('manualInputBtn');

  const dataInputPanel = document.getElementById('dataInputPanel');
  const configPanel = document.getElementById('configPanel');
  const matricesContainer = document.getElementById('matricesContainer');
  const resultContainer = document.getElementById('resultContainer');
  const errorBox = document.getElementById('errorBox');

  let currentM = 0;
  let currentN = 0;
  let lastSolutions = null;

  function renderResultCards(solutions) {
    const bestWrapper = document.getElementById('bestResultWrapper');
    const allWrapper = document.getElementById('allCandidatesWrapper');
    if (!bestWrapper || !allWrapper) return;

    bestWrapper.innerHTML = '';
    allWrapper.innerHTML = '';
    bestWrapper.classList.remove('hidden');
    allWrapper.classList.remove('hidden');

    // Exclude x_0 from being selected as the best solution
    const validSolutions = solutions.filter(s => s.s_index !== 0);
    const maxF = Math.max(...validSolutions.map(s => s.f));
    const bestSolution = validSolutions.find(s => s.f === maxF);

    const subStyle = 'line-height:0; position:relative; vertical-align:baseline; bottom:-0.15em; font-size: 0.75em;';

    const createCard = (sol, isBestHighlight) => {
      const card = document.createElement('div');
      card.className = 'result-card solver-card';
      if (isBestHighlight) card.classList.add('best-solution');

      card.innerHTML = `
          <div style="padding: 0.6rem 0.75rem 0.6rem 1.25rem; border-bottom: 1px solid var(--panel-border); min-height: 3.2rem; display: flex; align-items: center;">
              <div style="display:flex; align-items:center; gap: 0.75rem; width: 100%;">
                  ${isBestHighlight ? '<span style="color:var(--best-card-border); font-weight:700; font-size: 0.85rem; border: 1.5px solid var(--best-card-border); padding: 3px 8px; border-radius: 4px; white-space: nowrap;">' + t('best_solution') + '</span>' : ''}
                  <span style="font-size: 1.2rem; font-weight: 700; color: ${isBestHighlight ? 'var(--best-card-border)' : 'var(--text-main)'}; line-height: 1.65; flex: 1; word-break: break-all;">
                      ${t('vector_x')}<sub style="${subStyle}">${sol.s_index}</sub> [${sol.vector_x.join(', ')}]
                  </span>
              </div>
          </div>
          <div style="display:flex; flex-wrap: wrap; background: var(--panel-border); gap: 1px;">
              <div style="flex: 1; min-width: 170px; padding: 0.8rem 1.25rem; background: var(--panel-bg);">
                  <div style="font-size: 1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.3rem;">${t('val_fx')}<sub style="${subStyle}">${sol.s_index}</sub>)</div>
                  <div style="font-size: 1.7rem; font-weight: 700; color: var(--text-main); line-height: 1.2;">${parseFloat(sol.f.toFixed(4))}</div>
              </div>
              <div style="flex: 2; min-width: 280px; padding: 0.8rem 1.25rem; background: var(--panel-bg);">
                  <div style="font-size: 1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.3rem;">${t('chosen_szi')}</div>
                  <div style="font-size: 1.5rem; font-weight: 700; color: ${isBestHighlight ? 'var(--best-card-border)' : 'var(--salt-blue-accent)'}; line-height: 1.5; word-break: break-word;">${sol.szi.length > 0 ? sol.szi.join(', ') : t('none')}</div>
              </div>
          </div>
      `;
      return card;
    };

    // 1. Показываем лучший вариант в верхнем блоке
    if (bestSolution) {
      bestWrapper.appendChild(createCard(bestSolution, true));
    }

    // 2. Показываем список x_s в нижнем блоке (исключая x_0)
    solutions.forEach((sol) => {
      if (sol.s_index === 0) return; // Пропускаем x_0, он уже сверху
      allWrapper.appendChild(createCard(sol, false));
    });

    // Update fog overlays
    setTimeout(handleCandidatesScroll, 50);
  }

  function handleCandidatesScroll() {
    const wrapper = document.getElementById('allCandidatesWrapper');
    const body = wrapper?.closest('.candidates-body');
    if (!wrapper || !body) return;

    // Check top
    if (wrapper.scrollTop <= 10) {
      body.classList.add('at-top');
    } else {
      body.classList.remove('at-top');
    }

    // Check bottom
    const isAtBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight <= 10;
    if (isAtBottom) {
      body.classList.add('at-bottom');
    } else {
      body.classList.remove('at-bottom');
    }
  }

  const allCandidatesWrapper = document.getElementById('allCandidatesWrapper');
  if (allCandidatesWrapper) {
    allCandidatesWrapper.addEventListener('scroll', handleCandidatesScroll);
    window.addEventListener('resize', handleCandidatesScroll);
  }

  // ── Pill Slider Helper ────────────────────────────────────
  function updatePillSlider(container, instant = false) {
    const slider = container.querySelector('.pill-slider');
    const activeItem = container.querySelector('.pill-item.active');
    if (!slider || !activeItem) return;

    if (instant) {
      slider.style.transition = 'none';
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const offset = itemRect.left - containerRect.left - 4; // 4px padding

    slider.style.width = itemRect.width + 'px';
    slider.style.transform = `translateX(${offset}px)`;

    if (instant) {
      // Force a synchronous reflow so the browser renders at the new coordinates immediately
      void slider.offsetWidth;
      slider.style.transition = '';
    }
  }

  // ── Переключение навигации ───────────────────────────────
  const topNav = document.querySelector('.top-nav');

  topNav.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.nav-item');
    if (!clickedItem) return;

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    clickedItem.classList.add('active');
    updatePillSlider(topNav);

    const tabName = clickedItem.getAttribute('data-tab');

    const docsPanel = document.getElementById('docsPanel');
    const settingsPanel = document.getElementById('settingsPanel');
    const optimizationView = document.getElementById('optimizationView');

    if (tabName === 'Оптимизация') {
      docsPanel.classList.add('hidden');
      settingsPanel.classList.add('hidden');
      optimizationView.classList.remove('hidden');
    } else if (tabName === 'Справка') {
      optimizationView.classList.add('hidden');
      settingsPanel.classList.add('hidden');
      docsPanel.classList.remove('hidden');
    } else if (tabName === 'Настройки') {
      optimizationView.classList.add('hidden');
      docsPanel.classList.add('hidden');
      settingsPanel.classList.remove('hidden');

      // The settings panel was un-hidden; we must wait a single frame for the DOM 
      // to calculate widths, then instantly update any internal sliders so they aren't squashed.
      requestAnimationFrame(() => {
        if (typeof settingsLangPill !== 'undefined' && settingsLangPill) {
          updatePillSlider(settingsLangPill, true);
        }
        const navbarPosPill = document.querySelector('.navbar-pos-pill');
        if (navbarPosPill) {
          updatePillSlider(navbarPosPill, true);
        }
        const bgPatternPill = document.querySelector('.bg-pattern-pill');
        if (bgPatternPill) {
          updatePillSlider(bgPatternPill, true);
        }
      });
    }
  });

  // Global resize listener for all pill sliders globally, so they never break
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      const topNav = document.querySelector('.top-nav');
      const langSwitcher = document.querySelector('.lang-switcher');
      const settingsLangPill = document.querySelector('.settings-lang-pill');
      const navbarPosPill = document.querySelector('.navbar-pos-pill');
      const bgPatternPill = document.querySelector('.bg-pattern-pill');

      if (topNav) updatePillSlider(topNav);
      if (langSwitcher) updatePillSlider(langSwitcher);
      if (settingsLangPill && !document.getElementById('settingsPanel').classList.contains('hidden')) {
        updatePillSlider(settingsLangPill);
      }
      if (navbarPosPill && !document.getElementById('settingsPanel').classList.contains('hidden')) {
        updatePillSlider(navbarPosPill);
      }
      if (bgPatternPill && !document.getElementById('settingsPanel').classList.contains('hidden')) {
        updatePillSlider(bgPatternPill);
      }
    });
  });

  // ── Язык ────────────────────────────────────────────────
  const langSwitcher = document.querySelector('.lang-switcher');
  const settingsLangPill = document.querySelector('.settings-lang-pill');
  const langItems = document.querySelectorAll('.lang-item');

  const updateLangUI = (lang) => {
    langItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-lang') === lang);
    });
    updatePillSlider(langSwitcher);
    if (settingsLangPill) updatePillSlider(settingsLangPill);
  };

  updateLangUI(currentLang);

  const handleLangChange = (selectedLang) => {
    if (selectedLang !== currentLang) {
      setLanguage(selectedLang);
      updateLangUI(selectedLang);
    }
  };

  langItems.forEach(item => {
    item.addEventListener('click', () => handleLangChange(item.getAttribute('data-lang')));
  });

  // ── Glass Dropdowns (Generic) ───────────────────────────
  document.addEventListener('click', (e) => {
    // Close all dropdowns if clicked outside
    if (!e.target.closest('.glass-dropdown')) {
      document.querySelectorAll('.glass-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // ── Темная тема ─────────────────────────────────────────
  const themeDropdowns = document.querySelectorAll('.theme-dropdown');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const updateThemeUI = (theme) => {
    themeDropdowns.forEach(dropdown => {
      // update text
      const selectedTextEl = dropdown.querySelector('.selected-theme-text');
      const items = dropdown.querySelectorAll('.glass-dropdown-item');
      items.forEach(item => {
        if (item.getAttribute('data-theme') === theme) {
          item.classList.add('active');
          if (selectedTextEl) {
            selectedTextEl.textContent = item.textContent.trim();
            if (item.hasAttribute('data-i18n')) {
              selectedTextEl.setAttribute('data-i18n', item.getAttribute('data-i18n'));
            }
          }
        } else {
          item.classList.remove('active');
        }
      });
    });
  };

  updateThemeUI(currentTheme);

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeUI(theme);
    if (typeof updatePageLanguage === 'function') updatePageLanguage();

    // Recalculate pill sliders after theme change
    requestAnimationFrame(() => {
      const topNav = document.querySelector('.top-nav');
      const langSwitcher = document.querySelector('.lang-switcher');
      const settingsLangPill = document.querySelector('.settings-lang-pill');
      if (topNav) updatePillSlider(topNav);
      if (langSwitcher) updatePillSlider(langSwitcher);
      if (settingsLangPill) updatePillSlider(settingsLangPill);
    });
  };

  themeDropdowns.forEach(dropdown => {
    const header = dropdown.querySelector('.glass-dropdown-header');
    const items = dropdown.querySelectorAll('.glass-dropdown-item');

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.glass-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    items.forEach(item => {
      item.addEventListener('click', () => {
        handleThemeChange(item.getAttribute('data-theme'));
        dropdown.classList.remove('open');
      });
    });
  });

  // ── Режим производительности (без размытий) ─────────────
  const perfToggle = document.getElementById('perfModeToggle');
  const perfModeEnabled = localStorage.getItem('perfMode') === 'true';

  const applyPerfMode = (enabled) => {
    if (enabled) {
      document.documentElement.setAttribute('data-no-blur', '');
    } else {
      document.documentElement.removeAttribute('data-no-blur');
    }
    if (perfToggle) perfToggle.checked = enabled;
  };

  applyPerfMode(perfModeEnabled);

  if (perfToggle) {
    perfToggle.addEventListener('change', () => {
      const enabled = perfToggle.checked;
      localStorage.setItem('perfMode', enabled);
      applyPerfMode(enabled);
    });
  }

  let navbarPos = localStorage.getItem('navbarPos') || 'center';

  const navbarPosItems = document.querySelectorAll('.navbar-pos-item');
  const navbarPosPill = document.querySelector('.navbar-pos-pill');

  const updateNavbarUI = (pos) => {
    // Update pill UI
    navbarPosItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-pos') === pos);
    });
    if (navbarPosPill) updatePillSlider(navbarPosPill);

    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // Remove custom mode classes
    headerRight.classList.remove('navbar-static', 'navbar-right');

    if (pos === 'static') {
      headerRight.classList.remove('scrolled');
      headerRight.classList.add('navbar-static');
    } else if (pos === 'right') {
      headerRight.classList.remove('scrolled');
      headerRight.classList.add('navbar-right');
    } else {
      // 'center' mode: dynamically calculate scroll class
      window.dispatchEvent(new Event('scroll'));
    }
  };

  updateNavbarUI(navbarPos);

  navbarPosItems.forEach(item => {
    item.addEventListener('click', () => {
      navbarPos = item.getAttribute('data-pos');
      localStorage.setItem('navbarPos', navbarPos);
      updateNavbarUI(navbarPos);
    });
  });

  // ── Орнамент фона ────────────────────────────────────────
  let bgPattern = localStorage.getItem('bgPattern') || 'dots';
  document.documentElement.setAttribute('data-pattern', bgPattern);

  const bgPatternItems = document.querySelectorAll('.bg-pattern-item');
  const bgPatternPill = document.querySelector('.bg-pattern-pill');

  const updateBgPatternUI = (pattern) => {
    bgPatternItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-pattern') === pattern);
    });
    if (bgPatternPill) updatePillSlider(bgPatternPill);
    document.documentElement.setAttribute('data-pattern', pattern);
  };

  updateBgPatternUI(bgPattern);

  bgPatternItems.forEach(item => {
    item.addEventListener('click', () => {
      bgPattern = item.getAttribute('data-pattern');
      localStorage.setItem('bgPattern', bgPattern);
      updateBgPatternUI(bgPattern);
    });
  });

  // ── Initial slider positions ────────────────────────────
  requestAnimationFrame(() => {
    updatePillSlider(topNav);
    updatePillSlider(langSwitcher);
    if (settingsLangPill) updatePillSlider(settingsLangPill);
    const bgPatternPill = document.querySelector('.bg-pattern-pill');
    if (bgPatternPill && !document.getElementById('settingsPanel').classList.contains('hidden')) updatePillSlider(bgPatternPill);
  });

  // ── Построение сетки ввода ──────────────────────────────
  function buildMatrix(containerId, rows, cols, prefix, initVal = 0) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    grid.style.gridTemplateRows = `repeat(${rows}, auto)`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'matrix-cell';
        input.id = `${prefix}_${i}_${j}`;
        input.step = 'any';
        input.value = initVal;
        grid.appendChild(input);
      }
    }
    container.appendChild(grid);
  }

  // ── Ручной ввод ─────────────────────────────────────────
  manualInputBtn.addEventListener('click', () => {
    configPanel.classList.remove('hidden');
  });

  // ── Генерация матрицы ───────────────────────────────────
  generateTablesBtn.addEventListener('click', () => {
    currentM = parseInt(mInput.value);
    currentN = parseInt(nInput.value);

    if (currentM <= 0 || currentN <= 0) {
      alert(t('err_dimensions'));
      return;
    }

    buildMatrix('matrixA_container', currentM, currentN, 'A');
    buildMatrix('vectorB_container', 1, currentM, 'b');
    buildMatrix('vectorC_container', 1, currentN, 'c');
    buildMatrix('vectorD_container', 1, currentN, 'd');

    // Show the data fields section
    document.getElementById('dataFieldsWrapper').classList.remove('hidden');
    matricesContainer.classList.remove('hidden');
  });

  // ── Запуск расчёта ──────────────────────────────────────
  solveBtn.addEventListener('click', async () => {
    // Guard: require data before solving
    if (currentM <= 0 || currentN <= 0) {
      const errorBox = document.getElementById('errorBox');
      errorBox.innerText = t('err_no_data');
      errorBox.classList.remove('hidden');
      return;
    }

    solveBtn.disabled = true;
    solveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span data-i18n="solving_btn">${t('solving_btn')}</span>`;

    try {
      // Collect A
      let A = [];
      for (let i = 0; i < currentM; i++) {
        let row = [];
        for (let j = 0; j < currentN; j++) {
          row.push(parseFloat(document.getElementById(`A_${i}_${j}`).value) || 0);
        }
        A.push(row);
      }

      // Collect vectors
      let b = [];
      for (let i = 0; i < currentM; i++) {
        b.push(parseFloat(document.getElementById(`b_0_${i}`).value) || 0);
      }

      let c = [];
      let d = [];
      for (let j = 0; j < currentN; j++) {
        c.push(parseFloat(document.getElementById(`c_0_${j}`).value) || 0);
        d.push(parseFloat(document.getElementById(`d_0_${j}`).value) || 0);
      }

      const payload = {
        m: currentM,
        n: currentN,
        lam: parseFloat(lamInput.value) || 0.5,
        A: A,
        b: b,
        c: c,
        d: d
      };

      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // Show the result container
      resultContainer.classList.remove('hidden');

      const bestWrapper = document.getElementById('bestResultWrapper');
      const allWrapper = document.getElementById('allCandidatesWrapper');
      const candidatesContainer = document.getElementById('candidatesContainer');

      if (result.success) {
        errorBox.classList.add('hidden');

        bestWrapper.classList.remove('hidden');
        allWrapper.classList.remove('hidden');
        if (candidatesContainer) candidatesContainer.classList.remove('hidden');

        // The user wants to see all candidate vectors, even if they are identical.
        lastSolutions = result.all_solutions;
        renderResultCards(lastSolutions);

      } else {
        errorBox.innerText = result.error || t('err_unknown');
        errorBox.classList.remove('hidden');
        bestWrapper.classList.add('hidden');
        allWrapper.classList.add('hidden');
        if (candidatesContainer) candidatesContainer.classList.add('hidden');
      }

    } catch (err) {
      console.error(err);
      errorBox.innerText = t('err_server');
      errorBox.classList.remove('hidden');
      resultContainer.classList.remove('hidden');
    } finally {
      solveBtn.disabled = false;
      solveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> <span data-i18n="solve_btn">${t('solve_btn')}</span>`;
    }
  });

  // ── Импорт данных из файла ──────────────────────────────
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l);

      if (lines.length < 5) return alert(t('err_invalid_file'));

      try {
        const [mStr, nStr] = lines[0].split(/\s+/);
        const m = parseInt(mStr);
        const n = parseInt(nStr);

        mInput.value = m;
        nInput.value = n;
        currentM = m;
        currentN = n;

        buildMatrix('matrixA_container', m, n, 'A');
        buildMatrix('vectorB_container', 1, m, 'b');
        buildMatrix('vectorC_container', 1, n, 'c');
        buildMatrix('vectorD_container', 1, n, 'd');

        // Fill A
        for (let i = 0; i < m; i++) {
          const vals = lines[1 + i].split(/\s+/).map(Number);
          for (let j = 0; j < n; j++) {
            document.getElementById(`A_${i}_${j}`).value = vals[j];
          }
        }

        let lineIdx = 1 + m;
        // Fill b
        const bVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let i = 0; i < m; i++) document.getElementById(`b_0_${i}`).value = bVals[i];

        // Fill c
        const cVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`c_0_${j}`).value = cVals[j];

        // Fill d
        const dVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`d_0_${j}`).value = dVals[j];

        // Fill lam
        lamInput.value = parseFloat(lines[lineIdx]) || 0.5;

        configPanel.classList.remove('hidden');
        matricesContainer.classList.remove('hidden');
        document.getElementById('dataFieldsWrapper').classList.remove('hidden');

      } catch (err) {
        console.error(err);
        alert(t('err_read_file') + err.message);
      }
    };
    reader.readAsText(file);
  });

  // ── Info Modal & Demo Data ──────────────────────────────
  const infoBtn = document.getElementById('infoBtn');
  const infoModal = document.getElementById('infoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const demoDataBtn = document.getElementById('demoDataBtn');
  const docLinkBtn = document.getElementById('docLinkBtn');

  if (infoBtn && infoModal && closeModalBtn) {
    infoBtn.addEventListener('click', () => {
      infoModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
      infoModal.classList.add('hidden');
    });

    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        infoModal.classList.add('hidden');
      }
    });
  }

  if (docLinkBtn) {
    docLinkBtn.addEventListener('click', () => {
      infoModal.classList.add('hidden');
      const docTab = document.querySelector('.nav-item[data-tab="Документация"]');
      if (docTab) {
        // Trigger click event on the documentation tab to run the existing navigation logic
        docTab.click();
      }
    });
  }

  if (demoDataBtn) {
    demoDataBtn.addEventListener('click', () => {
      const demoContent = `3 5\n15 10 5 4 3\n27 18 12 6 6\n40 25 12 11 8\n20 39 48\n90 76 30 35 30\n40 20 14 12 10\n0.5`;

      const lines = demoContent.split('\n').map(l => l.trim()).filter(l => l);
      try {
        const [mStr, nStr] = lines[0].split(/\s+/);
        const m = parseInt(mStr);
        const n = parseInt(nStr);

        mInput.value = m;
        nInput.value = n;
        currentM = m;
        currentN = n;

        buildMatrix('matrixA_container', m, n, 'A');
        buildMatrix('vectorB_container', 1, m, 'b');
        buildMatrix('vectorC_container', 1, n, 'c');
        buildMatrix('vectorD_container', 1, n, 'd');

        // Fill A
        for (let i = 0; i < m; i++) {
          const vals = lines[1 + i].split(/\s+/).map(Number);
          for (let j = 0; j < n; j++) {
            document.getElementById(`A_${i}_${j}`).value = vals[j];
          }
        }

        let lineIdx = 1 + m;
        // Fill b
        const bVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let i = 0; i < m; i++) document.getElementById(`b_0_${i}`).value = bVals[i];

        // Fill c
        const cVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`c_0_${j}`).value = cVals[j];

        // Fill d
        const dVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`d_0_${j}`).value = dVals[j];

        // Fill lam
        lamInput.value = parseFloat(lines[lineIdx]) || 0.5;

        configPanel.classList.remove('hidden');
        matricesContainer.classList.remove('hidden');
        document.getElementById('dataFieldsWrapper').classList.remove('hidden');

        // Hide modal
        infoModal.classList.add('hidden');
      } catch (err) {
        console.error(err);
        alert(t('err_demo_data') + err.message);
      }
    });
  }

  // Handle dynamic text regeneration upon language change
  window.addEventListener('languageChanged', (e) => {
    // Re-render result cards with new language
    if (lastSolutions) {
      renderResultCards(lastSolutions);
    }

    // Recalculate pill sliders after text widths change
    requestAnimationFrame(() => {
      updatePillSlider(topNav);
      updatePillSlider(langSwitcher);
      if (settingsLangPill) updatePillSlider(settingsLangPill);
      const bgPatternPill = document.querySelector('.bg-pattern-pill');
      if (bgPatternPill && !document.getElementById('settingsPanel').classList.contains('hidden')) updatePillSlider(bgPatternPill);
    });
  });

  // Scroll handler for header right controls
  window.addEventListener('scroll', () => {
    // If navbar is chosen to be static or right, ignore the center scroll shift
    if (typeof navbarPos !== 'undefined' && (navbarPos === 'static' || navbarPos === 'right')) return;

    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      if (window.scrollY > 150) {
        headerRight.classList.add('scrolled');
      } else {
        headerRight.classList.remove('scrolled');
      }
    }
  });

});
