from math import comb

def posicao_combinacao(combo):
    """
    Calcula a posição de uma combinação sem varrer todas as outras.
    Usa o sistema de numeração combinatória (combinatorial number system).
    """
    n = 25  # números de 1 a 25
    k = 15  # escolher 15
    
    combo = sorted(combo)
    posicao = 0
    
    for i, num in enumerate(combo):
        # Quantas combinações existem antes desta escolha
        inicio = (combo[i-1] if i > 0 else 0)
        for v in range(inicio + 1, num):
            posicao += comb(n - v, k - i - 1)
    
    return posicao + 1  # +1 porque começa em 1

# Teste com o resultado do Concurso 3620
sorteio = [1, 2, 4, 7, 9, 11, 12, 15, 16, 18, 19, 20, 21, 24, 25]
pos = posicao_combinacao(sorteio)
print(f"Resultado: {sorteio}")
print(f"Posição:   {pos:,}")

# Teste com outra combinação qualquer
outro = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
print(f"\nResultado: {outro}")
print(f"Posição:   {posicao_combinacao(outro):,}")

outro2 = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
print(f"\nResultado: {outro2}")
print(f"Posição:   {posicao_combinacao(outro2):,}")