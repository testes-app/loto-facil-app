import json
import os
from collections import Counter
from itertools import combinations

# Configuration
BASE_DIR = r"C:\Users\nome_do_usuario\LotoMatrix"
DATA_FILE = os.path.join(BASE_DIR, "data", "resultados_lotofacil.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "dashboard_data.json")

PRIMOS = {2, 3, 5, 7, 11, 13, 17, 19, 23}
FIBONACCI = {1, 2, 3, 5, 8, 13, 21}
MOLDURA = {1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25}

def analyze():
    if not os.path.exists(DATA_FILE):
        print(f"Erro: Arquivo {DATA_FILE} não encontrado.")
        return

    with open(DATA_FILE, "r") as f:
        resultados_raw = json.load(f)

    # Sort results by contest number (asc) and filter out non-list items
    resultados = [r for r in resultados_raw if isinstance(r, list)]
    resultados.sort(key=lambda x: x[0])

    num_concursos = len(resultados)
    dezenas_all = []
    for r in resultados:
        dezenas_all.extend(r[1])

    # 1. Overall Frequency
    freq_total = Counter(dezenas_all)
    
    # 2. Recent Frequency (Last 10 and 50)
    freq_10 = Counter()
    for r in resultados[-10:]:
        freq_10.update(r[1])
        
    freq_50 = Counter()
    for r in resultados[-50:]:
        freq_50.update(r[1])

    # 3. Last Result and Trends
    ultimo_concurso = resultados[-1]
    penultimo_concurso = resultados[-2]
    
    repetidos_ultimo = len(set(ultimo_concurso[1]) & set(penultimo_concurso[1]))
    
    # 4. Cycles (Delays)
    atrasos = {}
    for i in range(1, 26):
        found = False
        for idx, r in enumerate(reversed(resultados)):
            if i in r[1]:
                atrasos[i] = idx
                found = True
                break
        if not found:
            atrasos[i] = num_concursos

    # 5. Cycle Analysis (Numbers missing to complete a cycle of 1 to 25)
    cycle_missing = set(range(1, 26))
    for r in reversed(resultados):
        cycle_missing -= set(r[1])
        if not cycle_missing: # Cycle completed in a previous contest
            # Find the start of the current cycle
            break
    
    # Actually, let's just find the numbers that haven't appeared since the last "full set"
    current_cycle_missing = set(range(1, 26))
    for r in reversed(resultados):
        current_cycle_missing -= set(r[1])
        if not current_cycle_missing:
            # Re-calculate for the very current cycle
            # We need to find the breakpoint where a cycle ended
            current_cycle_missing = set(range(1, 26))
            for r2 in reversed(resultados):
                current_cycle_missing -= set(r2[1])
                if len(current_cycle_missing) == 0:
                    # Breakpoint found. But wait, this is iterative.
                    # Simplified: just show dezenas with highest delay.
                    break
            break
            
    # 6. Pattern Distribution (Last 100)
    stats_history = []
    for r in resultados[-100:]:
        d = sorted(r[1])
        soma = sum(d)
        pares = len([n for n in d if n % 2 == 0])
        impares = 15 - pares
        primos = len(set(d) & PRIMOS)
        fibo = len(set(d) & FIBONACCI)
        moldura = len(set(d) & MOLDURA)
        
        # Sequencias
        seq_max = 0
        current_seq = 1
        for i in range(len(d)-1):
            if d[i+1] - d[i] == 1:
                current_seq += 1
            else:
                seq_max = max(seq_max, current_seq)
                current_seq = 1
        seq_max = max(seq_max, current_seq)

        stats_history.append({
            "id": r[0],
            "soma": soma,
            "pares": pares,
            "impares": impares,
            "primos": primos,
            "fibo": fibo,
            "moldura": moldura,
            "sequencia": seq_max
        })

    # 7. Heatmap Data (Matrix 5x5)
    heatmap = [0] * 25
    for i in range(1, 26):
        heatmap[i-1] = freq_total[i]

    # 8. Full History for Simulation (Simplified)
    full_results = [r[1] for r in resultados]

    # 9. Load Rankings (17, 18, 19, 20)
    rankings = {}
    ultimo_conc_val = ultimo_concurso[0]
    rankings_dir = os.path.join(BASE_DIR, "src", "data", "resultados")
    
    for d in [17, 18, 19, 20]:
        # Try to find the file for the current contest or previous ones
        found_ranking = []
        for c in range(ultimo_conc_val, ultimo_conc_val - 10, -1):
            file_name = f"top10_{d}dezenas_{c}concursos.json"
            file_path = os.path.join(rankings_dir, file_name)
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as rf:
                        found_ranking = json.load(rf)
                    break
                except Exception:
                    continue
        rankings[str(d)] = found_ranking

    # 10. Recurrence & Triplets (Elite Plus)
    # Average Recurrence: Average gap between appearances
    recurrence = {}
    for n in range(1, 26):
        positions = [idx for idx, r in enumerate(resultados) if n in r[1]]
        if len(positions) > 1:
            gaps = [positions[i] - positions[i-1] for i in range(1, len(positions))]
            recurrence[n] = round(sum(gaps) / len(gaps), 2)
        else:
            recurrence[n] = num_concursos

    # Triplets (Last 100)
    triplet_counts = Counter()
    for r in resultados[-100:]:
        for combo in combinations(sorted(r[1]), 3):
            triplet_counts[combo] += 1
    
    top_triplets = []
    for combo, count in triplet_counts.most_common(15):
        top_triplets.append({"dezenas": list(combo), "count": count})

    # Consolidate
    dashboard_data = {
        "concurso": ultimo_concurso[0],
        "dezenas": ultimo_concurso[1],
        "repetidos_anterior": repetidos_ultimo,
        "frequencia_total": freq_total,
        "frequencia_10": freq_10,
        "frequencia_50": freq_50,
        "atrasos": atrasos,
        "recurrence": recurrence,
        "triplets": top_triplets,
        "stats_100": stats_history,
        "heatmap": heatmap,
        "total_concursos": num_concursos,
        "history": full_results,
        "missing_cycle": list(current_cycle_missing),
        "rankings": rankings
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=4, ensure_ascii=False)
    
    print(f"Sucesso: Dados consolidados em {OUTPUT_FILE}")

if __name__ == "__main__":
    analyze()
