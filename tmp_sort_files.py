import os

files = [
    "task_10x10.txt",
    "task_20x20.txt",
    "test_data_10_10_random_b.txt",
    "test_data_10_10.txt",
    "test_data_20_gia.txt",
    "test_data_40.txt"
]

def sort_file(filename):
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return
        
    with open(filename, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    if not lines:
        return
        
    # Line 1: m n
    m, n = map(int, lines[0].split())
    
    # Next m lines: Matrix A
    matrix_a_rows = []
    for i in range(1, m + 1):
        matrix_a_rows.append(list(map(float, lines[i].split())))
        
    # Next 1 line: Vector b (m values)
    vector_b = list(map(float, lines[m+1].split()))
    
    # Next 1 line: Vector c (n values)
    vector_c = list(map(float, lines[m+2].split()))
    
    # Next 1 line: Vector d (n values)
    vector_d = list(map(float, lines[m+3].split()))
    
    # Next 1 line: Lambda
    lam_val = float(lines[m+4])
    
    # Zip columns of A with c and d
    # A_cols[j] = [A[0][j], A[1][j], ..., A[m-1][j]]
    a_cols = []
    for j in range(n):
        col = [matrix_a_rows[i][j] for i in range(m)]
        a_cols.append(col)
        
    # Create SZI objects
    szi_data = []
    for j in range(n):
        szi_data.append({
            'a_col': a_cols[j],
            'c': vector_c[j],
            'd': vector_d[j]
        })
        
    # Sort SZI data: d descending, then c descending
    szi_data.sort(key=lambda x: (x['d'], x['c']), reverse=True)
    
    # Unpack sorted data
    sorted_a_cols = [s['a_col'] for s in szi_data]
    sorted_c = [s['c'] for s in szi_data]
    sorted_d = [s['d'] for s in szi_data]
    
    # Reconstruct matrix A rows
    sorted_matrix_a_rows = []
    for i in range(m):
        row = [sorted_a_cols[j][i] for j in range(n)]
        sorted_matrix_a_rows.append(row)
        
    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"{m} {n}\n")
        for row in sorted_matrix_a_rows:
            f.write(" ".join(map(lambda x: str(int(x)) if x == int(x) else str(x), row)) + "\n")
        f.write(" ".join(map(lambda x: str(int(x)) if x == int(x) else str(x), vector_b)) + "\n")
        f.write(" ".join(map(lambda x: str(int(x)) if x == int(x) else str(x), sorted_c)) + "\n")
        f.write(" ".join(map(lambda x: str(int(x)) if x == int(x) else str(x), sorted_d)) + "\n")
        f.write(f"{lam_val if lam_val != int(lam_val) else int(lam_val)}\n")
    print(f"Sorted {filename}")

for f in files:
    sort_file(os.path.join(r"c:\Users\stlxs\Desktop\spp", f))
