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

    const maxF = Math.max(...solutions.map(s => s.f));
    const bestSolution = solutions.find(s => s.f === maxF);

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
  }

  // ── Переключение навигации ───────────────────────────────
  const topNav = document.querySelector('.top-nav');

  // ── Язык ────────────────────────────────────────────────
  const langItems = document.querySelectorAll('.lang-item');
  const langBtns = document.querySelectorAll('.lang-toggle-btn');
  const langToggleWrapper = document.querySelector('.lang-toggle-wrapper');

  const updateLangUI = (lang) => {
    // Header items
    langItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-lang') === lang);
    });
    // Settings panel items
    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    if (langToggleWrapper) langToggleWrapper.setAttribute('data-lang', lang);
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

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => handleLangChange(btn.getAttribute('data-lang')));
  });

  // Removed mobile menu logic

  // Removed resize check for mobile

  topNav.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.nav-item');
    if (!clickedItem) return;

    // Mobile logic removed

    // Update active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    clickedItem.classList.add('active');

    const tabName = clickedItem.getAttribute('data-tab');

    // Breadcrumb logic removed

    // Show/hide the correct panels
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
    }
  });

  // ── Темная тема ─────────────────────────────────────────
  const themeTrigger = document.getElementById('themeDropdownBtn');
  const themeMenu = document.getElementById('themeDropdown');
  const themeOptions = document.querySelectorAll('.theme-option');
  const themeToggle = document.getElementById('themeToggle');

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const updateThemeUI = (theme) => {
    const themeNameEl = document.getElementById('currentThemeName');
    if (themeNameEl) {
      themeNameEl.setAttribute('data-i18n', 'theme_' + theme);
    }
    // Dropdown options
    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-theme') === theme);
    });
    // Settings panel switch
    if (themeToggle) {
      themeToggle.checked = (theme === 'dark');
    }
  };

  updateThemeUI(currentTheme);

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeUI(theme);
    if (typeof updatePageLanguage === 'function') updatePageLanguage();
  };

  themeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    themeMenu.classList.add('hidden');
  });

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => handleThemeChange(opt.getAttribute('data-theme')));
  });

  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      handleThemeChange(e.target.checked ? 'dark' : 'light');
    });
  }

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
      const candidatesHeader = document.querySelector('.candidates-header');
      const candidatesBody = document.querySelector('.candidates-body');

      if (result.success) {
        errorBox.classList.add('hidden');

        bestWrapper.classList.remove('hidden');
        allWrapper.classList.remove('hidden');
        if (candidatesHeader) candidatesHeader.classList.remove('hidden');
        if (candidatesBody) candidatesBody.classList.remove('hidden');

        // The user wants to see all candidate vectors, even if they are identical.
        lastSolutions = result.all_solutions;
        renderResultCards(lastSolutions);

      } else {
        errorBox.innerText = result.error || t('err_unknown');
        errorBox.classList.remove('hidden');
        bestWrapper.classList.add('hidden');
        allWrapper.classList.add('hidden');
        if (candidatesHeader) candidatesHeader.classList.add('hidden');
        if (candidatesBody) candidatesBody.classList.add('hidden');
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

  });

});
