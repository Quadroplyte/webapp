"""
SZI Knapsack Solver — FastAPI Backend.

Обслуживает веб-интерфейс (static/) и предоставляет API
для решения задачи оптимального выбора средств защиты информации.
"""

import sys
import os

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from solver import solve_problem

# ── Инициализация приложения ────────────────────────────────

app = FastAPI(title="SZI Knapsack Solver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Определение путей (совместимость с PyInstaller) ─────────

if getattr(sys, "frozen", False):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

static_dir = os.path.join(base_dir, "static")

# ── Статические файлы и главная страница ────────────────────

app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    """Возвращает главную HTML-страницу."""
    return FileResponse(os.path.join(static_dir, "index.html"))


# ── API ─────────────────────────────────────────────────────

class SolveRequest(BaseModel):
    """Схема входных данных для решателя."""
    m: int
    n: int
    lam: float
    A: List[List[float]]
    b: List[float]
    c: List[float]
    d: List[float]


@app.post("/api/solve")
def solve(request: SolveRequest):
    """Запускает алгоритм оптимизации и возвращает результат."""
    try:
        return solve_problem(
            m=request.m,
            n=request.n,
            A=request.A,
            b=request.b,
            c=request.c,
            d=request.d,
            lam=request.lam,
        )
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── Точка входа для локальной разработки ────────────────────

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
