import webview
import threading
import uvicorn
import time
import socket
from app import app

def get_free_port():
    """Finds an available open port to avoid conflicts."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("", 0))
    port = s.getsockname()[1]
    s.close()
    return port

def run_server(port):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")

if __name__ == "__main__":
    port = get_free_port()
    
    t = threading.Thread(target=run_server, args=(port,), daemon=True)
    t.start()
    
    time.sleep(1) # wait for uvicorn to bind
    
    webview.create_window(
        "SZI Optimization Application",
        f"http://127.0.0.1:{port}",
        width=1200,
        height=800,
        background_color="#f4f6f8"
    )
    
    webview.start()
