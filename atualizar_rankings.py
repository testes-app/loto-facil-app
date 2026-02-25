"""
atualizar_rankings.py
=====================
Script de atualização automática dos rankings do LotoMatrix.

Como usar:
    python atualizar_rankings.py

O que ele faz:
    1. Baixa os concursos mais recentes da API da Caixa
    2. Salva/atualiza o cache local (lotofacil_cache.json)
    3. Recalcula os rankings para 17, 18, 19 e 20 dezenas
    4. Salva os JSONs em resultados/ e src/data/resultados/
    5. Faz git add + commit + push automático para o GitHub
"""

import os
import sys
import json
import shutil
import subprocess
import itertools
import requests
from datetime import datetime

# ─── Configuração ────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE    = os.path.join(BASE_DIR, "lotofacil_cache.json")
RESULTS_DIR   = os.path.join(BASE_DIR, "resultados")
FRONTEND_DIR  = os.path.join(BASE_DIR, "src", "data", "resultados")

DEZENAS_CONFIG = [17, 18, 19, 20]
TOP_N          = 10  # quantos jogos salvar por ranking

PESOS = {15: 1000, 14: 200, 13: 30, 12: 5, 11: 1}

API_CAIXA = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{}"

# ─── Cores no terminal ───────────────────────────────────────────────────────
VERDE   = "\033[92m"
AMARELO = "\033[93m"
VERMELHO= "\033[91m"
CIANO   = "\033[96m"
RESET   = "\033[0m"
NEGRITO = "\033[1m"

def log(msg, cor=RESET):
    print(f"{cor}{msg}{RESET}")

# ─── 1. Download de dados da Caixa ───────────────────────────────────────────
def baixar_concurso(numero):
    """Retorna dict com concurso, data, dezenas ou None em caso de erro."""
    try:
        url = API_CAIXA.format(numero if numero else "")
        r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 200:
            d = r.json()
            if not d or not d.get("numero"):
                return None
            dezenas = []
            for i in range(1, 16):
                key = f"dezena{i}"
                if d.get(key):
                    dezenas.append(int(d[key]))
                elif d.get("listaDezenas") and len(d["listaDezenas"]) >= i:
                    dezenas.append(int(d["listaDezenas"][i - 1]))
            if len(dezenas) == 15:
                return {
                    "concurso": d["numero"],
                    "data": d.get("dataApuracao", ""),
                    "dezenas": sorted(dezenas)
                }
    except Exception as e:
        pass
    return None

def atualizar_cache():
    """Baixa concursos novos e atualiza o cache local."""
    log("\n📡 Verificando dados mais recentes...", CIANO)

    # Carregar cache existente
    cache = []
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        log(f"   Cache existente: {len(cache)} concursos (último: {cache[-1]['concurso'] if cache else 0})", AMARELO)

    ultimo_local = cache[-1]["concurso"] if cache else 0

    # Descobrir último concurso na API
    ultimo_api_data = baixar_concurso(None)
    if not ultimo_api_data:
        log("   ❌ Não foi possível conectar à API da Caixa.", VERMELHO)
        return cache, ultimo_local

    ultimo_api = ultimo_api_data["concurso"]
    log(f"   Último concurso na API: {ultimo_api}", VERDE)

    if ultimo_api <= ultimo_local:
        log(f"   ✅ Cache já está atualizado até o concurso {ultimo_local}.", VERDE)
        return cache, ultimo_local

    # Baixar concursos novos
    novos = []
    for num in range(ultimo_local + 1, ultimo_api + 1):
        log(f"   ⬇️  Baixando concurso {num}...", AMARELO)
        dados = baixar_concurso(num)
        if dados:
            novos.append(dados)
            log(f"      ✅ {num} → {dados['dezenas']}", VERDE)
        else:
            log(f"      ⚠️  Concurso {num} não encontrado.", AMARELO)

    if novos:
        cache.extend(novos)
        cache.sort(key=lambda x: x["concurso"])
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        log(f"\n   💾 Cache atualizado: {len(cache)} concursos (até {cache[-1]['concurso']})", VERDE)

    return cache, cache[-1]["concurso"] if cache else ultimo_local

# ─── 2. Geração de rankings ───────────────────────────────────────────────────
def calcular_score_e_atraso(jogo_set, concursos_sorted):
    """Calcula score ponderado e atraso de um jogo."""
    ct = {11: 0, 12: 0, 13: 0, 14: 0, 15: 0}
    atraso = 0
    achou_ultimo = False

    for i, (_, _, dezenas) in enumerate(concursos_sorted):
        acertos = len(jogo_set & dezenas)
        if acertos >= 11:
            ct[acertos] += 1
            if not achou_ultimo:
                atraso = i  # quantos sorteios desde o último 11+
                achou_ultimo = True

    if not achou_ultimo:
        atraso = len(concursos_sorted)

    score = sum(ct[f] * PESOS[f] for f in PESOS)
    return score, ct, atraso

