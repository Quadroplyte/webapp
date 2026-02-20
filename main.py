import sys
from PyQt6.QtWidgets import QApplication, QWidget

def main():
    # Создание экземпляра приложения. 
    # sys.argv передает аргументы командной строки в Qt.
    app = QApplication(sys.argv)

    # Создание базового виджета (окна)
    window = QWidget()
    window.setWindowTitle('PyQt6 Test')
    window.resize(300, 200)
    
    # Отображение окна на экране
    window.show()

    # Запуск цикла обработки событий (event loop). 
    # sys.exit обеспечивает корректное завершение процесса Python при закрытии окна.
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
    