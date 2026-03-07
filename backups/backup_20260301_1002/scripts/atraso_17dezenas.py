import json
from itertools import combinations

import os

# Caminho para os dados
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "resultados_lotofacil.json")

with open(DATA_FILE, "r") as f:
    resultados = json.load(f)

sorteios = [(c, set(n)) for c, n in resultados]
total = len(sorteios)

print("Analisando atraso de conjuntos de 17 dezenas...")
print(f"Total de concursos: {total}\n")

maior_atraso = 0
conjunto_mais_atrasado = None
concurso_visto = None

for i, combo in enumerate(combinations(range(1, 26), 17)):
    combo_set = set(combo)

    for idx in range(total-1, -1, -1):
        conc, nums = sorteios[idx]
        if nums.issubset(combo_set):
            atraso = (total - 1) - idx
            if atraso > maior_atraso:
                maior_atraso = atraso
                conjunto_mais_atrasado = combo
                concurso_visto = conc
            break
    # Se nunca apareceu, ignora

    if i % 100000 == 0:
        print(f"Processados {i:,} conjuntos...", end="\r")

print(f"\n🎯 CONJUNTO MAIS ATRASADO (que já apareceu pelo menos uma vez):")
print(f"Dezenas : {list(conjunto_mais_atrasado)}")
print(f"Atraso  : {maior_atraso} concursos")
print(f"Último visto no concurso: {concurso_visto}")
print(f"Ou seja: há {maior_atraso} concursos sem aparecer!")