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
  const solveBtn = document.getElementById('solveBtn');

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

    // Элемент x_0 (индекс 0 в массиве) исключаем из борьбы за "Лучший вариант" и из списка кандидатов.
    // Это начальное состояние, которое просто служит точкой отсчета.
    const candidates = solutions.filter(s => s.s_index !== 0);
    if (candidates.length === 0) return;

    const maxF = Math.max(...candidates.map(s => s.f));
    const bestSolution = candidates.find(s => s.f === maxF);

    const indexStyle = 'line-height:0; position:relative; vertical-align:baseline; top:-0.5em; font-size: 0.7em;';

    const createCard = (sol, isBestHighlight) => {
      const card = document.createElement('div');
      card.className = 'result-card solver-card';
      if (isBestHighlight) {
        card.classList.add('best-solution');
      }

      card.innerHTML = `
          <div style="padding: 0.9rem 1.1rem 0.9rem 1.9rem; border-bottom: 1px solid var(--panel-border); min-height: 4.8rem; display: flex; align-items: center;">
              <div style="display:flex; align-items:center; gap: 1.1rem; width: 100%;">
                  ${isBestHighlight ? '<span style="color:var(--best-card-border); font-weight:700; font-size: 1.25rem; border: 2px solid var(--best-card-border); padding: 5px 12px; border-radius: 6px; white-space: nowrap;">' + t('best_solution') + '</span>' : ''}
                  <span style="font-size: 1.8rem; font-weight: 700; color: ${isBestHighlight ? 'var(--best-card-border)' : 'var(--text-main)'}; line-height: 1.65; flex: 1; word-break: break-all;">
                      ${t('vector_x')}<sup style="${indexStyle}">${sol.s_index - 1}</sup> [${sol.vector_x.join(', ')}]
                  </span>
              </div>
          </div>
          <div class="card-bottom-row">
              <div style="display: flex; align-items: baseline; gap: 0.8rem; flex-wrap: wrap;">
                  <span style="font-size: 1.8rem; color: var(--text-muted); font-weight: 700;">${t('val_fx')}<sup style="${indexStyle}">${sol.s_index - 1}</sup>)</span>
                  <span style="font-size: 1.8rem; font-weight: 700; color: var(--text-main);">${parseFloat(sol.f.toFixed(4))}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0.8rem; flex-wrap: wrap;">
                  <span style="font-size: 1.8rem; color: var(--text-muted); font-weight: 700;">${t('chosen_szi')}:</span>
                  <span style="font-size: 1.8rem; font-weight: 700; color: ${isBestHighlight ? 'var(--best-card-border)' : 'var(--salt-blue-accent)'}; word-break: break-word;">${sol.szi.length > 0 ? sol.szi.join(', ') : t('none')}</span>
              </div>
          </div>
      `;
      return card;
    };

    // 1. Показываем лучший вариант в верхнем блоке
    if (bestSolution) {
      bestWrapper.appendChild(createCard(bestSolution, true));
    }

    // 2. Показываем уникальных кандидатов
    const shownVectors = new Set();
    const bestVectorStr = JSON.stringify(bestSolution?.vector_x);
    if (bestVectorStr) {
      shownVectors.add(bestVectorStr);
    }

    candidates.forEach((sol) => {
      // Проверка по индексу (на всякий случай)
      if (bestSolution && sol.s_index === bestSolution.s_index) return;

      const vStr = JSON.stringify(sol.vector_x);

      // Если этот вектор идентичен оптимальному (по содержанию) - НЕ показываем его в кандидатах
      if (shownVectors.has(vStr)) return;

      // Если F-значение совпадает с оптимальным до 6 знака - скорее всего это дубликат, скрываем
      if (bestSolution && Math.abs(sol.f - bestSolution.f) < 1e-7) {
        if (vStr === bestVectorStr) return;
      }

      shownVectors.add(vStr);
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

  function updatePillSlider(container, instant = false) {
    const slider = container.querySelector('.pill-slider');
    const activeItem = container.querySelector('.pill-item.active');
    if (!slider || !activeItem) return;

    if (instant) {
      slider.style.transition = 'none';
    }

    const leftPos = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;

    slider.style.width = width + 'px';
    slider.style.left = leftPos + 'px';
    slider.style.transform = 'none';

    if (instant) {
      void slider.offsetWidth;
      slider.style.transition = '';
    }
  }

  // ── Global Slider Refresh ──
  const refreshAllSliders = (instant = false) => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.glass-pill-nav').forEach(pill => {
        if (pill.offsetWidth > 0 || pill.offsetHeight > 0) {
          updatePillSlider(pill, instant);
        }
      });
    });
  };

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

      setTimeout(() => {
        refreshAllSliders(true);
      }, 50);
    }
  });

  // Global resize listener for all pill sliders globally, so they never break
  // Global resize listener for all pill sliders globally, so they never break
  window.addEventListener('resize', () => {
    refreshAllSliders();
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

  // ── Темизация (Яркость и Цвет) ──────────────────────────
  const themeItems = document.querySelectorAll('.theme-item');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const themePill = document.querySelector('.theme-pill');
  const glassDropdowns = document.querySelectorAll('.glass-dropdown');

  let currentTheme = localStorage.getItem('appTheme') || 'dark';
  let currentColor = localStorage.getItem('appColor') || 'slate';

  const applyTheme = (theme, enforcePresets = false) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
    currentTheme = theme;

    // --- Dynamic Theme Presets Logic (Only on user manual switch) ---
    if (enforcePresets) {
      if (theme === 'dark') {
        // Accent - 4th color (blue)
        applyColor('blue');
        // Gradient - all 3 slots (slate)
        applyGradient(1, 'slate');
        applyGradient(2, 'slate');
        applyGradient(3, 'slate');
        // Transparency
        applyTransparency(true);
        applyHeaderTransparency(true);
        localStorage.setItem('transparencyMode', 'true');
        localStorage.setItem('headerTransMode', 'true');
      } else {
        // Light mode
        // Accent - 15th color (slate)
        applyColor('slate');
        // Gradient - all 3 slots (slate)
        applyGradient(1, 'slate');
        applyGradient(2, 'slate');
        applyGradient(3, 'slate');
        // Transparency
        applyTransparency(true);
        applyHeaderTransparency(false);
        localStorage.setItem('transparencyMode', 'true');
        localStorage.setItem('headerTransMode', 'false');
      }

      // Common presets for both themes
      applyBorderStyle('neutral');
      updateBgPatternUI('none');
      localStorage.setItem('bgPattern', 'none');

      navbarPos = 'static';
      localStorage.setItem('navbarPos', 'static');
      updateNavbarUI('static');
    }
    // --- End Presets Logic ---

    updateThemeUI(theme);
  };

  const applyColor = (color) => {
    document.documentElement.setAttribute('data-color', color);
    localStorage.setItem('appColor', color);
    currentColor = color;
    updateColorUI(color);
  };

  const updateThemeUI = (theme) => {
    themeItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-theme') === theme);
    });
    if (themePill) updatePillSlider(themePill);

    glassDropdowns.forEach(dropdown => {
      if (!dropdown.classList.contains('theme-dropdown')) return;
      const selectedTextEl = dropdown.querySelector('.selected-theme-text');
      const items = dropdown.querySelectorAll('.glass-dropdown-item');
      items.forEach(item => {
        const itemTheme = item.getAttribute('data-theme');
        if (itemTheme === theme) {
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

    if (typeof updatePageLanguage === 'function') updatePageLanguage();
    requestAnimationFrame(() => refreshSliders());
  };

  const updateColorUI = (color) => {
    // Update preview in the slot
    const accentPreview = document.getElementById('accentPreview');
    if (accentPreview) accentPreview.style.background = paletteColors[color] || '#FFF';

    // Mark as active in the accent popover
    document.querySelectorAll('#accentPopover .popover-swatch').forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-color') === color);
    });

    // Legacy support for any other swatches
    colorSwatches.forEach(swatch => {
      swatch.classList.toggle('active', swatch.getAttribute('data-color') === color);
    });

    if (typeof updatePageLanguage === 'function') updatePageLanguage();
    requestAnimationFrame(() => refreshSliders());
  };

  // ── Gradient Picker Logic ──────────────────────────────
  let gradColor1 = localStorage.getItem('gradColor1') || 'slate';
  let gradColor2 = localStorage.getItem('gradColor2') || 'slate';
  let gradColor3 = localStorage.getItem('gradColor3') || 'slate';

  const paletteColors = {
    pink: '#F472B6', yellow: '#FACC15', green: '#10B981',
    blue: '#3B82F6', indigo: '#6366F1', purple: '#A855F7',
    orange: '#F97316', red: '#EF4444', cyan: '#06B6D4',
    teal: '#14B8A6', lime: '#84CC16', amber: '#F59E0B',
    fuchsia: '#D946EF', rose: '#F43F5E', slate: '#64748B',
    sky: '#0EA5E9', white: '#FFFFFF'
  };

  const applyGradient = (slotIdx, colorName) => {
    const varValue = `var(--pal-${colorName})`;
    document.documentElement.style.setProperty(`--grad-${slotIdx}`, varValue);
    localStorage.setItem(`gradColor${slotIdx}`, colorName);

    // Update preview background color (vibrant palette color)
    const preview = document.getElementById(`gradPreview${slotIdx}`);
    if (preview) {
      if (colorName === 'neutral') {
        preview.style.background = document.documentElement.getAttribute('data-theme') === 'dark' ? '#141414' : '#D1D3D9';
      } else {
        preview.style.background = paletteColors[colorName];
      }
    }

    // Mark as active in popover
    document.querySelectorAll(`#gradPopover${slotIdx} .popover-swatch`).forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-color') === colorName);
    });
  };

  const setupPopover = (idx) => {
    const slot = document.getElementById(`gradSlot${idx}`);
    const popover = document.getElementById(`gradPopover${idx}`);
    if (!slot || !popover) return;

    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = popover.classList.contains('hidden');
      document.querySelectorAll('.color-popover').forEach(p => p.classList.add('hidden'));
      if (isHidden) popover.classList.remove('hidden');
    });

    popover.querySelectorAll('.popover-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = swatch.getAttribute('data-color');
        applyGradient(idx, color);
        popover.classList.add('hidden');
      });
    });
  };

  // ── Accent Color Popover Logic ────────────────────────
  const setupAccentPopover = () => {
    const slot = document.getElementById('accentSlot');
    const popover = document.getElementById('accentPopover');
    if (!slot || !popover) return;

    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = popover.classList.contains('hidden');
      document.querySelectorAll('.color-popover').forEach(p => p.classList.add('hidden'));
      if (isHidden) popover.classList.remove('hidden');
    });

    popover.querySelectorAll('.popover-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = swatch.getAttribute('data-color');
        applyColor(color);
        popover.classList.add('hidden');
      });
    });
  };


  const refreshSliders = () => {
    refreshAllSliders();
  };


  themeItems.forEach(item => {
    item.addEventListener('click', () => applyTheme(item.getAttribute('data-theme'), true));
  });

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => applyColor(swatch.getAttribute('data-color')));
  });

  glassDropdowns.forEach(dropdown => {
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
        if (item.hasAttribute('data-theme')) {
          const theme = item.getAttribute('data-theme');
          applyTheme(theme, true);
        }
        dropdown.classList.remove('open');
      });
    });
  });

  // Close all popovers on document click
  document.addEventListener('click', () => {
    document.querySelectorAll('.color-popover').forEach(p => p.classList.add('hidden'));
  });

  // ── Прозрачность (blur) ─────────────
  const transparencyToggle = document.getElementById('transparencyToggle');
  const headerTransToggle = document.getElementById('headerTransToggle');
  // By default transparency is ON, unless explicitly saved as false
  const transparencyEnabled = localStorage.getItem('transparencyMode') !== 'false';
  const headerTransEnabled = localStorage.getItem('headerTransMode') !== 'false';

  let navbarPos = localStorage.getItem('navbarPos') || 'right';

  const applyTransparency = (enabled) => {
    if (!enabled) {
      document.documentElement.setAttribute('data-no-blur', '');
    } else {
      document.documentElement.removeAttribute('data-no-blur');
    }
    if (transparencyToggle) transparencyToggle.checked = enabled;
  };

  const applyHeaderTransparency = (enabled) => {
    if (!enabled) {
      document.documentElement.setAttribute('data-header-no-blur', '');
    } else {
      document.documentElement.removeAttribute('data-header-no-blur');
    }
    if (headerTransToggle) headerTransToggle.checked = enabled;
  };

  applyTransparency(transparencyEnabled);
  applyHeaderTransparency(headerTransEnabled);

  if (transparencyToggle) {
    transparencyToggle.addEventListener('change', () => {
      const enabled = transparencyToggle.checked;
      localStorage.setItem('transparencyMode', enabled);
      applyTransparency(enabled);
    });
  }

  if (headerTransToggle) {
    headerTransToggle.addEventListener('change', () => {
      const enabled = headerTransToggle.checked;
      localStorage.setItem('headerTransMode', enabled);
      applyHeaderTransparency(enabled);
    });
  }

  // ── Акцентные границы ────────────────
  const borderStylePill = document.querySelector('.borders-style-pill');
  const borderStyleItems = document.querySelectorAll('.border-style-item');
  const currentBorderStyle = localStorage.getItem('accentBorderStyle') || 'neutral';

  const applyBorderStyle = (style) => {
    document.documentElement.setAttribute('data-border-style', style);
    borderStyleItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-style') === style);
    });
    if (borderStylePill) updatePillSlider(borderStylePill);
    localStorage.setItem('accentBorderStyle', style);
  };

  applyBorderStyle(currentBorderStyle);

  borderStyleItems.forEach(item => {
    item.addEventListener('click', () => applyBorderStyle(item.getAttribute('data-style')));
  });

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
  let bgPattern = localStorage.getItem('bgPattern') || 'none';
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
        input.className = 'matrix-cell view-only'; // Start in view-only mode
        input.readOnly = true; // Prevent keyboard input initially
        input.id = `${prefix}_${i}_${j}`;
        input.step = 'any';
        input.value = initVal;

        grid.appendChild(input);
      }
    }
    container.appendChild(grid);
  }

  // Show the data fields section
  const dfw = document.getElementById('dataFieldsWrapper');
  if (dfw) dfw.classList.remove('hidden');
  if (matricesContainer) matricesContainer.classList.remove('hidden');

  // Auto-generate tables when M or N change
  mInput.addEventListener('input', () => {
    const m = parseInt(mInput.value);
    const n = parseInt(nInput.value);
    if (m > 0 && n > 0) {
      currentM = m;
      currentN = n;
      buildMatrix('matrixA_container', currentM, currentN, 'A');
      buildMatrix('vectorB_container', currentM, 1, 'b');
      buildMatrix('vectorC_container', 1, currentN, 'c');
      buildMatrix('vectorD_container', 1, currentN, 'd');
    }
  });

  nInput.addEventListener('input', () => {
    const m = parseInt(mInput.value);
    const n = parseInt(nInput.value);
    if (m > 0 && n > 0) {
      currentM = m;
      currentN = n;
      buildMatrix('matrixA_container', currentM, currentN, 'A');
      buildMatrix('vectorB_container', currentM, 1, 'b');
      buildMatrix('vectorC_container', 1, currentN, 'c');
      buildMatrix('vectorD_container', 1, currentN, 'd');
    }
  });

  // Initial generation
  buildMatrix('matrixA_container', 5, 5, 'A');
  buildMatrix('vectorB_container', 5, 1, 'b');
  buildMatrix('vectorC_container', 1, 5, 'c');
  buildMatrix('vectorD_container', 1, 5, 'd');
  currentM = 5;
  currentN = 5;

  // ── Запуск расчёта ──────────────────────────────────────
  // Хак: Если кликаем по кнопке расчета пока активна матрица, фокус теряется,
  // информационная панель схлопывается, высота страницы меняется, кнопка убегает 
  // из-под курсора и стандартный click не срабатывает. 
  // Этим preventDefault() мы запрещаем браузеру убирать фокус с инпута.
  solveBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

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
        b.push(parseFloat(document.getElementById(`b_${i}_0`).value) || 0);
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

  const loadDataFromText = (content) => {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 5) throw new Error(t('err_invalid_file'));

    const [mStr, nStr] = lines[0].split(/\s+/);
    const m = parseInt(mStr);
    const n = parseInt(nStr);

    mInput.value = m;
    nInput.value = n;
    currentM = m;
    currentN = n;

    buildMatrix('matrixA_container', m, n, 'A');
    buildMatrix('vectorB_container', m, 1, 'b');
    buildMatrix('vectorC_container', 1, n, 'c');
    buildMatrix('vectorD_container', 1, n, 'd');

    // Fill A
    for (let i = 0; i < m; i++) {
      const vals = lines[1 + i].split(/\s+/).map(Number);
      for (let j = 0; j < n; j++) {
        const cell = document.getElementById(`A_${i}_${j}`);
        if (cell) cell.value = vals[j];
      }
    }

    let lineIdx = 1 + m;
    // Fill b
    const bVals = lines[lineIdx++].split(/\s+/).map(Number);
    for (let i = 0; i < m; i++) {
      const cell = document.getElementById(`b_${i}_0`);
      if (cell) cell.value = bVals[i];
    }

    // Fill c
    const cVals = lines[lineIdx++].split(/\s+/).map(Number);
    for (let j = 0; j < n; j++) {
      const cell = document.getElementById(`c_0_${j}`);
      if (cell) cell.value = cVals[j];
    }

    // Fill d
    const dVals = lines[lineIdx++].split(/\s+/).map(Number);
    for (let j = 0; j < n; j++) {
      const cell = document.getElementById(`d_0_${j}`);
      if (cell) cell.value = dVals[j];
    }

    // Fill lam
    lamInput.value = parseFloat(lines[lineIdx]) || 0.5;
    lamInput.dispatchEvent(new Event('input'));

    configPanel.classList.remove('hidden');
    matricesContainer.classList.remove('hidden');
    document.getElementById('dataFieldsWrapper').classList.remove('hidden');
  };

  // ── Импорт данных из файла ──────────────────────────────
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        loadDataFromText(evt.target.result);
      } catch (err) {
        console.error(err);
        alert(t('err_read_file') + ': ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // ── Info Modal & Demo Data ──────────────────────────────
  const infoModal = document.getElementById('infoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const infoBtn = document.getElementById('infoBtn');
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
      const helpTab = document.querySelector('.nav-item[data-tab="Справка"]');
      if (helpTab) {
        helpTab.click(); // Переключаемся на вкладку Справка
      }
      if (infoModal) {
        infoModal.classList.add('hidden'); // Закрываем модалку
      }
    });
  }

  // ── Demo Data ──────────────────────────────
  const demoDataBtn = document.getElementById('demoDataBtn');

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
        buildMatrix('vectorB_container', m, 1, 'b');
        buildMatrix('vectorC_container', 1, n, 'c');
        buildMatrix('vectorD_container', 1, n, 'd');
        for (let i = 0; i < m; i++) {
          const vals = lines[1 + i].split(/\s+/).map(Number);
          for (let j = 0; j < n; j++) {
            document.getElementById(`A_${i}_${j}`).value = vals[j];
          }
        }
        let lineIdx = 1 + m;
        const bVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let i = 0; i < m; i++) document.getElementById(`b_${i}_0`).value = bVals[i];
        const cVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`c_0_${j}`).value = cVals[j];
        const dVals = lines[lineIdx++].split(/\s+/).map(Number);
        for (let j = 0; j < n; j++) document.getElementById(`d_0_${j}`).value = dVals[j];
        lamInput.value = parseFloat(lines[lineIdx]) || 0.5;
        lamInput.dispatchEvent(new Event('input'));
        configPanel.classList.remove('hidden');
        matricesContainer.classList.remove('hidden');
        document.getElementById('dataFieldsWrapper').classList.remove('hidden');
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

    // Recalculate all pill sliders after text widths change due to language switch
    // We use a small timeout to ensure the browser has computed new text widths.
    setTimeout(() => {
      refreshAllSliders(true);
    }, 50);
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

  // ── Интерактивная подсветка связей в матрицах и векторах ──
  let activeEditCell = null;

  document.addEventListener('mousedown', (e) => {
    // If clicking outside the currently active edit cell, make it view-only again
    if (activeEditCell && e.target !== activeEditCell) {
      activeEditCell.classList.add('view-only');
      activeEditCell.readOnly = true;
      activeEditCell = null;
    }
  });

  matricesContainer.addEventListener('mousedown', (e) => {
    if (!e.target.classList.contains('matrix-cell')) return;

    if (e.target.classList.contains('view-only')) {
      // If the cell is NOT currently focused, this is the FIRST click.
      // Prevent default to avoid showing text caret, but manually focus.
      if (document.activeElement !== e.target) {
        e.preventDefault();
        e.target.focus();
      } else {
        // If it IS already focused, this is the SECOND click. Let default behavior happen (caret appears)
        e.target.classList.remove('view-only');
        e.target.readOnly = false;
        activeEditCell = e.target;
      }
    }
  });

  matricesContainer.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('matrix-cell')) return;

    // Очищаем старую подсветку
    document.querySelectorAll('.matrix-cell.highlight-connection, .matrix-cell.highlight-source')
      .forEach(el => {
        el.classList.remove('highlight-connection');
        el.classList.remove('highlight-source');
      });

    e.target.classList.add('highlight-source');

    const idParts = e.target.id.split('_'); // формат: A_i_j, b_i_0, c_0_j, d_0_j
    if (idParts.length !== 3) return;

    const prefix = idParts[0];
    const row = parseInt(idParts[1]);
    const col = parseInt(idParts[2]);

    if (prefix === 'A') {
      // 1. При выборе в матрице A:
      // В векторе b выделяем элемент в той же строке
      const bCell = document.getElementById(`b_${row}_0`);
      if (bCell) bCell.classList.add('highlight-connection');

      // В векторах c и d выделяем элемент в том же столбце
      const cCell = document.getElementById(`c_0_${col}`);
      const dCell = document.getElementById(`d_0_${col}`);
      if (cCell) cCell.classList.add('highlight-connection');
      if (dCell) dCell.classList.add('highlight-connection');

    } else if (prefix === 'b') {
      // 2. При выборе в векторе b:
      // В матрице A выделяем всю строку row, векторы c/d не трогаем
      for (let j = 0; j < currentN; j++) {
        const aCell = document.getElementById(`A_${row}_${j}`);
        if (aCell) aCell.classList.add('highlight-connection');
      }

    } else if (prefix === 'c' || prefix === 'd') {
      // 3. При выборе в векторе c или d:
      // В матрице A выделяем весь столбец col, вектор b не трогаем
      for (let i = 0; i < currentM; i++) {
        const aCell = document.getElementById(`A_${i}_${col}`);
        if (aCell) aCell.classList.add('highlight-connection');
      }

      // Также выделяем соответствующую ячейку в другом векторе (c или d)
      const otherPrefix = prefix === 'c' ? 'd' : 'c';
      const otherCell = document.getElementById(`${otherPrefix}_0_${col}`);
      if (otherCell) otherCell.classList.add('highlight-connection');
    }
  });

  matricesContainer.addEventListener('focusout', (e) => {
    if (!e.target.classList.contains('matrix-cell')) return;
    // Снимаем подсветку при потере фокуса
    document.querySelectorAll('.matrix-cell.highlight-connection, .matrix-cell.highlight-source')
      .forEach(el => {
        el.classList.remove('highlight-connection');
        el.classList.remove('highlight-source');
      });
  });

  // ── Синхронизированный скролл ──
  const syncScroll = (source, targets, prop) => {
    source.addEventListener('scroll', () => {
      if (source.dataset.ignoreScroll) {
        source.dataset.ignoreScroll = '';
        return;
      }
      targets.forEach(target => {
        if (target && target[prop] !== source[prop]) {
          target.dataset.ignoreScroll = 'true';
          target[prop] = source[prop];
        }
      });
    });
  };

  const aCont = document.getElementById('matrixA_container');
  const bCont = document.getElementById('vectorB_container');
  const cCont = document.getElementById('vectorC_container');
  const dCont = document.getElementById('vectorD_container');

  if (aCont && bCont && cCont && dCont) {
    // Вертикальный скролл (A <-> b)
    syncScroll(aCont, [bCont], 'scrollTop');
    syncScroll(bCont, [aCont], 'scrollTop');

    // Горизонтальный скролл (A <-> c <-> d)
    syncScroll(aCont, [cCont, dCont], 'scrollLeft');
    syncScroll(cCont, [aCont, dCont], 'scrollLeft');
    syncScroll(dCont, [aCont, cCont], 'scrollLeft');
  }

  // ── Исправление бага браузера со скроллом при zoom ──
  document.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
      const aCont = document.getElementById('matrixA_container');
      const bCont = document.getElementById('vectorB_container');
      const cCont = document.getElementById('vectorC_container');
      const dCont = document.getElementById('vectorD_container');

      // Сохраняем все позиции скроллов до фокуса
      const tops = {
        a: aCont ? aCont.scrollTop : 0, b: bCont ? bCont.scrollTop : 0,
        c: cCont ? cCont.scrollTop : 0, d: dCont ? dCont.scrollTop : 0,
        w: window.scrollY
      };
      const lefts = {
        a: aCont ? aCont.scrollLeft : 0, b: bCont ? bCont.scrollLeft : 0,
        c: cCont ? cCont.scrollLeft : 0, d: dCont ? dCont.scrollLeft : 0,
        w: window.scrollX
      };

      e.preventDefault();
      e.target.focus({ preventScroll: true });
      setTimeout(() => e.target.select(), 0);

      const restore = () => {
        if (aCont && aCont.scrollTop !== tops.a) aCont.scrollTop = tops.a;
        if (bCont && bCont.scrollTop !== tops.b) bCont.scrollTop = tops.b;
        if (cCont && cCont.scrollTop !== tops.c) cCont.scrollTop = tops.c;
        if (dCont && dCont.scrollTop !== tops.d) dCont.scrollTop = tops.d;

        if (aCont && aCont.scrollLeft !== lefts.a) aCont.scrollLeft = lefts.a;
        if (bCont && bCont.scrollLeft !== lefts.b) bCont.scrollLeft = lefts.b;
        if (cCont && cCont.scrollLeft !== lefts.c) cCont.scrollLeft = lefts.c;
        if (dCont && dCont.scrollLeft !== lefts.d) dCont.scrollLeft = lefts.d;

        if (window.scrollY !== tops.w || window.scrollX !== lefts.w) {
          window.scrollTo(lefts.w, tops.w);
        }
      };

      restore();
      requestAnimationFrame(restore);
      setTimeout(restore, 10);
    }
  });

  // Mockup Interactivity for Settings Preview Matrix
  window.addEventListener('mousedown', (e) => {
    const previewCell = e.target.closest('.settings-preview-area .matrix-cell');
    if (previewCell) {
      const grid = previewCell.closest('.matrix-grid');
      const cells = Array.from(grid.querySelectorAll('.matrix-cell'));
      const index = cells.indexOf(previewCell);
      const row = Math.floor(index / 20);
      const col = index % 20;

      cells.forEach((c, idx) => {
        c.classList.remove('highlight-source', 'highlight-connection');
        const r = Math.floor(idx / 20);
        const c_idx = idx % 20;
        if (idx === index) {
          c.classList.add('highlight-source');
        } else if (r === row || c_idx === col) {
          c.classList.add('highlight-connection');
        }
      });
    }
  });

  // ── Sync Range and Number Inputs ──
  const syncInputs = (rangeId, numId) => {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    if (!range || !num) return;

    range.addEventListener('input', () => {
      num.value = range.value;
      num.dispatchEvent(new Event('input'));
    });

    num.addEventListener('input', () => {
      range.value = num.value;
    });
  };

  syncInputs('lam_range', 'lam_input');

  // ── Initial Apply (Restored State) ──────────────────────────
  // Ensure all definitions are loaded before initial calls
  applyGradient(1, gradColor1);
  applyGradient(2, gradColor2);
  applyGradient(3, gradColor3);
  setupPopover(1);
  setupPopover(2);
  setupPopover(3);
  setupAccentPopover();

  // Ensure the UI matches the initial color
  updateColorUI(document.documentElement.getAttribute('data-color') || 'yellow');

  // Initial Apply Theme & Color (Restore saved state, don't enforce presets)
  applyTheme(currentTheme, false);
  applyColor(currentColor);

});
