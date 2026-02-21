import numpy as np
import pulp

def solve_knapsack_pulp(c, A, b):
    n = len(c)
    m = len(A)
    prob = pulp.LpProblem("Knapsack_Problem", pulp.LpMaximize)
    x = [pulp.LpVariable(f"x_{j}", cat=pulp.LpBinary) for j in range(n)]
    prob += pulp.lpSum([c[j] * x[j] for j in range(n)])
    for i in range(m):
        prob += pulp.lpSum([A[i][j] * x[j] for j in range(n)]) <= b[i]
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    if pulp.LpStatus[prob.status] == 'Optimal':
        results = []
        for j in range(n):
            val = pulp.value(x[j])
            if isinstance(val, (float, int)):
                results.append(int(round(val)))
            else:
                results.append(0)
        return results
    return None

def algorithm_step_1(data):
    x0 = solve_knapsack_pulp(data['c'], data['A'], data['b'])
    if x0 is None:
        return None, None
    V = [x0]
    return x0, V

def algorithm_step_2(x0):
    indices_with_one = [i for i, val in enumerate(x0) if val == 1]
    if not indices_with_one:
        return 0
    j0_python = max(indices_with_one)
    j0_math = j0_python + 1
    return j0_math

def algorithm_step_3(data, j0, V):
    n, m = data['n'], data['m']
    c, d, A, b, lam = data['c'], data['d'], data['A'], data['b'], data['lambda']
    for s in range(1, j0):
        num_vars = j0 - s
        prob = pulp.LpProblem(f"Knapsack_s_{s}", pulp.LpMaximize)
        x = [pulp.LpVariable(f"x_{j}", cat=pulp.LpBinary) for j in range(num_vars)]
        objective = pulp.lpSum([lam * c[j] * x[j] for j in range(num_vars - 1)])
        last_idx = num_vars - 1
        last_term = (lam * c[last_idx] + (1 - lam) * d[last_idx]) * x[last_idx]
        prob += objective + last_term
        for i in range(m):
            prob += pulp.lpSum([A[i][j] * x[j] for j in range(num_vars)]) <= b[i]
        prob.solve(pulp.PULP_CBC_CMD(msg=False))
        if pulp.LpStatus[prob.status] == 'Optimal':
            xs_partial = []
            for j in range(num_vars):
                val = pulp.value(x[j])
                clean_val = float(val) if isinstance(val, (int, float)) else 0.0
                xs_partial.append(int(round(clean_val)))
            xs_full = xs_partial + [0] * (n - num_vars)
            V.append(xs_full)
    return V

def algorithm_step_4_pretty(data, V):
    best_x = None
    best_F = -1.0
    lam = data['lambda']
    
    for x in V:
        f1_val = sum(data['c'][j] * x[j] for j in range(len(x)))
        selected_d = [data['d'][j] for j in range(len(x)) if x[j] == 1]
        f2_val = min(selected_d) if selected_d else 0.0
        f_total = lam * f1_val + (1 - lam) * f2_val
        if f_total > best_F:
            best_F = f_total
            best_x = x
            
    original_nums = []
    if best_x is not None:
        original_nums = [
            int(data['original_indices'][i] + 1) 
            for i, val in enumerate(best_x) 
            if val == 1
        ]
    original_nums.sort()
    
    return best_x, best_F, original_nums

def solve_problem(m: int, n: int, A: list, b: list, c: list, d: list, lam: float):
    # Преобразование данных и сортировка (предварительный этап)
    b_arr = np.array(b)
    c_arr = np.array(c)
    d_arr = np.array(d)
    A_arr = np.array(A)
    
    # Сортируем индексы по убыванию d_j 
    indices = np.argsort(d_arr)[::-1]
    
    data = {
        "m": m,
        "n": n,
        "A": A_arr[:, indices],
        "b": b_arr,
        "c": c_arr[indices],
        "d": d_arr[indices],
        "lambda": lam,
        "original_indices": indices
    }
    
    x0, V = algorithm_step_1(data)
    if x0 is None:
        return {"error": "Решение не найдено. Проверьте входные данные и бюджеты."}
        
    if lam != 1.0:
        j0 = algorithm_step_2(x0)
        V = algorithm_step_3(data, j0, V)
        
    best_x, best_F, recommended_szi = algorithm_step_4_pretty(data, V)
    
    # best_x is currently in sorted order by 'd'. We should reorder it to the original indices 
    # if we want to return the full vector x in the original order.
    # We create a final vector of size n
    original_x = [0] * n
    for i, val in enumerate(best_x):
        original_x[indices[i]] = val
        
    return {
        "success": True,
        "vector_x": original_x,
        "optimal_f": best_F,
        "recommended_szi": recommended_szi
    }
