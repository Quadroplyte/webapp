"""
Решатель задачи выбора СЗИ (средств защиты информации).

Алгоритм решает многокритериальную задачу о рюкзаке с двумя критериями:
  1. Суммарное время взлома (аддитивный критерий, вектор c)
  2. Время реакции самого слабого звена (максиминный критерий, вектор d)

Критерии объединяются через коэффициент λ (lambda).
"""

from typing import List, Optional, Dict, Any

import numpy as np
import pulp


# ── Шаг 0: Базовый решатель рюкзака ────────────────────────

def solve_knapsack_pulp(
    c: list, A: list, b: list
) -> Optional[List[int]]:
    """
    Решает задачу о рюкзаке методом целочисленного программирования.

    Args:
        c: Коэффициенты целевой функции (вектор длины n).
        A: Матрица ограничений (m × n).
        b: Правые части ограничений (вектор длины m).

    Returns:
        Бинарный вектор решения или None, если оптимум не найден.
    """
    n = len(c)
    m = len(A)

    prob = pulp.LpProblem("Knapsack_Problem", pulp.LpMaximize)
    x = [pulp.LpVariable(f"x_{j}", cat=pulp.LpBinary) for j in range(n)]

    prob += pulp.lpSum([c[j] * x[j] for j in range(n)])

    for i in range(m):
        prob += pulp.lpSum([A[i][j] * x[j] for j in range(n)]) <= b[i]

    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if pulp.LpStatus[prob.status] == "Optimal":
        results = []
        for j in range(n):
            val = pulp.value(x[j])
            results.append(int(round(val)) if isinstance(val, (float, int)) else 0)
        return results

    return None


# ── Шаг 1: Начальное решение ───────────────────────────────

def algorithm_step_1(data: dict):
    """Находит начальное решение x0 задачи о рюкзаке (без учёта d)."""
    x0 = solve_knapsack_pulp(data["c"], data["A"], data["b"])
    if x0 is None:
        return None, None
    return x0, [x0]


# ── Шаг 2: Определение порога ──────────────────────────────

def algorithm_step_2(x0: List[int]) -> int:
    """
    Находит j0 — индекс последнего выбранного СЗИ в отсортированном порядке.
    Возвращает математический индекс (с 1).
    """
    indices_with_one = [i for i, val in enumerate(x0) if val == 1]
    if not indices_with_one:
        return 0
    return max(indices_with_one) + 1


# ── Шаг 3: Генерация множества кандидатов ──────────────────

def algorithm_step_3(data: dict, j0: int, V: list) -> list:
    """
    Генерирует дополнительных кандидатов, постепенно сужая пространство
    поиска и учитывая баланс между критериями c и d.
    """
    n, m = data["n"], data["m"]
    c, d, A, b, lam = data["c"], data["d"], data["A"], data["b"], data["lambda"]

    for s in range(1, j0):
        num_vars = j0 - s

        prob = pulp.LpProblem(f"Knapsack_s_{s}", pulp.LpMaximize)
        x = [pulp.LpVariable(f"x_{j}", cat=pulp.LpBinary) for j in range(num_vars)]

        # Комбинированная целевая функция
        objective = pulp.lpSum([lam * c[j] * x[j] for j in range(num_vars - 1)])
        last_idx = num_vars - 1
        last_term = (lam * c[last_idx] + (1 - lam) * d[last_idx]) * x[last_idx]
        prob += objective + last_term

        for i in range(m):
            prob += pulp.lpSum([A[i][j] * x[j] for j in range(num_vars)]) <= b[i]

        prob.solve(pulp.PULP_CBC_CMD(msg=False))

        if pulp.LpStatus[prob.status] == "Optimal":
            xs_partial = []
            for j in range(num_vars):
                val = pulp.value(x[j])
                clean_val = float(val) if isinstance(val, (int, float)) else 0.0
                xs_partial.append(int(round(clean_val)))
            V.append(xs_partial + [0] * (n - num_vars))

    return V


