"""
Решатель задачи выбора СЗИ.

В точности реализует алгоритм из документации:
1. Шаг 1: Нахождение вектора x^0. Помещение в множество V.
2. Шаг 2: Нахождение j0.
3. Шаг 3: Набор из j0 - 1 задач о ранце. Получение x^s, приведение к n-мерному вектору и помещение в V.
4. Шаг 4: Выбор оптимального решения из V.
"""

from typing import Dict, Any
import numpy as np
import pulp

def solve_problem(
    m: int, n: int, A: list, b: list, c: list, d: list, lam: float
) -> Dict[str, Any]:
    # Предварительно данные сортируются по убыванию значения d_j.
    # Это позволяет корректно применять математику для j_0 - s и брать минимум
    b_arr = np.array(b)
    c_arr = np.array(c)
    d_arr = np.array(d)
    A_arr = np.array(A)

    # Сортировка по d_j убрана. Используем оригинальный порядок из файла.
    A_sorted = A_arr
    c_sorted = c_arr
    d_sorted = d_arr
    indices = np.arange(n)

    # --- Шаг 1 ---
    # Пусть V - пустое множество.
    V = []
    
    # Решить однокритериальную многомерную задачу о ранце с аддитивным критерием (c)
    prob0 = pulp.LpProblem("Step_1_Knapsack", pulp.LpMaximize)
    x0_vars = [pulp.LpVariable(f"x0_{j}", cat=pulp.LpBinary) for j in range(n)]
    
    prob0 += pulp.lpSum([c_sorted[j] * x0_vars[j] for j in range(n)])
    
    for i in range(m):
        prob0 += pulp.lpSum([A_sorted[i][j] * x0_vars[j] for j in range(n)]) <= b_arr[i]
        
    prob0.solve(pulp.PULP_CBC_CMD(msg=False))
    
    if pulp.LpStatus[prob0.status] != "Optimal":
        return {
            "success": False,
            "error": "Решение базовой задачи не найдено. Проверьте входные данные и бюджеты.",
        }
        
    # Получить оптимальное решение - n-мерный булевый вектор x^0
    x0 = [int(round(float(pulp.value(var)))) for var in x0_vars]
    
    # Поместим его в множество V
    V.append(x0)
    
    # Если \lambda = 1, то вектор x^0 будет оптимальным решением. В этом случае алгоритм окончен.
    if lam == 1.0:
        pass # Алгоритм окончен, переходим к формированию ответа
    else:
        # --- Шаг 2 ---
        # Далее считаем, что \lambda \in (0, 1).
        # По просьбе пользователя алгоритм всегда должен генерировать размерность задачи - 1 ответ.
        # Поэтому мы отбрасываем столбцы начиная с 1 (для x_1) до n-1 (для x_{n-1}).
        # Это эквивалентно установке j0 = n для запуска цикла.
        j0 = n
            
        # --- Шаг 3 ---
        # Набор из j0 - 1 задач.
        # Решить последовательно j0 - 1 задач о ранце.
        for s in range(1, j0):
            # Число СЗИ в s-ой задаче: j0 - s.
            num_vars = j0 - s
            
            prob_s = pulp.LpProblem(f"Knapsack_s_{s}", pulp.LpMaximize)
            xs_vars = [pulp.LpVariable(f"xs_{j}", cat=pulp.LpBinary) for j in range(num_vars)]
            
            # Введем критерии:
            # F^(s)(x) = sum(lam*c[j]*x[j]) (от 1 до j0-s-1) + (lam*c[j0-s] + (1-lam)*d[j0-s])*x[j0-s]
            # В Python индексы от 0 до num_vars - 1. 
            # num_vars - 1 соответствует математическому индексу (j0 - s)
            objective = pulp.lpSum([lam * c_sorted[j] * xs_vars[j] for j in range(num_vars - 1)])
            
            last_idx = num_vars - 1
            objective += (lam * c_sorted[last_idx] + (1 - lam) * d_sorted[last_idx]) * xs_vars[last_idx]
            
            prob_s += objective
            
            # Финансовые ограничения: A_s x <= b
            for i in range(m):
                # A_s получается вычеркиванием последних столбцов
                prob_s += pulp.lpSum([A_sorted[i][j] * xs_vars[j] for j in range(num_vars)]) <= b_arr[i]
                
            prob_s.solve(pulp.PULP_CBC_CMD(msg=False))
            
            if pulp.LpStatus[prob_s.status] == "Optimal":
                # Получить оптимальное решение - (j0 - s)-мерный булевый вектор x^s
                xs = [int(round(float(pulp.value(var)))) for var in xs_vars]
                
                # Привести его к n-мерному булеву вектору, дополнив отсутствующие компоненты справа нулями
                xs_n = xs + [0] * (n - num_vars)
                
                # Поместить в множество V
                V.append(xs_n)

    # --- Шаг 4 ---
    # В итоге множество V будет содержать n-мерные векторы (<= j0).
    # Методом полного перебора выбрать из них оптимальный вектор для критерия F(x).
    
    best_x = None
    best_F = -1.0
    all_results = []
    
    for s_idx, x in enumerate(V):
        f1 = sum(c_sorted[j] * x[j] for j in range(n))
        selected_d = [d_sorted[j] for j in range(n) if x[j] == 1]
        f2 = min(selected_d) if selected_d else 0.0
        
        f_total = lam * f1 + (1 - lam) * f2
        
        # Восстановить оригинальные индексы СЗИ (1-based), так как мы возвращаем их для отображения
        original_szi = sorted(int(indices[i] + 1) for i, val in enumerate(x) if val == 1)
        
        # Восстановить вектор x в оригинальном порядке (до сортировки)
        original_x = [0] * n
        for i, val in enumerate(x):
            original_x[indices[i]] = val
            
        all_results.append({
            "vector_x": original_x,
            "f": float(f_total),
            "szi": original_szi,
            "s_index": s_idx # s_idx=0 это x_0, s_idx=1 это x_1 (отброшен 1 столбец) и т.д.
        })
        
        # Строгое сравнение и поиск максимума по критерию
        if f_total > best_F:
            best_F = f_total
            best_x = original_x

    # Восстановить оригинальные индексы СЗИ для лучшего найденного результата
    best_original_nums = []
    if best_x is not None:
        best_original_nums = sorted(i + 1 for i, val in enumerate(best_x) if val == 1)

    # УДАЛЕНО: all_results.sort(key=lambda item: item["f"], reverse=True)
    # Теперь список идет в порядке: x^0, x^1, x^2...

    return {
        "success": True,
        "vector_x": best_x,
        "optimal_f": best_F,
        "recommended_szi": best_original_nums,
        "all_solutions": all_results
    }
