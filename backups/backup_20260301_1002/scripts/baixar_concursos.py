import urllib.request
import json
from collections import Counter
import time

print("Baixando TODOS os resultados da Lotofácil...")
print("Isso pode demorar alguns minutos...\n")

resultados = []

# Tentar baixar até o último disponível (limite de segurança 5000)
for i in range(1, 5000):
    url = f"https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{i}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            numeros = sorted([int(n) for n in data["dezenasSorteadasOrdemSorteio"]])
            resultados.append((i, numeros))
            if i % 100 == 0:
                print(f"✅ Baixados {i} concursos...")
    except Exception as e:
        print(f"❌ Erro no concurso {i}: {e}")
    time.sleep(0.1)  # respeitar a API

# Salvar em arquivo para não precisar baixar de novo
with open("resultados_lotofacil.json", "w") as f:
    json.dump(resultados, f)
print(f"\n💾 Salvos {len(resultados)} concursos em resultados_lotofacil.json")

# ANÁLISE COMPLETA
print("\n--- ANÁLISE COMPLETA ---\n")
contagem = Counter()

for idx in range(len(resultados)-1):
    conc_atual, nums_atual = resultados[idx]
    conc_prox,  nums_prox  = resultados[idx+1]
    fora = set(range(1,26)) - set(nums_atual)
    voltaram = fora & set(nums_prox)
    contagem[len(voltaram)] += 1

total = sum(contagem.values())
print(f"Total de concursos analisados: {total}\n")

print("Voltaram | Vezes | Percentual")
print("-" * 35)
for k in sorted(contagem):
    pct = contagem[k] / total * 100
    barra = "█" * int(pct)
    print(f"   {k}     |  {contagem[k]:>4} | {pct:>5.1f}%  {barra}")

print(f"\n✅ Mais frequente: {contagem.most_common(1)[0][0]} de fora voltando")