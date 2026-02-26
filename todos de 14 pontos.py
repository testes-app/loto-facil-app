from itertools import combinations

sorteio = set([1, 2, 4, 7, 9, 11, 12, 15, 16, 18, 19, 20, 21, 24, 25])

print("Buscando todas as apostas com 14 pontos...\n")

encontrados = []

for i, combo in enumerate(combinations(range(1, 26), 15), 1):
    acertos = len(set(combo) & sorteio)
    if acertos == 14:
        encontrados.append((i, list(combo)))
        print(f"Linha {i:>10,} → {list(combo)}")
    
    if i % 500000 == 0:
        print(f"Processadas {i:,}...", end="\r")

print(f"\nTotal encontrado: {len(encontrados)} apostas com 14 pontos")