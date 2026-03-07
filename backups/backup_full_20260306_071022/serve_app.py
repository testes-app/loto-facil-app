import http.server
import socketserver
import os
import webbrowser
import threading
import time
import subprocess
import sys

PORT = 8000
BASE_DIR = r"C:\Users\nome_do_usuario\LotoMatrix"
DIRECTORY = os.path.join(BASE_DIR, "super_app")

def run_update_scripts():
    """Runs the update and consolidation scripts."""
    print("\n[BACKGROUND] Iniciando atualização de dados...")
    try:
        # 1. Atualizar concursos
        script1 = os.path.join(BASE_DIR, "scripts", "atualizar_concursos.py")
        subprocess.run([sys.executable, script1], check=True)
        
        # 2. Consolidar dados para o dashboard
        script2 = os.path.join(BASE_DIR, "scripts", "consolidar_dados.py")
        subprocess.run([sys.executable, script2], check=True)
        print("[BACKGROUND] Atualização concluída com sucesso.\n")
    except Exception as e:
        print(f"[BACKGROUND] Erro na atualização: {e}")

def background_timer():
    """Timer that runs the update every 30 minutes."""
    while True:
        run_update_scripts()
        time.sleep(1800) # 30 minutes

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/update":
            run_update_scripts()
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status": "success", "message": "Dados atualizados"}')
        else:
            return super().do_GET()

def start_server():
    # Start the background update thread
    update_thread = threading.Thread(target=background_timer, daemon=True)
    update_thread.start()
    
    server_address = ("", PORT)
    with socketserver.TCPServer(server_address, Handler) as httpd:
        print(f"Servindo Super App em http://localhost:{PORT}/super_app/index.html")
        print("Pressione Ctrl+C para parar.")
        webbrowser.open(f"http://localhost:{PORT}/super_app/index.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")

if __name__ == "__main__":
    start_server()
