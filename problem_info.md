# Extended Documentation: IST Optimization Model for LLM Processing

## 1. Theoretical Context & Domain Knowledge

### 1.1. Cyber Security Application
[cite_start]The model addresses the strategic deployment of Information Security Tools (IST) like firewalls or antiviruses[cite: 12]. In this context:
* [cite_start]**"Bypass" (Взлом)**: A sequence of actions where a hacker exploits vulnerabilities to circumvent IST mechanisms[cite: 66].
* [cite_start]**GIA (ГИА)**: Groups of Information Assets that require protection[cite: 3, 62].
* [cite_start]**Sequential Protection**: The model assumes hackers must bypass all installed ISTs one after another[cite: 67].
* [cite_start]**Defense-in-Depth**: The goal is to maximize the total time an attacker spends (Additive) while ensuring no single point of failure has a critically low detection time (Maximin)[cite: 15, 16, 96].

### 1.2. Decision Making under Uncertainty (Fuzzy Logic)
[cite_start]The time required to bypass security cannot be known precisely a priori[cite: 11, 13]. 
* [cite_start]**Triangular Fuzzy Numbers (TFN)**: Used to represent "approximate" values[cite: 10, 14]. [cite_start]A TFN $\tilde{g}=(g_1, g_2, g_3)$ defines a range where $g_2$ is the most likely value (mode), and $g_1, g_3$ are the lower and upper bounds[cite: 71].
* [cite_start]**Defuzzification**: The process of converting fuzzy values into "crisp" real numbers for optimization[cite: 19, 104, 107].

### 1.3. Mathematical Classification
[cite_start]This is a **Biobjective Multidimensional Knapsack Problem (BMKP)**[cite: 5, 56, 217]:
* [cite_start]**Knapsack Problem**: Selecting the most valuable items (ISTs) without exceeding the capacity (Budget)[cite: 6, 7].
* [cite_start]**Multidimensional**: Constraints exist for multiple groups (GIA) simultaneously ($Ax \le b$)[cite: 83].
* [cite_start]**Biobjective**: Balancing two conflicting goals using a scalarization $\lambda$[cite: 100, 102].

## 2. Mathematical Formulation

### 2.1. Variables and Constraints
* [cite_start]**Decision Vector**: $x \in \{0, 1\}^n$ where $x_j=1$ if IST $j$ is chosen[cite: 65].
* [cite_start]**Cost Matrix $A$**: Elements $a_{ij}$ represent the price of IST $j$ for GIA $i$[cite: 77].
* [cite_start]**Budget Vector $b$**: $b_i$ is the financial limit for GIA $i$[cite: 78].

### 2.2. Criteria and Scalarization
[cite_start]The combined objective function is[cite: 117]:
$$F(x) = \lambda F_1(x) + (1 - \lambda) F_2(x) \to \max$$

1. [cite_start]**$F_1$ (Additive)**: $\sum c_j x_j$ — represents the cumulative "hacker work" required[cite: 90, 91].
2. [cite_start]**$F_2$ (Maximin)**: $\min_{x_j=1} d_j$ — represents the "weakest link" in terms of detection response time[cite: 93, 94].

## 3. The Hybrid "Sorting & Sifting" Algorithm

Standard solvers often struggle with the `min` operator in objective functions. [cite_start]This algorithm bypasses this by converting the problem into a series of standard additive tasks[cite: 56, 127].

### 3.1. Prerequisite: Sorting
[cite_start]ISTs MUST be sorted such that $d_1 \ge d_2 \ge \dots \ge d_n$[cite: 115]. [cite_start]This ensures that for any selected set, the index of the "last" chosen IST determines the value of the maximin criterion ($F_2$)[cite: 180, 182].

### 3.2. Step-by-Step Logic
1. [cite_start]**Global Optimum Search**: Find $x^0$ for the additive part only[cite: 136].
2. [cite_start]**Reduced Space Search**: Since the maximin value is tied to the index, we "force" different ISTs to be the "weakest link" by solving sub-problems with a restricted number of ISTs ($j_0 - s$)[cite: 141, 142].
3. [cite_start]**Modified Objective**: In each sub-step $s$, the objective function is reformulated to include the fixed response time of the $s$-th index into the additive sum[cite: 147, 148].
4. [cite_start]**Brute Force Selection**: Compare all candidate vectors found in the sub-steps and pick the best one for the full $F(x)$[cite: 157, 199].

## 4. Technical Implementation Details
* [cite_start]**Numeric Precision**: Parameters $c_j, d_j$ should be `float` with 3 decimal places[cite: 131, 132].
* [cite_start]**Software**: Google Colab / Python with optimization libraries (CPLEX, OR-Tools, Gurobi)[cite: 45, 47, 48, 123].

---

## 5. Руководство пользователя (User Guide)

### 5.1. Описание полей ввода
*   **ГИА (m)**: Количество групп информационных активов (строки в системе ограничений).
*   **СЗИ (n)**: Количество доступных средств защиты информации (переменные/столбцы).
*   **λ (Лямбда)**: Весовой коэффициент для свертки критериев.
    *   `λ = 1.0`: Оптимизация только суммарного времени взлома ($F_1$).
    *   `λ = 0.0`: Оптимизация только минимального времени реакции ($F_2$).
    *   `0 < λ < 1`: Баланс между обоими критериями.
*   **Матрица A**: Стоимость внедрения $j$-го средства защиты для $i$-й группы активов.
*   **Вектор b**: Финансовый лимит (бюджет) для каждой из $m$ групп активов.
*   **Вектор c**: Время, необходимое злоумышленнику для обхода (взлома) $j$-го СЗИ.
*   **Вектор d**: Время реакции (обнаружения) для $j$-го СЗИ.

### 5.2. Формат входного файла (input.txt)
Для автоматической загрузки данных используйте текстовый файл следующей структуры (значения разделяются пробелами или табуляцией):

```text
[m] [n]
[A_1_1] [A_1_2] ... [A_1_n]
... (m строк матрицы A) ...
[A_m_1] [A_m_2] ... [A_m_n]
[b_1] [b_2] ... [b_m]
[c_1] [c_2] ... [c_n]
[d_1] [d_2] ... [d_n]
[lambda]
```

**Пример (3 ГИА, 4 СЗИ):**
```text
3 4
10 15 20 25
12 18 22 28
15 20 25 30
50 60 70
5.5 6.2 4.8 7.1
1.2 0.8 1.5 1.1
0.5
```

### 5.3. Порядок работы
1.  Установите размерность $m$ и $n$.
2.  Нажмите **«Сгенерировать пустую модель»** для ручного ввода или **«Загрузить из файла»** для импорта.
3.  Заполните/проверьте данные в появившихся таблицах.
4.  Нажмите **«Запустить расчет решения»**.
5.  Программа выведет оптимальное значение целевой функции, рекомендованные номера СЗИ и вектор решения $x$ (где `1` — СЗИ выбрано, `0` — нет).
