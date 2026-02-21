import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from solver import solve_problem
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="SZI Knapsack Solver API")

# Setup CORS just in case
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SolveRequest(BaseModel):
    m: int
    n: int
    lam: float
    A: List[List[float]]
    b: List[float]
    c: List[float]
    d: List[float]

@app.post("/api/solve")
def solve(request: SolveRequest):
    try:
        result = solve_problem(
            m=request.m, 
            n=request.n, 
            A=request.A, 
            b=request.b, 
            c=request.c, 
            d=request.d, 
            lam=request.lam
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

# Ensure static folder exists dynamically for PyInstaller package
import sys
import os

if getattr(sys, 'frozen', False):
    # PyInstaller creates a temp folder and stores path in _MEIPASS
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

static_dir = os.path.join(base_dir, "static")

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    # Run the server locally
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
