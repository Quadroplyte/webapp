const translations = {
  ru: {
    // Sidebar & Header
    app_title: "Внедрение оптимального<br>набора СЗИ",
    collapse_panel: "Свернуть панель",
    opt_tab: "Оптимизация",
    doc_tab: "Справка",
    settings_tab: "Настройки",
    open_menu: "Открыть меню",
    breadcrumb_prefix: "Система выбора СЗИ / ",
    lang_ru_short: "РУС",
    lang_en_short: "АНГ",
    theme_dark: "темная",
    theme_light: "светлая",
    theme_pink: "розовая",
    theme_yellow: "желтая",
    theme_green: "зеленая",
    theme_card_title: "Тема оформления",
    theme_color_title: "Акцент интерфейса",
    bg_gradient_title: "Градиент фона",
    bg_gradient_desc: "Выберите три цвета для фона",

    // Input Panel
    data_input_title: "Ввод данных",
    demo_data_title: "Загрузить тестовые данные",
    demo_data_btn: "Демо-данные",
    file_format_title: "Формат файла",
    file_format_btn: "Формат файла",
    load_file_btn: "Загрузить из файла (.txt)",
    manual_input_btn: "Ручной ввод",

    // Config Panel
    config_params_title: "Конфигурация параметров",
    base_values_title: "Базовые значения",
    label_m: "Группы информационных активов",
    label_n: "Средства защиты информации",
    label_lam: "λ",
    lambda_title: "λ",
    create_tables_btn: "Создать таблицы",

    // Matrices Panel
    matrices_data_title: "Ограничения",
    matrix_a_title: "A",
    vector_b_title: "b",
    vector_c_title: "c",
    vector_d_title: "d",
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
    err_empty_field: "Все поля должны быть заполнены!",
    err_invalid_number: "Пожалуйста, введите корректные положительные числа.",
    err_no_solution_found: "Решение не найдено. Проверьте входные данные и бюджеты.",
    err_all_zeros: "Данные не могут состоять только из нулей. Пожалуйста, введите реальные значения.",
    vector_x: "Вектор x",
    best_solution: "Оптимальный",
    val_fx: "Значение F(x",
    chosen_szi: "Выбранные СЗИ",
    none: "Нет",
    candidates_title: "Кандидаты",

    // Docs Panel
    docs_guide_title: "Справка и руководство",
    model_desc_title: "Описание модели",
    model_desc_text: "Система предназначена для оптимального выбора средств защиты информации (СЗИ) при заданных финансовых ограничениях для различных групп активов (ГИА). Модель минимизирует риски, балансируя между суммарным временем обхода и минимальным временем реагирования отдела безопасности самого слабого звена через коэффициент λ.",
    input_params_title: "Параметры ввода",
    param_m_desc: "Количество групп активов (строки матрицы A)",
    param_n_desc: "Количество доступных СЗИ (столбцы матрицы A)",
    param_lam_desc: "Приоритет: 1.0 = фокус на времени обхода, 0.0 = фокус на минимальном времени реагирования",
    param_a_desc: "Стоимость каждого СЗИ для каждой ГИА (m × n)",
    param_b_desc: "Финансовые ограничения для каждой ГИА",
    param_c_desc: "Время обхода для каждого СЗИ",
    param_d_desc: "Минимальное время реагирования отдела безопасности для каждого СЗИ",
    import_format_title: "Формат файла импорта (.txt)",
    import_format_desc: "Каждая строка — одна запись, значения разделяются пробелами:",
    example_file_title: "Пример файла (m=3, n=4)",
    example_guide_intro: "<b>Размерности:</b> Первая строка задает количество групп информационных активов (m=3) и средств защиты информации (n=4).",
    example_guide_matrix: "<b>Матрица A (3×4):</b> Каждое значение — стоимость использования СЗИ для ГИА. Например, '20' в первой строке означает, что второе средство стоит 20 единиц для первой группы активов.",
    example_guide_vectors: "<b>Векторы параметров:</b> Далее идут три вектора: b (финансовые ограничения для 3 ГИА), c (время обхода для 4 СЗИ) и d (минимальное время реагирования отдела безопасности для 4 СЗИ).",
    example_guide_lambda: "<b>Коэффициент λ:</b> Последнее число (от 0.0 до 1.0). Чем выше λ, тем большее значение система придает времени обхода.",

    // Settings Panel
    settings_app_title: "Настройки приложения",
    theme_title: "Тема оформления",
    toggle_theme_desc: "Переключить цветовую схему интерфейса",
    perf_mode_title: "Прозрачность",
    perf_mode_desc: "Включить размытие и прозрачность интерфейса",
    header_trans_title: "Прозрачность заголовка",
    header_trans_desc: "Отдельное управление эффектом стекла для названия системы",
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
    borders_title: "Акцентные границы",
    borders_desc: "Выберите стиль обводки блоков интерфейса",
    borders_off: "Выкл",
    borders_neutral: "Нейтральный",
    borders_accent: "Акцентный",
    preview_title: "Предпросмотр",
    preview_elements: "Элементы управления",
    preview_grid: "Интерактивная сетка",
    button_example: "Кнопка",
    action_example: "Действие",
    param_x: "Параметр X",

    // Modal
    modal_import_title: "Формат файла импорта",
    open_docs_btn: "Открыть справку",

    // Interactive Info
    info_empty: "Выберите ячейку для отображения подробной информации",
    info_gia_num: "ГИА №",
    info_szi_num: "СЗИ №",
    info_cost: "Стоимость (A):",
    info_limit: "Фин. лимит (b):",
    info_hack_time: "Время обхода (c):",
    info_react_time: "Мин. время реагирования СБ (d):"
  },
  en: {
    // Sidebar & Header
    app_title: "Implementation of<br>Optimal ISS Set",
    collapse_panel: "Collapse panel",
    opt_tab: "Optimization",
    doc_tab: "Help",
    settings_tab: "Settings",
    open_menu: "Open menu",
    breadcrumb_prefix: "ISS Selection System / ",
    lang_ru_short: "RUS",
    lang_en_short: "ENG",
    theme_dark: "dark",
    theme_light: "light",
    theme_pink: "pink",
    theme_yellow: "yellow",
    theme_green: "green",
    theme_card_title: "Interface theme",
    theme_color_title: "Interface Accent",
    bg_gradient_title: "Background Gradient",
    bg_gradient_desc: "Pick three colors for the background",

    // Input Panel
    data_input_title: "Data input",
    demo_data_title: "Load test data",
    demo_data_btn: "Demo data",
    file_format_title: "File format",
    file_format_btn: "File format",
    load_file_btn: "Load from file (.txt)",
    manual_input_btn: "Manual input",

    // Config Panel
    config_params_title: "Parameters configuration",
    base_values_title: "Base values",
    label_m: "Information asset groups",
    label_n: "Information security solutions",
    label_lam: "λ",
    lambda_title: "λ",
    create_tables_btn: "Create tables",

    // Matrices Panel
    matrices_data_title: "Constraints",
    matrix_a_title: "A",
    vector_b_title: "b",
    vector_c_title: "c",
    vector_d_title: "d",
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
    err_empty_field: "All fields must be filled!",
    err_invalid_number: "Please enter valid positive numbers.",
    err_no_solution_found: "No solution found. Please check input data and budgets.",
    err_all_zeros: "Data cannot consist of zeros only. Please enter real values.",
    vector_x: "Vector x",
    best_solution: "Optimal",
    val_fx: "Value of F(x",
    chosen_szi: "Chosen ISS",
    none: "None",
    candidates_title: "Candidates",

    // Docs Panel
    docs_guide_title: "Help and Guide",
    model_desc_title: "Model Description",
    model_desc_text: "The system is designed for the optimal selection of information security solutions (ISS) subject to financial constraints for various Information asset groups (IAG). The model minimizes risks, balancing total bypass time and minimum security department response time of the weakest link via the λ coefficient.",
    input_params_title: "Input parameters",
    param_m_desc: "Number of Information asset groups (rows of matrix A)",
    param_n_desc: "Number of available ISS (columns)",
    param_lam_desc: "Priority: 1.0 = focus on bypass time, 0.0 = focus on minimum response time",
    param_a_desc: "Cost of each ISS for each asset group (m × n)",
    param_b_desc: "Financial constraints for each Information asset group (IAG)",
    param_c_desc: "Bypass time for each ISS",
    param_d_desc: "Minimum security department response time for each ISS",
    import_format_title: "Import file format (.txt)",
    import_format_desc: "Each line is one record, values are space-separated:",
    example_file_title: "File example (m=3, n=4)",
    example_guide_intro: "<b>Dimensions:</b> The first line specifies the number of Information asset groups (m=3) and information security solutions (n=4).",
    example_guide_matrix: "<b>Matrix A (3×4):</b> Each value is the cost of utilizing an ISS for an IAG. For example, '20' in the first row means the second tool costs 20 units for the first IAG.",
    example_guide_vectors: "<b>Parameter Vectors:</b> Next are three vectors: b (financial constraints for 3 IAGs), c (bypass time for 4 ISS), and d (minimum response time for 4 ISS).",
    example_guide_lambda: "<b>Coefficient λ:</b> The final value (0.0 to 1.0). Higher λ means the system assigns greater importance to bypass time.",

    // Settings Panel
    settings_app_title: "Application settings",
    theme_title: "Interface theme",
    toggle_theme_desc: "Switch the interface color scheme",
    perf_mode_title: "Transparency",
    perf_mode_desc: "Enable interface blur and transparency",
    header_trans_title: "Header Transparency",
    header_trans_desc: "Independent control of the glass effect for the app title",
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
    borders_title: "Accent Borders",
    borders_desc: "Choose the border style for interface blocks",
    borders_off: "Off",
    borders_neutral: "Neutral",
    borders_accent: "Accent",
    preview_title: "Preview",
    preview_elements: "Control elements",
    preview_grid: "Interactive grid",
    button_example: "Button",
    action_example: "Action",
    param_x: "Parameter X",

    // Modal
    modal_import_title: "Import file format",
    open_docs_btn: "Help",

    // Interactive Info
    info_empty: "Select a cell to show detailed information",
    info_gia_num: "IAG #",
    info_szi_num: "ISS #",
    info_cost: "Cost (A):",
    info_limit: "Fin. limit (b):",
    info_hack_time: "Bypass time (c):",
    info_react_time: "Min Sec Dept Response Time (d):"
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
