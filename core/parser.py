import numpy as np

def load_data(file_path):
    """
    Парсит файл с исходными данными для задачи о ранце.
    Ожидаемый формат:
    1 строка: m (кол-во ГИА) n (кол-во СЗИ)
    m строк: матрица A (стоимости)
    1 строка: вектор b (бюджеты для каждой ГИА)
    1 строка: вектор c (время взлома)
    1 строка: вектор d (время реагирования)
    1 строка: lambda (коэффициент важности)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Читаем все строки и убираем пустые
            lines = [line.strip() for line in f.readlines() if line.strip()]
            
        m, n = list(map(int, lines[0].split()))
        
        matrix_a_data = []
        for i in range(1, m + 1):
            matrix_a_data.append(list(map(float, lines[i].split())))
        A = np.array(matrix_a_data)
        
        line_idx = m + 1
        b = np.array(list(map(float, lines[line_idx].split())))
        
        line_idx += 1
        c = np.array(list(map(float, lines[line_idx].split())))
        
        line_idx += 1
        d = np.array(list(map(float, lines[line_idx].split())))
        
        line_idx += 1
        lam = float(lines[line_idx])

        # Сортируем индексы по убыванию d_j 
        indices = np.argsort(d)[::-1]
        
        return {
            "m": m,
            "n": n,
            "A": A[:, indices], # Переставляем столбцы матрицы
            "b": b,
            "c": c[indices],    # Переставляем элементы векторов
            "d": d[indices],
            "lambda": lam,
            "original_indices": indices # Сохраняем для обратной конвертации
        }

    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return None
