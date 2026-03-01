import subprocess
import os
import sys

# Caminho do script do Menu no Desktop
MENU_SCRIPT = r"C:\Users\nome_do_usuario\Desktop\17 top1\Lotofacil de todo.py"
BASE_DIR = r"C:\Users\nome_do_usuario\Desktop\17 top1"

def main():
    if os.path.exists(MENU_SCRIPT):
        print(f"🖥️  Abrindo Menu Principal em: {MENU_SCRIPT}")
        # Precisamos mudar o diretório de trabalho para que as importações do loto_core funcionem
        os.chdir(BASE_DIR)
        # Usamos sys.executable para garantir que usamos o mesmo interpretador Python
        subprocess.run([sys.executable, MENU_SCRIPT])
    else:
        print(f"❌ Erro: Script de menu não encontrado em {MENU_SCRIPT}")

if __name__ == "__main__":
    main()
