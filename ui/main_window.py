import sys
import os
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QTableWidget, QTableWidgetItem,
    QHeaderView, QMessageBox, QGroupBox, QSplitter, QSpinBox, QDoubleSpinBox,
    QScrollArea
)
from PyQt6.QtCore import Qt
from core.parser import load_data, format_manual_data
from core.algorithm import run_full_algorithm

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Интеллектуальная система выбора СЗИ")
        self.resize(1200, 800)
        self.data = None
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # 1. Верхняя панель управления (Конфигурация размерности)
        control_layout = QHBoxLayout()
        
        self.btn_load = QPushButton("Загрузить из файла (input.txt)")
        self.btn_load.clicked.connect(self.load_data_file)
        
        control_layout.addWidget(self.btn_load)
        control_layout.addSpacing(20)
        
        control_layout.addWidget(QLabel("Кол-во ГИА (m):"))
        self.spin_m = QSpinBox()
        self.spin_m.setRange(1, 100)
        self.spin_m.setValue(3)
        self.spin_m.setStyleSheet("font-size: 14px;")
        self.spin_m.setMinimumWidth(60) # Делаем шире
        control_layout.addWidget(self.spin_m)
        
        control_layout.addWidget(QLabel("Кол-во СЗИ (n):"))
        self.spin_n = QSpinBox()
        self.spin_n.setRange(1, 100)
        self.spin_n.setValue(5)
        self.spin_n.setStyleSheet("font-size: 14px;")
        self.spin_n.setMinimumWidth(60) # Делаем шире
        control_layout.addWidget(self.spin_n)
        
        control_layout.addWidget(QLabel("Lambda (важность):"))
        self.spin_lam = QDoubleSpinBox()
        self.spin_lam.setRange(0.0, 1.0)
        self.spin_lam.setSingleStep(0.1)
        self.spin_lam.setValue(0.5)
        self.spin_lam.setMinimumWidth(80) # Делаем поле шире
        self.spin_lam.setStyleSheet("font-size: 14px;")
        control_layout.addWidget(self.spin_lam)
        
        self.btn_generate = QPushButton("Сгенерировать таблицы")
        self.btn_generate.clicked.connect(self.generate_tables)
        control_layout.addWidget(self.btn_generate)
        
        control_layout.addStretch()
        
        self.btn_run = QPushButton("Запустить алгоритм", self)
        self.btn_run.setStyleSheet("background-color: #2E7D32; color: white; font-weight: bold; padding: 5px 15px;")
        self.btn_run.clicked.connect(self.run_algorithm)
        control_layout.addWidget(self.btn_run)
        
        main_layout.addLayout(control_layout)
        
        # Разделитель между вводом и результатами
        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)
        
        # 2. Левая часть - Таблицы ввода данных
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(0, 0, 0, 0)
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.tables_layout = QVBoxLayout(scroll_content)
        
        # Инициализация таблиц
        self.table_A = self.create_table("Матрица A (Стоимости СЗИ для ГИА)")
        self.table_b = self.create_table("Вектор b (Бюджеты ГИА)")
        self.table_c = self.create_table("Вектор c (Время взлома)")
        self.table_d = self.create_table("Вектор d (Время реакции)")
        
        self.tables_layout.addWidget(QLabel("<b>Матрица A (Стоимости СЗИ для ГИА)</b>"))
        self.tables_layout.addWidget(self.table_A)
        self.tables_layout.addWidget(QLabel("<b>Вектор b (Бюджеты ГИА)</b>"))
        self.tables_layout.addWidget(self.table_b)
        self.tables_layout.addWidget(QLabel("<b>Вектор c (Время взлома)</b>"))
        self.tables_layout.addWidget(self.table_c)
        self.tables_layout.addWidget(QLabel("<b>Вектор d (Время реакции)</b>"))
        self.tables_layout.addWidget(self.table_d)
        self.tables_layout.addStretch()
        
        scroll.setWidget(scroll_content)
        left_layout.addWidget(scroll)
        splitter.addWidget(left_panel)
        
        # 3. Правая часть - Результаты (только самое важное)
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(0, 0, 0, 0)
        
        group_optimal = QGroupBox("Оптимальная стратегия")
        optimal_layout = QVBoxLayout()
        
        self.label_optimal_f = QLabel("Максимальное значение функции:\n-")
        self.label_optimal_f.setStyleSheet("font-size: 16px; margin-bottom: 10px;")
        
        self.label_optimal_x = QLabel("Оптимальный вектор:\n-")
        self.label_optimal_x.setStyleSheet("font-size: 16px; margin-bottom: 10px;")
        
        self.label_recommended = QLabel("Рекомендуемый набор СЗИ:\n-")
        self.label_recommended.setStyleSheet("font-size: 24px; color: #2E7D32; font-weight: bold;")
        self.label_recommended.setWordWrap(True)
        
        optimal_layout.addWidget(self.label_optimal_f)
        optimal_layout.addWidget(self.label_optimal_x)
        optimal_layout.addWidget(self.label_recommended)
        optimal_layout.addStretch()
        group_optimal.setLayout(optimal_layout)
        
        right_layout.addWidget(group_optimal)
        splitter.addWidget(right_panel)
        
        # Пропорции: 70% на ввод, 30% на вывод
        splitter.setSizes([700, 300])
        
        # Генерируем таблицы по умолчанию
        self.generate_tables()
        
    def create_table(self, title):
        table = QTableWidget()
        # Увеличиваем шрифт в таблицах
        table.setStyleSheet("font-size: 14px;")
        # Ставим компактный размер ячеек по умолчанию
        table.horizontalHeader().setDefaultSectionSize(60) # Увеличил с 50 до 60 из-за шрифта
        table.verticalHeader().setDefaultSectionSize(35) # Увеличил немного
        table.horizontalHeader().setMinimumSectionSize(30)
        table.verticalHeader().setMinimumSectionSize(20)
        return table
        
    def generate_tables(self):
        m = self.spin_m.value()
        n = self.spin_n.value()
        
        # Настройка A
        self.table_A.setRowCount(m)
        self.table_A.setColumnCount(n)
        self.table_A.setVerticalHeaderLabels([f"ГИА {i+1}" for i in range(m)])
        self.table_A.setHorizontalHeaderLabels([f"СЗИ {j+1}" for j in range(n)])
        
        # Настройка b (Теперь горизонтальный вектор)
        self.table_b.setRowCount(1)
        self.table_b.setColumnCount(m)
        self.table_b.setVerticalHeaderLabels(["Бюджет"])
        self.table_b.setHorizontalHeaderLabels([f"ГИА {i+1}" for i in range(m)])
        # Устанавливаем высоту таблицы, чтобы не занимала лишнее место
        self.table_b.setMaximumHeight(65)
        
        # Настройка c
        self.table_c.setRowCount(1)
        self.table_c.setColumnCount(n)
        self.table_c.setVerticalHeaderLabels(["Время"])
        self.table_c.setHorizontalHeaderLabels([f"СЗИ {j+1}" for j in range(n)])
        self.table_c.setMaximumHeight(65)
        
        # Настройка d
        self.table_d.setRowCount(1)
        self.table_d.setColumnCount(n)
        self.table_d.setVerticalHeaderLabels(["Время"])
        self.table_d.setHorizontalHeaderLabels([f"СЗИ {j+1}" for j in range(n)])
        self.table_d.setMaximumHeight(65)
        
        self._clear_results()

    def load_data_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Выберите файл с данными", "", "Text Files (*.txt);;All Files (*)"
        )
        if not file_path:
            return
            
        loaded = load_data(file_path)
        if loaded is None:
            QMessageBox.critical(self, "Ошибка", "Не удалось загрузить данные из файла.")
            return
            
        # Обновляем спинбоксы
        self.spin_m.setValue(loaded['m'])
        self.spin_n.setValue(loaded['n'])
        self.spin_lam.setValue(loaded['lambda'])
        
        self.generate_tables()
        
        # Заполняем таблицы из оригинального файла.
        # Внимание: load_data возвращает УЖЕ ОТСОРТИРОВАННЫЕ данные.
        # Для UI ввода мы хотим загрузить сырые данные ДО алгоритмической сортировки.
        # Поэтому мы прочитаем файл заново, чтобы просто раскидать числа по таблицам.
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]
            
            m, n = list(map(int, lines[0].split()))
            
            for i in range(m):
                row_vals = list(map(float, lines[i+1].split()))
                for j in range(n):
                    self.table_A.setItem(i, j, QTableWidgetItem(str(row_vals[j])))
            
            b_vals = list(map(float, lines[m+1].split()))
            for i in range(m):
                self.table_b.setItem(0, i, QTableWidgetItem(str(b_vals[i]))) # Запись в строку, а не в столбец
                
            c_vals = list(map(float, lines[m+2].split()))
            for j in range(n):
                self.table_c.setItem(0, j, QTableWidgetItem(str(c_vals[j])))
                
            d_vals = list(map(float, lines[m+3].split()))
            for j in range(n):
                self.table_d.setItem(0, j, QTableWidgetItem(str(d_vals[j])))
                
            self._clear_results()
        except Exception as e:
            QMessageBox.critical(self, "Ошибка", f"Ошибка при разборе файла для UI: {e}")
        
    def _read_table_2d(self, table, rows, cols):
        data = []
        for r in range(rows):
            row_data = []
            for c in range(cols):
                item = table.item(r, c)
                if item is None or not item.text().strip():
                    raise ValueError(f"Пустая ячейка в строке {r+1}, столбце {c+1}")
                try:
                    row_data.append(float(item.text().strip()))
                except ValueError:
                    raise ValueError(f"Нечисловое значение '{item.text()}' в строке {r+1}, столбце {c+1}")
            data.append(row_data)
        return data

    def _read_table_1d_col(self, table, rows):
        data = []
        for r in range(rows):
            item = table.item(r, 0)
            if item is None or not item.text().strip():
                raise ValueError(f"Пустая ячейка в строке {r+1}")
            try:
                data.append(float(item.text().strip()))
            except ValueError:
                raise ValueError(f"Нечисловое значение '{item.text()}' в строке {r+1}")
        return data

    def _read_table_1d_row(self, table, cols):
        data = []
        for c in range(cols):
            item = table.item(0, c)
            if item is None or not item.text().strip():
                raise ValueError(f"Пустая ячейка в столбце {c+1}")
            try:
                data.append(float(item.text().strip()))
            except ValueError:
                raise ValueError(f"Нечисловое значение '{item.text()}' в столбце {c+1}")
        return data

    def run_algorithm(self):
        m = self.spin_m.value()
        n = self.spin_n.value()
        lam = self.spin_lam.value()
        
        try:
            A_raw = self._read_table_2d(self.table_A, m, n)
            b_raw = self._read_table_1d_row(self.table_b, m) # Теперь читаем из 1 строки
            c_raw = self._read_table_1d_row(self.table_c, n)
            d_raw = self._read_table_1d_row(self.table_d, n)
        except ValueError as e:
            QMessageBox.warning(self, "Ошибка заполнения", str(e))
            return
            
        self.data = format_manual_data(m, n, A_raw, b_raw, c_raw, d_raw, lam)
        if self.data is None:
            QMessageBox.critical(self, "Ошибка", "Не удалось отформатировать введенные данные.")
            return

        self.btn_run.setEnabled(False)
        self.btn_run.setText("Вычисление...")
        QApplication.processEvents()
        
        try:
            results = run_full_algorithm(self.data)
            
            if "error" in results:
                QMessageBox.warning(self, "Ошибка", results["error"])
                return
                
            self.display_results(results)
        except Exception as e:
            QMessageBox.critical(self, "Ошибка выполнения", f"Произошла ошибка: {str(e)}")
        finally:
            self.btn_run.setEnabled(True)
            self.btn_run.setText("Запустить алгоритм")
            
    def _clear_results(self):
        self.label_optimal_f.setText("Максимальное значение функции:\n-")
        self.label_optimal_x.setText("Оптимальный вектор:\n-")
        self.label_recommended.setText("Рекомендуемый набор СЗИ:\n-")
            
    def display_results(self, results):
        self.label_optimal_f.setText(f"Максимальное значение функции:\n{results['best_F']:.4f}")
        self.label_optimal_x.setText(f"Оптимальный вектор:\n{results['best_x']}")
        
        szi_list = ", ".join(map(str, results["recommended_szi"]))
        self.label_recommended.setText(f"Рекомендуемый набор СЗИ:\n{szi_list}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
