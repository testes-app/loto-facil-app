import urllib.request
import json
from collections import Counter

print("Baixando resultados da Lotofácil...")

# API da Caixa
resultados = []
concurso = 3620  # começa do mais recente e vai voltando

for i in range(3620, 3520, -1):  # últimos 100 concursos
    url = f"https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{i}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as r:
            data = json.loads(r.read())
            numeros = sorted([int(n) for n in data["dezenasSorteadasOrdemSorteio"]])
            resultados.append((i, numeros))
            print(f"Concurso {i}: {numeros}")
    except:
        print(f"Concurso {i}: erro ao baixar")

# Análise
print("\n--- ANÁLISE: quantos dos 10 de fora voltam no próximo concurso ---\n")
contagem = Counter()

for idx in range(len(resultados)-1):
    conc_atual, nums_atual = resultados[idx+1]  # anterior
    conc_prox,  nums_prox  = resultados[idx]    # próximo

    fora = set(range(1,26)) - set(nums_atual)
    voltaram = fora & set(nums_prox)
    contagem[len(voltaram)] += 1
    print(f"Concurso {conc_prox}: voltaram {len(voltaram)} dos 10 de fora → {sorted(voltaram)}")

print("\n--- RESUMO ---")
for k in sorted(contagem):
    print(f"{k} de fora voltaram: {contagem[k]} vezes")