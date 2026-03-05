const translations = {
  ru: {
    // Sidebar & Header
    app_title: "Внедрение оптимальной<br>совокупности СЗИ",
    collapse_panel: "Свернуть панель",
    opt_tab: "Оптимизация",
    doc_tab: "Справка",
    settings_tab: "Настройки",
    open_menu: "Открыть меню",
    breadcrumb_prefix: "Система выбора СЗИ / ",
    lang_ru_short: "РУ",
    lang_en_short: "АНГ",
    theme_dark: "темная",
    theme_light: "светлая",

    // Input Panel
    data_input_title: "Ввод данных",
    demo_data_title: "Загрузить тестовые данные",
    demo_data_btn: "Демо-данные",
    file_format_title: "Формат файла",
    file_format_btn: "Инфо о формате",
    load_file_btn: "Загрузить из файла (.txt)",
    manual_input_btn: "Ручной ввод",

    // Config Panel
    config_params_title: "Конфигурация параметров",
    base_values_title: "Базовые значения",
    label_m: "ГИА",
    label_n: "СЗИ",
    label_lam: "λ",
    lambda_title: "Приоритет",
    create_tables_btn: "Создать таблицы",

    // Matrices Panel
    matrices_data_title: "Ограничения",
    matrix_a_title: "Матрица A",
    vector_b_title: "Вектор b",
    vector_c_title: "Вектор c",
    vector_d_title: "Вектор d",
    solve_btn: "Запустить расчет решения",
    solving_btn: "Вычисление...",

    // Results Panel
    results_title: "Результаты расчетов",
    err_dimensions: "Размеры должны быть больше 0!",
    err_no_data: "Пожалуйста, сначала сгенерируйте матрицу или загрузите данные из файла.",
    err_unknown: "Произошла неизвестная ошибка.",
    err_server: "Ошибка запроса к серверу.",
    err_invalid_file: "Неверный формат файла",
    err_read_file: "Ошибка при чтении файла: ",
    err_demo_data: "Ошибка при установке демо-данных: ",
    vector_x: "Вектор x",
    best_solution: "Лучший",
    val_fx: "Значение F(x",
    chosen_szi: "Выбранные СЗИ",
    none: "Нет",
    candidates_title: "Кандидаты",

    // Docs Panel
    docs_guide_title: "Справка и руководство",
    model_desc_title: "Описание модели",
    model_desc_text: "Система предназначена для оптимального выбора средств защиты информации (СЗИ) при заданных бюджетных ограничениях для различных групп активов (ГИА). Модель минимизирует риски, балансируя между суммарным временем взлома и временем реакции самого слабого звена через коэффициент λ.",
    input_params_title: "Параметры ввода",
    param_m_desc: "Количество групп активов (строки матрицы A)",
    param_n_desc: "Количество доступных СЗИ (столбцы)",
    param_lam_desc: "Приоритет: 1.0 = фокус на времени взлома, 0.0 = фокус на реакции",
    param_a_desc: "Стоимость каждого СЗИ для каждой ГИА (m × n)",
    param_b_desc: "Бюджетный лимит для каждой ГИА",
    param_c_desc: "Время взлома для каждого СЗИ",
    param_d_desc: "Время реакции для каждого СЗИ",
    import_format_title: "Формат файла импорта (.txt)",
    import_format_desc: "Каждая строка — одна запись, значения разделяются пробелами:",
    example_file_title: "Пример файла (m=3, n=4)",
    example_guide_intro: "<b>Размерности:</b> Первая строка задает количество групп информационных активов (m=3) и средств защиты информации (n=4).",
    example_guide_matrix: "<b>Матрица A (3×4):</b> Каждое значение — стоимость использования СЗИ для ГИА. Например, '20' в первой строке означает, что второе средство стоит 20 единиц для первой группы активов.",
    example_guide_vectors: "<b>Векторы параметров:</b> Далее идут три вектора: b (бюджеты для 3 ГИА), c (время взлома для 4 СЗИ) и d (время реакции для 4 СЗИ).",
    example_guide_lambda: "<b>Коэффициент λ:</b> Последнее число (от 0.0 до 1.0). Чем выше λ, тем большее значение система придает фактору времени взлома. При λ=0.5 соблюдается баланс.",

    // Settings Panel
    settings_app_title: "Настройки приложения",
    theme_title: "Тема оформления",
    toggle_theme_desc: "Переключить цветовую схему интерфейса",
    perf_mode_title: "Режим производительности",
    perf_mode_desc: "Отключить размытие и прозрачность (повышает быстродействие)",
    navbar_pos_title: "Позиция панели навигации",
    navbar_pos_desc: "Где располагается панель при прокрутке страницы",
    nav_pos_static: "Статично",
    nav_pos_static_m: "В самом низу",
    nav_pos_center: "По центру",
    nav_pos_center_m: "По центру экрана",
    nav_pos_right: "Справа",
    lang_title: "Язык интерфейса",
    lang_desc: "Выберите язык приложения",
    bg_pattern_title: "Орнамент фона",
    bg_pattern_desc: "Выберите узор заднего фона",
    pattern_dots: "Точки",
    pattern_plus: "Плюсики",
    pattern_cross: "Крестики",
    pattern_none: "Нет",

    // Modal
    modal_import_title: "Формат файла импорта",
    open_docs_btn: "Открыть справку"
  },
  en: {
    // Sidebar & Header
    app_title: "Implementation of<br>Optimal ISS",
    collapse_panel: "Collapse panel",
    opt_tab: "Optimization",
    doc_tab: "Help",
    settings_tab: "Settings",
    open_menu: "Open menu",
    breadcrumb_prefix: "ISS Selection System / ",
    lang_ru_short: "RU",
    lang_en_short: "EN",
    theme_dark: "dark",
    theme_light: "light",

    // Input Panel
    data_input_title: "Data input",
    demo_data_title: "Load test data",
    demo_data_btn: "Demo data",
    file_format_title: "File format",
    file_format_btn: "Format info",
    load_file_btn: "Load from file (.txt)",
    manual_input_btn: "Manual input",

    // Config Panel
    config_params_title: "Parameters configuration",
    base_values_title: "Base values",
    label_m: "Assets",
    label_n: "Protection tools",
    label_lam: "λ",
    lambda_title: "Priority",
    create_tables_btn: "Create tables",

    // Matrices Panel
    matrices_data_title: "Constraints",
    matrix_a_title: "Matrix A",
    vector_b_title: "Vector b",
    vector_c_title: "Vector c",
    vector_d_title: "Vector d",
    solve_btn: "Run solution calculation",
    solving_btn: "Calculating...",

    // Results Panel
    results_title: "Calculation results",
    err_dimensions: "Dimensions must be greater than 0!",
    err_no_data: "Please generate a matrix or load data from a file first.",
    err_unknown: "An unknown error occurred.",
    err_server: "Server request error.",
    err_invalid_file: "Invalid file format",
    err_read_file: "Error reading file: ",
    err_demo_data: "Error setting demo data: ",
    vector_x: "Vector x",
    best_solution: "Best",
    val_fx: "Value of F(x",
    chosen_szi: "Chosen ISS",
    none: "None",
    candidates_title: "Candidates",

    // Docs Panel
    docs_guide_title: "Help and Guide",
    model_desc_title: "Description of the model",
    model_desc_text: "The system is designed for the optimal selection of information security solutions (ISS) subject to budget constraints for various asset groups (AG). The model minimizes risks, balancing total hacking time and reaction time of the weakest link via the λ coefficient.",
    input_params_title: "Input parameters",
    param_m_desc: "Number of asset groups (rows of matrix A)",
    param_n_desc: "Number of available ISS (columns)",
    param_lam_desc: "Priority: 1.0 = focus on hack time, 0.0 = focus on reaction",
    param_a_desc: "Cost of each ISS for each asset group (m × n)",
    param_b_desc: "Budget limit for each asset group",
    param_c_desc: "Hack time for each ISS",
    param_d_desc: "Reaction time for each ISS",
    import_format_title: "Import file format (.txt)",
    import_format_desc: "Each line is one record, values are space-separated:",
    example_file_title: "File example (m=3, n=4)",
    example_guide_intro: "<b>Dimensions:</b> The first line specifies the number of Asset Groups (m=3) and ISS (n=4).",
    example_guide_matrix: "<b>Matrix A (3×4):</b> Each value is the cost of utilizing an ISS for an AG. For example, '20' in the first row means the second tool costs 20 units for the first AG.",
    example_guide_vectors: "<b>Parameter Vectors:</b> Next are three vectors: b (budgets for 3 AGs), c (hacking time for 4 ISS), and d (reaction time for 4 ISS).",
    example_guide_lambda: "<b>Coefficient λ:</b> The final value (0.0 to 1.0). Higher λ means the system assigns greater importance to the hacking time risk factor. λ=0.5 means a balanced approach.",

    // Settings Panel
    settings_app_title: "Application settings",
    theme_title: "Interface theme",
    toggle_theme_desc: "Switch the interface color scheme",
    perf_mode_title: "Performance Mode",
    perf_mode_desc: "Disable blur and transparency (improves speed)",
    navbar_pos_title: "Navbar Position",
    navbar_pos_desc: "How the navigation bar behaves when scrolling",
    nav_pos_static: "Static",
    nav_pos_static_m: "Bottom edge",
    nav_pos_center: "Center",
    nav_pos_center_m: "Center bottom",
    nav_pos_right: "Stay Right",
    lang_title: "Interface language",
    lang_desc: "Select application language",
    bg_pattern_title: "Background Pattern",
    bg_pattern_desc: "Select the background decoration pattern",
    pattern_dots: "Dots",
    pattern_plus: "Pluses",
    pattern_cross: "Crosses",
    pattern_none: "None",

    // Modal
    modal_import_title: "Import file format",
    open_docs_btn: "Open documentation"
  }
};

let currentLang = localStorage.getItem('appLang') || 'ru';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    updatePageLanguage();
  }
}

function t(key) {
  const langData = translations[currentLang] || translations['ru'];
  return langData[key] || key;
}

function updatePageLanguage() {
  document.documentElement.lang = currentLang;

  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });

  // Update titles of elements with data-i18n-title
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  // Fire custom event so script.js can update things like breadcrumbs
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: currentLang }));
}

// Initial update
document.addEventListener('DOMContentLoaded', () => {
  updatePageLanguage();
});
