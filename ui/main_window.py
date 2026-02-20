import sys
import os
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QTextEdit, QTableWidget, QTableWidgetItem,
    QHeaderView, QMessageBox, QGroupBox, QSplitter
)
from PyQt6.QtCore import Qt
from core.parser import load_data
from core.algorithm import run_full_algorithm

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Интеллектуальная система выбора СЗИ")
        self.resize(1000, 700)
        self.data = None
        
        # Основной виджет и layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # Верхняя панель управления
        control_layout = QHBoxLayout()
        self.btn_load = QPushButton("Загрузить данные (input.txt)")
        self.btn_load.clicked.connect(self.load_data_file)
        self.btn_run = QPushButton("Запустить алгоритм")
        self.btn_run.clicked.connect(self.run_algorithm)
        self.btn_run.setEnabled(False)
        
        control_layout.addWidget(self.btn_load)
        control_layout.addWidget(self.btn_run)
        control_layout.addStretch()
        main_layout.addLayout(control_layout)
        
        # Разделитель для левой (данные) и правой (результаты) частей
        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)
        
        # Левая часть - Данные модели
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(0, 0, 0, 0)
        
        group_data = QGroupBox("Математическая модель (Входные данные)")
        group_layout = QVBoxLayout()
        self.text_data = QTextEdit()
        self.text_data.setReadOnly(True)
        self.text_data.setStyleSheet("font-family: Consolas, monospace;")
        group_layout.addWidget(self.text_data)
        group_data.setLayout(group_layout)
        left_layout.addWidget(group_data)
        splitter.addWidget(left_panel)
        
        # Правая часть - Результаты
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.setContentsMargins(0, 0, 0, 0)
        
        group_results = QGroupBox("Результаты (Множество кандидатов V)")
        results_layout = QVBoxLayout()
        self.table_results = QTableWidget()
        self.table_results.setColumnCount(5)
        self.table_results.setHorizontalHeaderLabels([
            "Кандидат", "Вектор (x)", "F1 (Взлом)", "F2 (Реакция)", "Свертка F"
        ])
        header = self.table_results.horizontalHeader()
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        results_layout.addWidget(self.table_results)
        group_results.setLayout(results_layout)
        
        # Вывод оптимального решения
        group_optimal = QGroupBox("Оптимальная стратегия")
        optimal_layout = QVBoxLayout()
        self.label_optimal_f = QLabel("Максимальное значение функции: -")
        self.label_optimal_x = QLabel("Оптимальный вектор: -")
        self.label_recommended = QLabel("<b>Рекомендуемый набор СЗИ: -</b>")
        self.label_recommended.setStyleSheet("font-size: 14px; color: #2E7D32;")
        optimal_layout.addWidget(self.label_optimal_f)
        optimal_layout.addWidget(self.label_optimal_x)
        optimal_layout.addWidget(self.label_recommended)
        group_optimal.setLayout(optimal_layout)
        
        right_layout.addWidget(group_results)
        right_layout.addWidget(group_optimal)
        splitter.addWidget(right_panel)
        
        # Устанавливаем пропорции сплиттера (30% на данные, 70% на результаты)
        splitter.setSizes([300, 700])
        
    def load_data_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Выберите файл с данными", "", "Text Files (*.txt);;All Files (*)"
        )
        if not file_path:
            return
            
        self.data = load_data(file_path)
        if self.data is None:
            QMessageBox.critical(self, "Ошибка", "Не удалось загрузить данные из файла.")
            return
            
        self.display_data_info()
        self.btn_run.setEnabled(True)
        
        # Очистка предыдущих результатов
        self.table_results.setRowCount(0)
        self.label_optimal_f.setText("Максимальное значение функции: -")
        self.label_optimal_x.setText("Оптимальный вектор: -")
        self.label_recommended.setText("<b>Рекомендуемый набор СЗИ: -</b>")
        
    def display_data_info(self):
        d = self.data
        info = f"Размерность задачи:\n"
        info += f"ГИА (m): {d['m']}, СЗИ (n): {d['n']}\n"
        info += f"Коэффициент lambda: {d['lambda']}\n\n"
        
        info += f"Вектор c (время взлома):\n{d['c']}\n\n"
        info += f"Вектор d (время реагирования):\n{d['d']}\n\n"
        info += f"Вектор b (бюджеты):\n{d['b']}\n\n"
        
        info += "Матрица A (стоимости):\n"
        for row in d['A']:
            info += " ".join(f"{val:6.0f}" for val in row) + "\n"
            
        self.text_data.setText(info)
        
    def run_algorithm(self):
        if not self.data:
            return
            
        self.btn_run.setEnabled(False)
        self.btn_run.setText("Вычисление...")
        QApplication.processEvents() # Обновляем UI
        
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
            
    def display_results(self, results):
        table_data = results["table"]
        self.table_results.setRowCount(len(table_data))
        
        for row, item in enumerate(table_data):
            self.table_results.setItem(row, 0, QTableWidgetItem(item["candidate"]))
            self.table_results.setItem(row, 1, QTableWidgetItem(str(item["vector"])))
            self.table_results.setItem(row, 2, QTableWidgetItem(str(item["f1"])))
            self.table_results.setItem(row, 3, QTableWidgetItem(str(item["f2"])))
            
            # Выделяем оптимальную строку
            item_f = QTableWidgetItem(str(item["f"]))
            if item["f"] == results["best_F"]:
                item_f.setBackground(Qt.GlobalColor.green)
            self.table_results.setItem(row, 4, item_f)
            
        self.label_optimal_f.setText(f"Максимальное значение функции: {results['best_F']:.4f}")
        self.label_optimal_x.setText(f"Оптимальный вектор: {results['best_x']}")
        
        szi_list = ", ".join(map(str, results["recommended_szi"]))
        self.label_recommended.setText(f"<b>Рекомендуемый набор СЗИ: {szi_list}</b>")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
