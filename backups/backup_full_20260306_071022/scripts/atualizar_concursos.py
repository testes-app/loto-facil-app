import urllib.request
import json
import os
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "data", "resultados_lotofacil.json")

def carregar_resultados():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar_resultados(dados):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False)

def baixar_concurso(numero):
    url = f"https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{numero}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            numeros = sorted([int(n) for n in data["dezenasSorteadasOrdemSorteio"]])
            return numeros
    except Exception:
        return None

def main():
    print("\n" + "="*50)
    print("  🔄 ATUALIZADOR DE CONCURSOS — LOTOFÁCIL")
    print("="*50)

    # Carregar dados existentes
    dados = carregar_resultados()

    # Pegar último concurso no arquivo
    ultimo = max(item[0] for item in dados if isinstance(item, list))
    print(f"\n  Último concurso no arquivo: {ultimo}")

    # Buscar novos concursos
    print(f"  Buscando concursos a partir do {ultimo + 1}...\n")

    adicionados = 0
    concurso = ultimo + 1

    while True:
        numeros = baixar_concurso(concurso)
        if numeros is None:
            print(f"  ℹ️  Concurso {concurso} não encontrado — arquivo atualizado!")
            break

        dados.append([concurso, numeros])
        print(f"  ✅ Concurso {concurso}: {numeros}")
        adicionados += 1
        concurso += 1
        time.sleep(0.3)

    if adicionados > 0:
        dados.sort(key=lambda x: x[0] if isinstance(x, list) else 0)
        salvar_resultados(dados)
        print(f"\n  💾 {adicionados} concurso(s) adicionado(s) com sucesso!")
        print(f"  Total de sorteios no arquivo: {len(dados)}")
    else:
        print("\n  ✅ Arquivo já está atualizado!")

    print()

if __name__ == "__main__":
    main()