import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE = os.path.join(BASE_DIR, "lotofacil.csv")
CACHE_FILE = os.path.join(BASE_DIR, "lotofacil_cache.json")

# Score Settings
PESOS = {
    15: 1000,
    14: 200,
    13: 30,
    12: 5,
    11: 1
}

# Frontend Paths (used by calcular_atrasos.py)
FRONTEND_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "combinacoes.json")
FRONTEND_SCREEN_PATH = os.path.join(BASE_DIR, "src", "screens", "AnalyzeScreen.js")
RESULTS_DIR = os.path.join(BASE_DIR, "resultados")
