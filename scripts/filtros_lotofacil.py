import json
from collections import Counter

with open("resultados_lotofacil.json", "r") as f:
    resultados = json.load(f)

print("="*55)
print("ANÁLISE DE PADRÕES PARA FILTROS")
print("="*55)

pares_totais = []
impares_totais = []
soma_totais = []
sequencias_totais = []
dezenas_voltaram = []

for idx in range(len(resultados)-1):
    conc_atual, nums_atual = resultados[idx]
    conc_prox,  nums_prox  = resultados[idx+1]

    fora = [n for n in range(1, 26) if n not in nums_atual]
    voltaram = [n for n in fora if n in nums_prox]

    # Quantos pares/ímpares no sorteio
    pares = len([n for n in nums_prox if n % 2 == 0])
    impares = 15 - pares
    pares_totais.append(pares)

    # Soma total
    soma_totais.append(sum(nums_prox))

    # Sequências (números consecutivos)
    seq = 0
    for i in range(len(sorted(nums_prox))-1):
        if sorted(nums_prox)[i+1] - sorted(nums_prox)[i] == 1:
            seq += 1
    sequencias_totais.append(seq)

    # Quais posições dos 10 de fora voltam mais
    for n in voltaram:
        dezenas_voltaram.append(n)

# FILTRO 1 - Pares e Ímpares
print("\n📊 FILTRO 1 - Quantidade de PARES no sorteio:")
c = Counter(pares_totais)
for k in sorted(c):
    pct = c[k]/len(pares_totais)*100
    print(f"  {k} pares: {c[k]:>4} vezes ({pct:.1f}%)")

# FILTRO 2 - Soma
print("\n📊 FILTRO 2 - Soma dos 15 números:")
print(f"  Mínima : {min(soma_totais)}")
print(f"  Máxima : {max(soma_totais)}")
print(f"  Média  : {sum(soma_totais)/len(soma_totais):.1f}")
c = Counter(soma_totais)
mais_comum = c.most_common(5)
print(f"  5 somas mais frequentes: {mais_comum}")

# FILTRO 3 - Sequências
print("\n📊 FILTRO 3 - Números consecutivos no sorteio:")
c = Counter(sequencias_totais)
for k in sorted(c):
    pct = c[k]/len(sequencias_totais)*100
    print(f"  {k} consecutivos: {c[k]:>4} vezes ({pct:.1f}%)")

# FILTRO 4 - Quais dezenas dos 10 de fora voltam mais
print("\n📊 FILTRO 4 - Dezenas que mais voltam quando ficam de fora:")
c = Counter(dezenas_voltaram)
for n, qtd in sorted(c.items()):
    pct = qtd/sum(c.values())*100
    barra = "█" * int(pct*2)
    print(f"  Dezena {n:>2}: {qtd:>4} vezes ({pct:.1f}%) {barra}")