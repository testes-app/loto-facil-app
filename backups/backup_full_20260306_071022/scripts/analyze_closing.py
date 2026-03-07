import json
import os
from itertools import combinations

# Configurações de caminhos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "resultados_lotofacil.json")

# Dados do Usuário
USER_17_NUMS = [1, 2, 3, 5, 6, 7, 9, 11, 12, 14, 16, 17, 18, 20, 22, 24, 25]
USER_GAMES = [
    [1, 2, 3, 5, 6, 7, 9, 11, 12, 14, 16, 17, 18, 20, 22],
    [1, 2, 3, 5, 6, 7, 9, 11, 12, 14, 16, 18, 20, 24, 25],
    [1, 2, 3, 5, 6, 7, 9, 11, 12, 16, 17, 18, 22, 24, 25],
    [1, 2, 3, 5, 6, 7, 12, 14, 16, 17, 18, 20, 22, 24, 25],
    [1, 2, 3, 5, 6, 9, 11, 12, 14, 16, 17, 20, 22, 24, 25],
    [1, 2, 3, 5, 7, 9, 11, 14, 16, 17, 18, 20, 22, 24, 25],
    [1, 2, 6, 7, 9, 11, 12, 14, 16, 17, 18, 20, 22, 24, 25],
    [1, 3, 5, 6, 7, 9, 11, 12, 14, 17, 18, 20, 22, 24, 25]
]

# Converter para sets para facilitar comparação
user_games_sets = [set(g) for g in USER_GAMES]
user_17_set = set(USER_17_NUMS)

def validate_coverage(pool, games_sets):
    """Valida se garante 14 pontos se 15 estiverem no pool."""
    print(f"Validando cobertura C({len(pool)}, 15)...")
    total_combos = 0
    covered_14 = 0
    covered_15 = 0
    
    for combo in combinations(pool, 15):
        total_combos += 1
        combo_set = set(combo)
        max_hits = 0
        for g in games_sets:
            hits = len(g & combo_set)
            if hits > max_hits:
                max_hits = hits
        
        if max_hits >= 15:
            covered_15 += 1
            covered_14 += 1
        elif max_hits >= 14:
            covered_14 += 1
            
    return total_combos, covered_15, covered_14

def run_history_analysis(games_sets, results_file):
    if not os.path.exists(results_file):
        print(f"Arquivo de resultados não encontrado: {results_file}")
        return None
        
    with open(results_file, "r") as f:
        resultados = json.load(f)
        
    stats = {15: 0, 14: 0, 13: 0, 12: 0, 11: 0}
    total_concursos = len(resultados)
    
    for concurso in resultados:
        # concurso[1] é a lista de números
        sorteio_set = set(concurso[1])
        concurso_max_hits = 0
        
        # Para cada concurso, vemos qual foi o melhor desempenho dos 8 jogos
        best_in_concurso = 0
        for g in games_sets:
            hits = len(g & sorteio_set)
            if hits > best_in_concurso:
                best_in_concurso = hits
        
        if best_in_concurso >= 11:
            stats[best_in_concurso] += 1
            
    return stats, total_concursos

print("--- ANÁLISE DO FECHAMENTO DO USUÁRIO ---")
total_c, c15, c14 = validate_coverage(USER_17_NUMS, user_games_sets)
print(f"Combinações de 15 em 17: {total_c}")
print(f"Garante 15 pontos: {c15} ({c15/total_c*100:.1f}%)")
print(f"Garante 14 pontos: {c14} ({c14/total_c*100:.1f}%)")

print("\n--- DESEMPENHO HISTÓRICO (8 JOGOS) ---")
hist_stats, total_conc = run_history_analysis(user_games_sets, DATA_FILE)
if hist_stats:
    print(f"Total de concursos analisados: {total_conc}")
    for pontos in [15, 14, 13, 12, 11]:
        print(f"{pontos} pontos: {hist_stats[pontos]} vezes")