def gerar_ranking(concursos, tamanho):
    """Gera o top-N ranking para jogos de `tamanho` dezenas."""
    log(f"\n🔢 Calculando ranking para {tamanho} dezenas...", CIANO)

    # Concursos ordenados do mais recente para o mais antigo
    concursos_sorted = sorted(concursos, key=lambda x: x[0], reverse=True)
    concursos_frozenset = [(c, d, frozenset(dz)) for c, d, dz in concursos_sorted]

    total = len(concursos)
    log(f"   Total de concursos: {total}", AMARELO)

    # Carregar ranking anterior para comparar
    nome_arquivo = lambda n: os.path.join(RESULTS_DIR, f"top10_{tamanho}dezenas_{n}concursos.json")
    ranking_anterior = None
    if os.path.exists(nome_arquivo(total)):
        log(f"   ✅ Ranking já existe para {total} concursos. Pulando recálculo.", VERDE)
        with open(nome_arquivo(total), "r", encoding="utf-8") as f:
            return json.load(f), total

    # Verificar se há ranking anterior para reusar como base
    import re, glob
    arquivos = glob.glob(os.path.join(RESULTS_DIR, f"top10_{tamanho}dezenas_*concursos.json"))
    if arquivos:
        # Pegar o mais recente
        mais_recente = max(arquivos, key=lambda x: int(re.search(r"(\d+)concursos", x).group(1)))
        num_ant = int(re.search(r"(\d+)concursos", mais_recente).group(1))
        if num_ant == total:
            log(f"   ✅ Ranking já atualizado.", VERDE)
            with open(mais_recente, "r", encoding="utf-8") as f:
                return json.load(f), total

        log(f"   🔄 Ranking base: {num_ant} → recalculando para {total}", AMARELO)
        with open(mais_recente, "r", encoding="utf-8") as f:
            ranking_anterior = json.load(f)

    # Sem ranking anterior → recalcular do zero (apenas com o top existente)
    if ranking_anterior is None:
        log(f"   ❌ Nenhum ranking anterior encontrado para {tamanho} dezenas.", VERMELHO)
        log(f"   ⚠️  Use os scripts originais do loto_core para gerar o ranking base.", AMARELO)
        return None, total

    # Recalcular apenas os novos concursos para os jogos já rankeados
    novos_concursos = [(c, d, dz) for c, d, dz in concursos_frozenset if c > num_ant]
    log(f"   📊 {len(novos_concursos)} novos concursos a processar para {len(ranking_anterior)} jogos...", AMARELO)

    resultados_atualizados = []
    for item in ranking_anterior:
        jogo_set = frozenset(item["dezenas"])
        # Score e atraso completo com todos os concursos
        score, ct, atraso = calcular_score_e_atraso(jogo_set, concursos_frozenset)
        resultados_atualizados.append({
            "score": score,
            "counts": {str(k): v for k, v in ct.items()},
            "dezenas": item["dezenas"],
            "atraso": atraso
        })

    # Reordenar por score
    resultados_atualizados.sort(key=lambda x: x["score"], reverse=True)
    top = resultados_atualizados[:TOP_N]

    log(f"   ✅ Top {TOP_N} gerado para {tamanho} dezenas.", VERDE)
    return top, total

# ─── 3. Salvar arquivos ───────────────────────────────────────────────────────
def salvar_e_copiar(dados, tamanho, total_concursos):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(FRONTEND_DIR, exist_ok=True)

    nome = f"top10_{tamanho}dezenas_{total_concursos}concursos.json"
    caminho_results  = os.path.join(RESULTS_DIR,  nome)
    caminho_frontend = os.path.join(FRONTEND_DIR, nome)

    with open(caminho_results, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=4)

    shutil.copy(caminho_results, caminho_frontend)
    log(f"   💾 Salvo: {nome}", VERDE)

# ─── 4. Git push ─────────────────────────────────────────────────────────────
def git_push(total_concursos):
    log(f"\n🚀 Fazendo push para o GitHub (concurso {total_concursos})...", CIANO)
    try:
        subprocess.run(["git", "add",
            "resultados/",
            "src/data/resultados/",
            "lotofacil_cache.json"
        ], cwd=BASE_DIR, check=True)

        msg = f"update: rankings atualizados até o concurso {total_concursos}"
        subprocess.run(["git", "commit", "-m", msg], cwd=BASE_DIR, check=True)
        subprocess.run(["git", "push"], cwd=BASE_DIR, check=True)
        log("   ✅ Push realizado com sucesso!", VERDE)
        log(f"   📱 O app irá atualizar automaticamente na próxima abertura.", VERDE)
    except subprocess.CalledProcessError as e:
        log(f"   ⚠️  Erro no git: {e}", AMARELO)
        log("   Verifique se há mudanças para commitar ou se o git está configurado.", AMARELO)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    log(f"\n{'='*60}", NEGRITO)
    log(f"  LotoMatrix — Atualização de Rankings", NEGRITO)
    log(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}", AMARELO)
    log(f"{'='*60}", NEGRITO)

    # 1. Atualizar cache
    cache, total_concursos = atualizar_cache()
    if not cache:
        log("\n❌ Sem dados para processar.", VERMELHO)
        sys.exit(1)

    # Converter para formato interno: (id, data, frozenset)
    concursos = [(c["concurso"], c["data"], frozenset(c["dezenas"])) for c in cache]

    # 2. Gerar rankings
    houve_atualizacao = False
    for tamanho in DEZENAS_CONFIG:
        dados, total = gerar_ranking(concursos, tamanho)
        if dados is not None:
            salvar_e_copiar(dados, tamanho, total)
            houve_atualizacao = True

    # 3. Push para GitHub
    if houve_atualizacao:
        git_push(total_concursos)
    else:
        log("\n✅ Nenhuma atualização necessária.", VERDE)

    log(f"\n{'='*60}\n", NEGRITO)

if __name__ == "__main__":
    main()