# ── Шаг 4: Выбор лучшего решения ──────────────────────────

def algorithm_step_4(data: dict, V: list):
    """
    Из множества кандидатов V выбирает решение с наибольшим
    значением комбинированной целевой функции F.

    Returns:
        (best_x, best_F, recommended_szi_indices)
    """
    best_x = None
    best_F = -1.0
    lam = data["lambda"]
    
    all_results = []

    for x in V:
        f1 = sum(data["c"][j] * x[j] for j in range(len(x)))
        selected_d = [data["d"][j] for j in range(len(x)) if x[j] == 1]
        f2 = min(selected_d) if selected_d else 0.0
        f_total = lam * f1 + (1 - lam) * f2
        
        # Восстановить оригинальные индексы СЗИ (1-based)
        original_szi = sorted(
            int(data["original_indices"][i] + 1)
            for i, val in enumerate(x)
            if val == 1
        )
        
        # Восстановить вектор x в оригинальном порядке
        original_x = [0] * len(data["original_indices"])
        for i, val in enumerate(x):
            original_x[data["original_indices"][i]] = val
            
        all_results.append({
            "vector_x": original_x,
            "f": float(f_total),
            "szi": original_szi
        })

        if f_total > best_F:
            best_F = f_total
            best_x = x

    # Восстановить оригинальные индексы СЗИ для лучшего (1-based)
    best_original_nums = []
    if best_x is not None:
        best_original_nums = sorted(
            int(data["original_indices"][i] + 1)
            for i, val in enumerate(best_x)
            if val == 1
        )

    return best_x, best_F, best_original_nums, all_results


# ── Основная функция (вызывается из API) ───────────────────

def solve_problem(
    m: int, n: int, A: list, b: list, c: list, d: list, lam: float
) -> Dict[str, Any]:
    """
    Полный цикл решения задачи выбора СЗИ.

    Args:
        m:   Количество групп информационных активов (ГИА).
        n:   Количество доступных СЗИ.
        A:   Матрица стоимости (m × n).
        b:   Бюджетные ограничения (длина m).
        c:   Время взлома для каждого СЗИ (длина n).
        d:   Время реакции для каждого СЗИ (длина n).
        lam: Коэффициент λ ∈ [0, 1].

    Returns:
        Словарь с полями: success, vector_x, optimal_f, recommended_szi.
    """
    # Предварительная сортировка по убыванию d_j
    b_arr = np.array(b)
    c_arr = np.array(c)
    d_arr = np.array(d)
    A_arr = np.array(A)
    indices = np.argsort(d_arr)[::-1]

    data = {
        "m": m,
        "n": n,
        "A": A_arr[:, indices],
        "b": b_arr,
        "c": c_arr[indices],
        "d": d_arr[indices],
        "lambda": lam,
        "original_indices": indices,
    }

    # Шаг 1: Начальное решение
    x0, V = algorithm_step_1(data)
    if x0 is None:
        return {
            "success": False,
            "error": "Решение не найдено. Проверьте входные данные и бюджеты.",
        }

    # Шаги 2–3: Генерация кандидатов (если λ ≠ 1)
    if lam != 1.0:
        j0 = algorithm_step_2(x0)
        V = algorithm_step_3(data, j0, V)

    # Шаг 4: Выбор лучшего
    best_x, best_F, recommended_szi, all_solutions = algorithm_step_4(data, V)

    # Восстановить вектор x в оригинальном порядке
    original_x = [0] * n
    if best_x is not None:
        for i, val in enumerate(best_x):
            original_x[indices[i]] = val

    # Сортируем все решения по убыванию F
    all_solutions.sort(key=lambda item: item["f"], reverse=True)

    return {
        "success": True,
        "vector_x": original_x,
        "optimal_f": best_F,
        "recommended_szi": recommended_szi,
        "all_solutions": all_solutions
    }
