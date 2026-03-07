from .config import PESOS
import math

def calcular_acertos(jogo, sorteio_dezenas):
    """Calcula quantos números do jogo estão no sorteio."""
    return len(jogo & sorteio_dezenas)

def calcular_score(jogo_set, concursos):
    """
    Calcula o score de uma combinação baseado em pesos históricos.
    jogo_set: frozenset das dezenas do jogo
    concursos: lista de (id, data, dezenas_set)
    """
    ct = {11: 0, 12: 0, 13: 0, 14: 0, 15: 0}
    for _, _, d in concursos:
        acertos = len(d & jogo_set)
        if acertos >= 11:
            ct[acertos] += 1
    
    score = sum(ct[f] * PESOS[f] for f in PESOS)
    return score, ct


def calcular_atraso(jogo_set, concursos, ponto_minimo):
    """
    Calcula o atraso (quantos concursos desde o último acerto >= ponto_minimo).
    Retorna (atraso_count, ultimo_concurso_id, acertos_no_ultimo)
    """
    concursos_ordenados = sorted(concursos, key=lambda x: x[0], reverse=True)
    
    for i, (cid, data, d) in enumerate(concursos_ordenados):
        acertos = len(d & jogo_set)
        if acertos >= ponto_minimo:
            return i, cid, acertos
            
    return len(concursos), None, 0

# --- NOVOS FILTROS ESTATÍSTICOS (SUPER ALGORITMO) ---

PRIMOS = {2, 3, 5, 7, 11, 13, 17, 19, 23}

def validar_estatisticas(jogo_set):
    """
    Valida se uma combinação está dentro dos 'N Fatores' ideais.
    Retorna (booleano, dict_detalhes)
    """
    soma = sum(jogo_set)
    pares = len([n for n in jogo_set if n % 2 == 0])
    impares = len(jogo_set) - pares
    primos = len(jogo_set & PRIMOS)
    
    # Regras de Super Filtragem
    regras = {
        "soma": 160 <= soma <= 220,
        "par_impar": (7 <= pares <= 9) or (7 <= impares <= 9),
        "primos": 4 <= primos <= 7
    }
    
    valido = all(regras.values())
    
    detalhes = {
        "soma": soma,
        "pares": pares,
        "impares": impares,
        "primos": primos,
        "regras": regras
    }
    
    return valido, detalhes
