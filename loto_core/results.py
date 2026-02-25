import json
import os
from .config import RESULTS_DIR

def garantir_pasta():
    if not os.path.exists(RESULTS_DIR):
        os.makedirs(RESULTS_DIR)

def gerar_nome_arquivo(tamanho, total_concursos):
    return os.path.join(RESULTS_DIR, f"top10_{tamanho}dezenas_{total_concursos}concursos.json")

def salvar_ranking(ranking, tamanho, total_concursos):
    garantir_pasta()
    arquivo = gerar_nome_arquivo(tamanho, total_concursos)
    data_to_save = []
    for item in ranking:
        if len(item) == 4:
            score, counts, dezenas, atraso = item
        else:
            score, counts, dezenas = item
            atraso = 0
            
        data_to_save.append({
            "score": score,
            "counts": {str(k): v for k, v in counts.items()},
            "dezenas": dezenas,
            "atraso": atraso
        })
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(data_to_save, f, indent=4)
    return arquivo

def carregar_ranking(tamanho, total_concursos):
    arquivo = gerar_nome_arquivo(tamanho, total_concursos)
    if not os.path.exists(arquivo):
        return None
    with open(arquivo, "r", encoding="utf-8") as f:
        stored_data = json.load(f)
    ranking = []
    for item in stored_data:
        counts = {int(k): v for k, v in item["counts"].items()}
        ranking.append((item["score"], counts, item["dezenas"], item.get("atraso", 0)))
    return ranking

def buscar_resultado_mais_recente(tamanho):
    garantir_pasta()
    arquivos = [f for f in os.listdir(RESULTS_DIR) if f.startswith(f"top10_{tamanho}dezenas_") and f.endswith(".json")]
    if not arquivos:
        return None, 0
    import re
    mais_recente = None
    max_concursos = -1
    for arq in arquivos:
        match = re.search(r"_(\d+)concursos\.json", arq)
        if match:
            num = int(match.group(1))
            if num > max_concursos:
                max_concursos = num
                mais_recente = arq
    if mais_recente:
        caminho = os.path.join(RESULTS_DIR, mais_recente)
        with open(caminho, "r", encoding="utf-8") as f:
            stored_data = json.load(f)
        ranking = []
        for item in stored_data:
            counts = {int(k): v for k, v in item["counts"].items()}
            ranking.append((item["score"], counts, item["dezenas"], item.get("atraso", 0)))
        return ranking, max_concursos
    return None, 0