import csv
import json
import os
from .config import CSV_FILE, CACHE_FILE

def carregar_csv():
    """Carrega dados do arquivo CSV."""
    concursos = []
    if not os.path.exists(CSV_FILE):
        return concursos
        
    with open(CSV_FILE, encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        next(reader, None) # Skip header
        for row in reader:
            if row and row[0].strip().isdigit():
                concurso_id = int(row[0])
                data_str = row[1]
                # Assuming dezenas are from index 2 to 16
                dezenas = frozenset(int(row[i]) for i in range(2, min(17, len(row))))
                concursos.append((concurso_id, data_str, dezenas))
    return concursos

def carregar_json():
    """Carrega dados do arquivo JSON de cache."""
    if not os.path.exists(CACHE_FILE):
        return []
        
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        # Convert back to standard format: (id, data, dezenas_set)
        return [(d["concurso"], d["data"], frozenset(d["dezenas"])) for d in data]

def carregar_dados():
    """Tenta carregar do JSON (mais rápido), senão vai pro CSV."""
    dados = carregar_json()
    if not dados:
        dados = carregar_csv()
    return dados
