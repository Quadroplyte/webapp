document.addEventListener('DOMContentLoaded', () => {
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

  // Navigation switching
  const navItems = document.querySelectorAll('.nav-item');
  const mainSections = {
    'Оптимизация': ['.config-panel', '#matricesContainer', '#resultContainer'],
    'Документация': ['#docsPanel']
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const text = item.innerText.trim();

      // Hide all main containers
      document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));

      if (text === 'Оптимизация') {
        document.querySelector('.config-panel').classList.remove('hidden');
        if (currentM > 0) document.getElementById('matricesContainer').classList.remove('hidden');
        // results stay hidden until next solve
      } else if (text === 'Документация') {
        document.getElementById('docsPanel').classList.remove('hidden');
      } else if (text === 'Настройки') {
        document.getElementById('settingsPanel').classList.remove('hidden');
      }
    });
  });

  // Theme Toggle Logic
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

  // Build the grid inputs
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

  // Generator handler
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

    matricesContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
  });

  // Solve handler
  solveBtn.addEventListener('click', async () => {
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

      resultContainer.classList.remove('hidden');
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
      solveBtn.innerText = 'Решить задачу';
    }
  });

  // File handling
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
        resultContainer.classList.add('hidden');

      } catch (err) {
        console.error(err);
        alert('Ошибка при чтении файла: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
});
