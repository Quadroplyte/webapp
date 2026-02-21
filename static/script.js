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
  const generateBtn = document.getElementById('generateBtn');
  const solveBtn = document.getElementById('solveBtn');

  const matricesContainer = document.getElementById('matricesContainer');
  const resultContainer = document.getElementById('resultContainer');
  const errorBox = document.getElementById('errorBox');

  let currentM = 0;
  let currentN = 0;

  // ── Переключение навигации ───────────────────────────────
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
  const sideNav = document.querySelector('.side-nav');
  const breadcrumb = document.querySelector('.breadcrumb');

  // Sidebar Collapse (Desktop)
  const updateSidebarIcon = () => {
    const icon = sidebarToggle.querySelector('svg');
    if (sidebar.classList.contains('collapsed')) {
      icon.style.transform = 'rotate(180deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  };

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    updateSidebarIcon();
  });

  // Mobile Menu Logic
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    sidebarBackdrop.classList.add('active');
  });

  const closeMobileMenu = () => {
    sidebar.classList.remove('mobile-open');
    sidebarBackdrop.classList.remove('active');
  };

  sidebarBackdrop.addEventListener('click', closeMobileMenu);

  // Automatic Behavior on Resize
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      sidebar.classList.add('collapsed');
    } else {
      // On larger screens, remove the mobile-open state if browser was resized
      closeMobileMenu();
    }
    updateSidebarIcon();
  };

  window.addEventListener('resize', handleResize);
  // Initial check
  handleResize();

  sideNav.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.nav-item');
    if (!clickedItem) return;

    // On mobile, close menu after clicking a link
    if (window.innerWidth < 1024) {
      closeMobileMenu();
    }

    // Update active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    clickedItem.classList.add('active');

    const tabName = clickedItem.getAttribute('data-tab');

    // Update breadcrumb
    if (breadcrumb && tabName) {
      breadcrumb.innerHTML = 'Система выбора СЗИ / <b>' + tabName + '</b>';
    }

    // Show/hide the correct panels
    const docsPanel = document.getElementById('docsPanel');
    const settingsPanel = document.getElementById('settingsPanel');
    const optimizationPanels = [document.querySelector('.config-panel'), matricesContainer, resultContainer];

    if (tabName === 'Оптимизация') {
      docsPanel.classList.add('hidden');
      settingsPanel.classList.add('hidden');
      optimizationPanels.forEach(p => p && p.classList.remove('hidden'));
    } else if (tabName === 'Документация') {
      optimizationPanels.forEach(p => p && p.classList.add('hidden'));
      settingsPanel.classList.add('hidden');
      docsPanel.classList.remove('hidden');
    } else if (tabName === 'Настройки') {
      optimizationPanels.forEach(p => p && p.classList.add('hidden'));
      docsPanel.classList.add('hidden');
      settingsPanel.classList.remove('hidden');
    }
  });

  // ── Темная тема ─────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme');

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
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

  // ── Генерация матрицы ───────────────────────────────────
  generateBtn.addEventListener('click', () => {
    currentM = parseInt(mInput.value);
    currentN = parseInt(nInput.value);

    if (currentM <= 0 || currentN <= 0) {
      alert('Размеры должны быть больше 0!');
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
      errorBox.innerText = 'Пожалуйста, сначала сгенерируйте матрицу или загрузите данные из файла.';
      errorBox.classList.remove('hidden');
      return;
    }

    solveBtn.disabled = true;
    solveBtn.innerText = 'Вычисление...';

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

      // Show the result cards area now that we have data
      document.getElementById('resultCardsWrapper').classList.remove('hidden');
      if (result.success) {
        errorBox.classList.add('hidden');
        document.getElementById('res_f').innerText = result.optimal_f.toFixed(4);
        document.getElementById('res_szi').innerText = result.recommended_szi.join(', ') || 'Нет';

        // Draw x vector
        const xContainer = document.getElementById('res_x_container');
        xContainer.innerHTML = '';
        result.vector_x.forEach((val, idx) => {
          const box = document.createElement('div');
          box.className = `x-box ${val === 1 ? 'active' : ''}`;
          box.title = `СЗИ ${idx + 1}`;
          box.innerText = val;
          xContainer.appendChild(box);
        });

      } else {
        errorBox.innerText = result.error || 'Произошла неизвестная ошибка.';
        errorBox.classList.remove('hidden');

        document.getElementById('res_f').innerText = '-';
        document.getElementById('res_szi').innerText = '-';
        document.getElementById('res_x_container').innerHTML = '';
      }

    } catch (err) {
      console.error(err);
      errorBox.innerText = 'Ошибка запроса к серверу.';
      errorBox.classList.remove('hidden');
      resultContainer.classList.remove('hidden');
    } finally {
      solveBtn.disabled = false;
      solveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Запустить расчет решения`;
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

      if (lines.length < 5) return alert('Неверный формат файла');

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

        matricesContainer.classList.remove('hidden');
        document.getElementById('dataFieldsWrapper').classList.remove('hidden');

      } catch (err) {
        console.error(err);
        alert('Ошибка при чтении файла: ' + err.message);
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

        matricesContainer.classList.remove('hidden');
        document.getElementById('dataFieldsWrapper').classList.remove('hidden');

        // Hide modal
        infoModal.classList.add('hidden');
      } catch (err) {
        console.error(err);
        alert('Ошибка при установке демо-данных: ' + err.message);
      }
    });
  }
});
