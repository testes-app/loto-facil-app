from itertools import combinations

sorteio = set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 2, 4])

resultados = {11: 0, 12: 0, 13: 0, 14: 0, 15: 0}

for combo in combinations(range(1, 26), 15):
    acertos = len(set(combo) & sorteio)
    if acertos >= 11:
        resultados[acertos] += 1

print(resultados)