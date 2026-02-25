try:
    from colorama import init, Fore, Style
    init(autoreset=True)
    VERDE    = Fore.GREEN  + Style.BRIGHT
    AMARELO  = Fore.YELLOW + Style.BRIGHT
    VERMELHO = Fore.RED    + Style.BRIGHT
    CIANO     = Fore.CYAN   + Style.BRIGHT
    ROXO     = Fore.MAGENTA+ Style.BRIGHT
    AZUL     = Fore.BLUE   + Style.BRIGHT
    RESET    = Style.RESET_ALL
    NEGRITO  = Style.BRIGHT
except ImportError:
    # Fallback to ANSI codes if colorama is not installed
    VERDE   = "\033[92m"
    AMARELO = "\033[93m"
    VERMELHO = "\033[91m"
    CIANO   = "\033[96m"
    ROXO    = "\033[95m"
    AZUL    = "\033[94m"
    RESET   = "\033[0m"
    NEGRITO = "\033[1m"

def format_currency(value):
    return f"R${value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
