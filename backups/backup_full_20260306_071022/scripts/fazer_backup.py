import os
import shutil
from datetime import datetime

# Configuration
BASE_DIR = r"C:\Users\nome_do_usuario\LotoMatrix"
BACKUP_ROOT = os.path.join(BASE_DIR, "backups")

# Critical files in root
FILES_TO_BACKUP = [
    os.path.join(BASE_DIR, "App.js"),
    os.path.join(BASE_DIR, "app.json"),
    os.path.join(BASE_DIR, "package.json"),
    os.path.join(BASE_DIR, "index.js"),
    os.path.join(BASE_DIR, "serve_app.py"),
    os.path.join(BASE_DIR, "Iniciar_LotoMatrix.bat")
]

# Essential directories
DIRS_TO_BACKUP = [
    "loto_core",
    "scripts",
    "data",
    "src",
    "super_app",
    "resultados"
]

def make_backup():
    if not os.path.exists(BACKUP_ROOT):
        os.makedirs(BACKUP_ROOT)
        print(f"Diretório de backups criado: {BACKUP_ROOT}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_folder = os.path.join(BACKUP_ROOT, f"backup_full_{timestamp}")
    os.makedirs(backup_folder)

    # Backup individual files
    for file_path in FILES_TO_BACKUP:
        if os.path.exists(file_path):
            file_name = os.path.basename(file_path)
            dest_path = os.path.join(backup_folder, file_name)
            shutil.copy2(file_path, dest_path)
            print(f"  [ARQUIVO] Backup: {file_name}")
        else:
            print(f"  [AVISO] Arquivo não encontrado: {file_path}")

    # Backup directories
    for dir_name in DIRS_TO_BACKUP:
        src_dir = os.path.join(BASE_DIR, dir_name)
        if os.path.isdir(src_dir):
            dest_dir = os.path.join(backup_folder, dir_name)
            shutil.copytree(src_dir, dest_dir)
            print(f"  [PASTA] Backup: {dir_name}/")
        else:
            print(f"  [AVISO] Pasta não encontrada: {dir_name}")

    print(f"\n✅ SUCESSO: Backup completo em {backup_folder}")

if __name__ == "__main__":
    make_backup()
