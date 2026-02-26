import json
import numpy as np
from itertools import combinations
from collections import Counter

# Carregar resultados salvos
with open("resultados_lotofacil.json", "r") as f:
    resultados = json.load(f)

print("Gerando todas as combinações de cobertura (5,6,7 de fora)...")

# Prêmios médios
premios = {15: 1_500_000, 14: 1_500, 13: 25, 12: 10, 11: 5}

def gerar_apostas(nums_atual):
    fora = [n for n in range(1, 26) if n not in nums_atual]
    dentro = list(nums_atual)
    apostas = []
    for qtd in [5, 6, 7]:
        for grupo_fora in combinations(fora, qtd):
            for comp in combinations(dentro, 15 - qtd):
                apostas.append(frozenset(grupo_fora) | frozenset(comp))
    return apostas

total_gasto = 0
total_ganho = 0
acertos_totais = Counter()
ganhou_15 = 0

print(f"Simulando {len(resultados)-1} concursos...\n")

for idx in range(len(resultados)-1):
    conc_atual, nums_atual = resultados[idx]
    conc_prox,  nums_prox  = resultados[idx+1]
    prox_set = set(nums_prox)

    apostas = gerar_apostas(nums_atual)
    apostas_np = np.array([sorted(a) for a in apostas], dtype=np.int8)
    prox_np = np.array(sorted(prox_set), dtype=np.int8)

    # Calcular acertos vetorizado
    acertos = np.sum(np.isin(apostas_np, prox_np), axis=1)

    ganho = 0
    for pts, valor in premios.items():
        qtd = np.sum(acertos == pts)
        if qtd > 0:
            ganho += int(qtd) * valor
            acertos_totais[pts] += int(qtd)

    gasto = len(apostas) * 3
    total_gasto += gasto
    total_ganho += ganho

    if acertos_totais[15] > ganhou_15:
        ganhou_15 = acertos_totais[15]
        print(f"🎯 15 pontos no concurso {conc_prox}!")

    if idx % 200 == 0:
        print(f"Concurso {conc_atual} | Investido: R$ {total_gasto:,.0f} | Ganho: R$ {total_ganho:,.0f}")

print("\n" + "="*55)
print("RESUMO FINAL")
print("="*55)
print(f"Concursos simulados  : {len(resultados)-1:,}")
print(f"Apostas por concurso : {len(gerar_apostas(resultados[0][1])):,}")
print(f"Custo por concurso   : R$ {len(gerar_apostas(resultados[0][1]))*3:,.2f}")
print(f"\nTotal investido      : R$ {total_gasto:,.2f}")
print(f"Total ganho          : R$ {total_ganho:,.2f}")
print(f"Saldo                : R$ {total_ganho - total_gasto:,.2f}")
print(f"Retorno              : {(total_ganho/total_gasto)*100:.1f}%")
print(f"\n15 pontos            : {acertos_totais[15]:,} vezes")
print(f"14 pontos            : {acertos_totais[14]:,} vezes")
print(f"13 pontos            : {acertos_totais[13]:,} vezes")
print(f"12 pontos            : {acertos_totais[12]:,} vezes")
print(f"11 pontos            : {acertos_totais[11]:,} vezes")