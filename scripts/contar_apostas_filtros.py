import json
from itertools import combinations

with open("resultados_lotofacil.json", "r") as f:
    resultados = json.load(f)

# Pegar o último concurso como base
conc_atual, nums_atual = resultados[-1]
fora = [n for n in range(1, 26) if n not in nums_atual]

print(f"Último concurso: {conc_atual}")
print(f"Números sorteados: {nums_atual}")
print(f"10 de fora: {fora}")
print(f"\nContando apostas com filtros...\n")

total_sem_filtro = 0
total_com_filtro = 0

for qtd in [5, 6, 7]:
    for grupo_fora in combinations(fora, qtd):
        for comp in combinations(nums_atual, 15 - qtd):
            combo = sorted(list(grupo_fora) + list(comp))
            total_sem_filtro += 1

            # FILTRO 1 - Pares entre 6 e 9
            pares = len([n for n in combo if n % 2 == 0])
            if pares < 6 or pares > 9:
                continue

            # FILTRO 2 - Soma entre 170 e 220
            soma = sum(combo)
            if soma < 170 or soma > 220:
                continue

            # FILTRO 3 - Consecutivos entre 7 e 10
            consec = sum(1 for i in range(14) if combo[i+1] - combo[i] == 1)
            if consec < 7 or consec > 10:
                continue

            total_com_filtro += 1

print(f"Sem filtros : {total_sem_filtro:>10,} apostas  R$ {total_sem_filtro*3:,.2f}")
print(f"Com filtros : {total_com_filtro:>10,} apostas  R$ {total_com_filtro*3:,.2f}")
print(f"Eliminadas  : {total_sem_filtro-total_com_filtro:>10,} apostas")
print(f"Redução     : {(1-total_com_filtro/total_sem_filtro)*100:.1f}%")