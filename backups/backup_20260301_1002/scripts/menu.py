import subprocess
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR   = os.path.dirname(SCRIPT_DIR)

def rodar(script):
    caminho = os.path.join(SCRIPT_DIR, script)
    if os.path.exists(caminho):
        subprocess.run([sys.executable, caminho])
    else:
        print(f"\n  ❌ Script não encontrado: {caminho}\n")

def cabecalho():
    os.system("cls" if os.name == "nt" else "clear")
    print("\n" + "="*60)
    print("          🎱 LOTO MATRIX — MENU PRINCIPAL")
    print("="*60)

def menu():
    while True:
        cabecalho()
        print("""
  ── ANÁLISE ─────────────────────────────────────────────
  [1] Analisar Parceiras de Dezenas
  [2] Análise de Frequência / Retorno Financeiro
  [3] Análise de Voltas
  [4] Atraso das 17 dezenas
  [5] Calcular Probabilidades
  [6] Contar Apostas com Filtros
  [7] Filtros Lotofácil
  [8] Todos os 14 Pontos
  [9] Total de Resultados

  ── ATUALIZAÇÃO ─────────────────────────────────────────
  [A] Atualizar Concursos (novos sorteios)
  [R] Atualizar Rankings Completos (API + Git)

  ── MENU EXTERNO ────────────────────────────────────────
  [M] Abrir Menu do Desktop (Lotofacil de todo.py)

  ── SAIR ────────────────────────────────────────────────
  [S] Sair
""")
        print("="*60)
        escolha = input("  Escolha: ").strip().upper()
        print()

        if escolha == "1":
            rodar("analiar irmas.py")
        elif escolha == "2":
            rodar("analise_frequencia.py")
        elif escolha == "3":
            rodar("analise_voltas.py")
        elif escolha == "4":
            rodar("atraso_17dezenas.py")
        elif escolha == "5":
            rodar("calculo_probabilidades.py")
        elif escolha == "6":
            rodar("contar_apostas_filtros.py")
        elif escolha == "7":
            rodar("filtros_lotofacil.py")
        elif escolha == "8":
            rodar("todos_14_pontos.py")
        elif escolha == "9":
            rodar("todos_resultados_total.py")
        elif escolha == "A":
            rodar("atualizar_concursos.py")
        elif escolha == "R":
            rodar("atualizar_rankings.py")
        elif escolha == "M":
            rodar("menu.py")
        elif escolha == "S":
            print("  Até logo! 👋\n")
            break
        else:
            print("  ⚠️  Opção inválida. Tente novamente.\n")
            input("  Pressione Enter para continuar...")

if __name__ == "__main__":
    menu()