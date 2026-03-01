# LotoMatrix 🎲

App mobile (React Native / Expo) para análise e acompanhamento da **Lotofácil**.

---

## 📝 Changelog / Notas de Atualização

### 26/02/2026 — Correção do cache do ranking + concurso 3621

**Problema:** A aba Rankings sempre mostrava os dados do concurso 3620, mesmo depois de novos concursos.

**Causa raiz:** O `AsyncStorage` guardava o cache com uma chave genérica (`ranking_17_3620`). Quando o app tentava buscar dados de um concurso mais recente e não encontrava no GitHub, caía no fallback bundled. O cache nunca era invalidado automaticamente.

**O que foi corrigido (`LotofacilAPI.js` + `RankingsScreen.js`):**

- Cache agora usa chave versionada `ranking_v2_{dezenas}_{concurso}` — caches antigos são ignorados automaticamente
- O botão **⟳ (refresh)** agora **limpa todo o cache** antes de buscar, garantindo dados frescos do GitHub
- O loop de busca foi limitado a 10 concursos atrás (antes ia até 3619, gerando centenas de requisições)
- Adicionada função `clearRankingsCache()` no serviço para uso futuro

**Dados atualizados:**

- Concurso **3621** baixado da API da Caixa: `01 02 04 06 07 09 10 11 13 15 18 22 23 24 25`
- JSONs `top10_{17/18/19/20}dezenas_3621concursos.json` gerados e publicados no GitHub
- EAS Update publicado → canal `production` → ID `32266c04-1758-4738-8a81-ef224c74f66c`

**Como atualizar amanhã (após concurso 3622+):**

```powershell
$env:PYTHONIOENCODING='utf-8'; python scripts/atualizar_rankings.py
```

Depois, se houve mudança de código, também publicar o EAS Update:

```bash
eas update --branch production --message "update: concurso XXXX"
```

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

```bash
1. Cache local (AsyncStorage)        ← mais rápido
2. GitHub Raw (dados remotos)        ← atualizado sem build
3. Bundled (incluído no APK)         ← fallback offline
```

### Como atualizar os rankings após um novo concurso

```bash
# Na raiz do projeto:
python scripts/atualizar_rankings.py
```

O script faz automaticamente:

1. ⬇️  Baixa os concursos novos da API da Caixa
2. 📊 Recalcula scores e atrasos para 17, 18, 19 e 20 dezenas
3. 💾 Salva os JSONs em `resultados/` e `src/data/resultados/`
4. 🚀 Faz `git push` para o GitHub

> **O app atualiza automaticamente** na próxima abertura — sem precisar de novo APK!

---

## 📁 Estrutura relevante

```text
LotoMatrix/
├── scripts/                       # Scripts Python de análise e manutenção
│   ├── atualizar_rankings.py      # Script principal de atualização
│   ├── menu.py                    # Atalho para o menu do desktop
│   └── ...                        # Outras ferramentas de análise
├── data/                          # Cache e arquivos de dados JSON
│   ├── lotofacil_cache.json
│   └── resultados_lotofacil.json
├── loto_core/                     # Módulos Python de lógica (core)
│   ├── config.py
│   ├── data.py
│   ├── logic.py
│   ├── results.py
│   └── utils.py
├── resultados/                    # JSONs de rankings por concurso
├── src/
│   ├── data/resultados/           # Cópia dos JSONs (bundled no app)
│   ├── screens/
│   └── services/
├── build_logs/                    # Logs e metadados de builds (EAS/Android)
├── backups/                       # Backups de arquivos importantes
├── app.json
├── eas.json
└── package.json
```

---

## 🔄 Sistemas de Atualização

O app possui **dois** sistemas de atualização independentes para evitar builds constantes:

### 1. Atualização de Dados (Rankings)

Os rankings são JSONs buscados diretamente do GitHub.

- **Como funciona:** O script Python gera os dados -> faz push -> o app lê a URL "Raw".
- **Frequência:** Diária (após cada concurso).
- **Impacto:** Apenas os números e estatísticas mudam.

### 2. Atualização de Código (EAS Update / OTA)

Funcionalidades novas, cores, botões e correções de bugs no React Native.

- **Como funciona:** Comando `eas update --branch production`.
- **Identificação:** O app baixa em silêncio na 1ª abertura e aplica na 2ª abertura.

---

## 🔐 Entendendo o Runtime Version (Importante!)

Para que o **EAS Update** funcione, o "Runtime" do APK instalado precisa ser compatível com a atualização publicada.

### A Mudança para `sdkVersion` (v1.5.0+)

Anteriormente, usávamos a policy `appVersion`. Isso era instável pois qualquer pequena mudança no APK impedia o recebimento de códigos novos (conflito de versões).

**Configuração Atual (`app.json`):**

```json
"runtimeVersion": {
  "policy": "sdkVersion"
}
```

- **Vantagem:** O canal de atualização agora é baseado na versão do SDK do Expo (atualmente 54).
- **Estabilidade:** Você pode instalar o APK v1.5.0 hoje e ele aceitará centenas de atualizações futuras sem precisar reinstalar o arquivo, desde que fiquem no mesmo SDK.

> [!IMPORTANT]
> **Regra de Ouro:** Se mudarmos algo "nativo" (como adicionar uma permissão de câmera ou Bluetooth), um novo build (`eas build`) será necessário. Para mudanças visuais e de lógica, apenas `eas update` resolve.

---

## 🚀 Build e Atualização

### Novo APK (Mudanças Nativas)

```bash
eas build --platform android --profile preview
```

### Novo Update (Mudanças de UI/Lógica)

```bash
eas update --branch production --message "Descrição da melhoria"
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
