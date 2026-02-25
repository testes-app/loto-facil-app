# LotoMatrix 🎲

App mobile (React Native / Expo) para análise e acompanhamento da **Lotofácil**.

---

## 📱 Funcionalidades

- **Home** — Visão geral e último concurso
- **Histórico** — Resultados dos últimos sorteios (busca da API oficial da Caixa)
- **Rankings** — Top 10 melhores combinações de 17, 18, 19 e 20 dezenas, com score, atraso e frequência de acertos

---

## 🏗️ Tecnologias

- React Native + Expo
- EAS Build (APK via `eas build --platform android --profile preview`)
- `expo-updates` para atualização OTA
- Dados remotos via **GitHub Raw** (sem precisar de novo build!)

---

## 🔄 Sistema de Atualização de Rankings

Os rankings são gerados pelos scripts Python e ficam armazenados como JSONs no repositório.

**O app busca dados em 3 camadas:**

```
1. Cache local (AsyncStorage)        ← mais rápido
2. GitHub Raw (dados remotos)        ← atualizado sem build
3. Bundled (incluído no APK)         ← fallback offline
```

### Como atualizar os rankings após um novo concurso

```bash
# Na raiz do projeto:
python atualizar_rankings.py
```

O script faz automaticamente:

1. ⬇️  Baixa os concursos novos da API da Caixa
2. 📊 Recalcula scores e atrasos para 17, 18, 19 e 20 dezenas
3. 💾 Salva os JSONs em `resultados/` e `src/data/resultados/`
4. 🚀 Faz `git push` para o GitHub

> **O app atualiza automaticamente** na próxima abertura — sem precisar de novo APK!

---

## 📁 Estrutura relevante

```
LotoMatrix/
├── atualizar_rankings.py          # Script de atualização dos rankings
├── loto_core/                     # Módulos Python de análise
│   ├── config.py
│   ├── data.py
│   ├── logic.py
│   ├── results.py
│   └── utils.py
├── resultados/                    # JSONs de rankings (versionados)
├── src/
│   ├── data/resultados/           # Cópia dos JSONs (bundled no app)
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── HistoryScreen.js
│   │   └── RankingsScreen.js
│   └── services/
│       └── LotofacilAPI.js        # Fetch da API da Caixa + GitHub
├── app.json
├── eas.json
└── package.json
```

---

## 🚀 Build do APK

```bash
# Instalar dependências
npm install

# Build preview (APK Android)
eas build --platform android --profile preview
```

---

## 📊 Formato dos arquivos de ranking

```json
[
  {
    "score": 12345,
    "counts": { "15": 2, "14": 8, "13": 25, "12": 60, "11": 120 },
    "dezenas": [1, 3, 5, 7, 10, 12, 14, 16, 18, 20, 21, 22, 23, 24, 25],
    "atraso": 3
  }
]
```

Nome do arquivo: `top10_{N}dezenas_{concurso}concursos.json`
