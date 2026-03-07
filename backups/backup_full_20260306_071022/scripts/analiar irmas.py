import json
import os
from collections import Counter

# Caminho do arquivo de resultados
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "resultados_lotofacil.json")

def carregar_resultados():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)
    resultados = []
    if isinstance(dados, list):
        for item in dados:
            if isinstance(item, list) and len(item) == 2:
                dezenas = item[1]
            elif isinstance(item, dict):
                dezenas = item.get("dezenas") or item.get("numeros") or []
            else:
                continue
            if dezenas:
                resultados.append([int(d) for d in dezenas])
    elif isinstance(dados, dict):
        for v in dados.values():
            if isinstance(v, list):
                resultados.append([int(d) for d in v])
    return resultados

def analisar_parceiras(resultados, dezenas_alvo, top_n=15):
    for alvo in dezenas_alvo:
        alvo = int(alvo)
        contador = Counter()
        total_aparicoes = 0

        for sorteio in resultados:
            if alvo in sorteio:
                total_aparicoes += 1
                for d in sorteio:
                    if d != alvo:
                        contador[d] += 1

        print(f"\n{'='*50}")
        print(f"  Dezena {alvo:02d} — apareceu em {total_aparicoes} sorteios")
        print(f"{'='*50}")
        print(f"  {'Pos':<5} {'Dezena':<10} {'Juntas':<10} {'%'}")
        print(f"  {'-'*40}")
        for pos, (dez, qtd) in enumerate(contador.most_common(top_n), 1):
            pct = (qtd / total_aparicoes * 100) if total_aparicoes else 0
            print(f"  {pos:<5} {dez:02d}{'':<8} {qtd:<10} {pct:.1f}%")

    if len(dezenas_alvo) > 1:
        alvos = [int(d) for d in dezenas_alvo]
        contador_combo = Counter()
        total_combo = 0

        for sorteio in resultados:
            if all(a in sorteio for a in alvos):
                total_combo += 1
                for d in sorteio:
                    if d not in alvos:
                        contador_combo[d] += 1

        print(f"\n{'='*50}")
        print(f"  Dezenas {' + '.join(str(a) for a in alvos)} juntas — {total_combo} sorteios")
        print(f"{'='*50}")
        if total_combo == 0:
            print("  Nenhum sorteio com todas essas dezenas juntas.")
        else:
            print(f"  {'Pos':<5} {'Dezena':<10} {'Juntas':<10} {'%'}")
            print(f"  {'-'*40}")
            for pos, (dez, qtd) in enumerate(contador_combo.most_common(15), 1):
                pct = (qtd / total_combo * 100) if total_combo else 0
                print(f"  {pos:<5} {dez:02d}{'':<8} {qtd:<10} {pct:.1f}%")

def main():
    print("\n" + "="*50)
    print("  🎱 ANALISADOR DE PARCEIRAS — LOTOFÁCIL")
    print("="*50)

    try:
        resultados = carregar_resultados()
        print(f"  ✅ {len(resultados)} sorteios carregados.\n")
    except FileNotFoundError:
        print(f"  ❌ Arquivo não encontrado: {DATA_FILE}")
        print("  Verifique o caminho e tente novamente.")
        return

    while True:
        print("\n  Digite as dezenas que deseja pesquisar")
        print("  (separadas por vírgula ou espaço, ex: 8 17 ou 5,12,23)")
        print("  [Digite 'sair' para encerrar]\n")

        entrada = input("  >> ").strip()

        if entrada.lower() in ("sair", "exit", "q"):
            print("\n  Até logo! 👋\n")
            break

        entrada = entrada.replace(",", " ")
        partes = entrada.split()

        dezenas = []
        valido = True
        for p in partes:
            try:
                n = int(p)
                if 1 <= n <= 25:
                    dezenas.append(n)
                else:
                    print(f"  ⚠️  Dezena inválida: {n} (deve ser entre 1 e 25)")
                    valido = False
                    break
            except ValueError:
                print(f"  ⚠️  Valor inválido: '{p}'")
                valido = False
                break

        if not valido or not dezenas:
            print("  Por favor, digite dezenas válidas entre 1 e 25.")
            continue

        analisar_parceiras(resultados, dezenas)

        print("\n  Pressione Enter para fazer nova pesquisa...")
        input()

if __name__ == "__main__":
    main()