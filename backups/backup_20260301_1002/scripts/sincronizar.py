import subprocess
import os

# Caminho do script mestre no Desktop
MASTER_SCRIPT = r"C:\Users\nome_do_usuario\Desktop\17 top1\sincronizar_app.py"

def main():
    if os.path.exists(MASTER_SCRIPT):
        print(f"🔄 Redirecionando para o Script Mestre em: {MASTER_SCRIPT}")
        subprocess.run(["python", MASTER_SCRIPT])
    else:
        print(f"❌ Erro: Script mestre não encontrado em {MASTER_SCRIPT}")

if __name__ == "__main__":
    main()
