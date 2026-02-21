"""
Точка входа для standalone-приложения (pywebview + uvicorn).

Запускает FastAPI-сервер в фоновом потоке и открывает
нативное окно браузера через pywebview.
"""

import socket
import threading
import time

import uvicorn
import webview

from app import app


def get_free_port() -> int:
    """Находит свободный TCP-порт для запуска сервера."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def run_server(port: int) -> None:
    """Запускает uvicorn-сервер на указанном порту."""
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")


if __name__ == "__main__":
    port = get_free_port()

    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()
    time.sleep(1)  # Ждём привязки порта

    webview.create_window(
        "SZI Optimization Application",
        f"http://127.0.0.1:{port}",
        width=1200,
        height=800,
        background_color="#f4f6f8",
    )
    webview.start()
