from core.parser import load_data
from core.algorithm import run_full_algorithm
import json

def test():
    data = load_data('input.txt')
    if data is None:
        print("Failed to load data")
        return

    results = run_full_algorithm(data)
    if "error" in results:
        print("Error:", results["error"])
        return

    print("Optimal F:", results['best_F'])
    print("Optimal x:", results['best_x'])
    print("Recommended SZI:", results['recommended_szi'])
    print("Number of Candidates:", len(results['table']))

if __name__ == "__main__":
    test()
