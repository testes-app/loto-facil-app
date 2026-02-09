# 📊 Loto Master - Inteligência em Loteria

Aplicativo de elite para análise, geração e gerenciamento de jogos da Lotofácil. Transformado de um template simples em um ecossistema analítico completo com design premium e estabilidade máxima.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Style](https://img.shields.io/badge/Identity-Red_Vibrant-e11d48)
![Status](https://img.shields.io/badge/Status-Store_Ready-success)

---

## 📱 Destaques do Ecossistema

### 🎨 Identidade Visual Premium

- **Branding Profissional:** Evolução para a marca "Inteligência em Loteria".
- **Tema Vibrant Red:** Interface sofisticada em tons de vermelho escuro, otimizada para legibilidade e estética moderna.
- **Micro-animações:** Transições fluidas e feedback visual em tempo real.

### 📈 Dashboard Analítico (Padrão LotoIA)

- **Gráfico de Alta Densidade:** Visualização instantânea da frequência das 25 dezenas em uma única tela.
- **Status das Dezenas:** Classificação inteligente por cores:
  - 🔥 **Quente (Red):** Alta frequência.
  - 🟠 **Morno (Orange):** Frequência estável.
  - 🟣 **Neutro (Purple):** Frequência média.
  - 🔵 **Frio (Blue):** Baixa frequência.
- **Valores In-Bar:** Números de ocorrência exibidos diretamente dentro das barras do gráfico.
- **Último Sorteio:** Exibição imediata das 15 bolas do último concurso no topo do dashboard.

### ⚖️ Estatísticas Avançadas

- **Equilíbrio Global:** Análise de Pares vs Ímpares.
- **Distribuição de Faixas:** Métricas para números Baixos (1-8), Médios (9-17) e Altos (18-25).
- **Listas de Elite:** Top 5 Números Quentes e Top 5 Números Frios.

### 🔄 Atualizações Invisíveis (EAS OTA)

- **Zero Reinstalação:** Novas funcionalidades e correções chegam ao celular via Over-the-Air.
- **Garantia de Estabilidade:** Sistema de atualização automática que mantém o app sempre na versão master mais segura.

---

## 🚀 Funcionalidades Principais

1. **Dashboard:** Visão geral analítica e resultados instantâneos.
2. **Gerador Inteligente:** Algoritmos que respeitam tendências estatísticas com botão de **Cópia Rápida** para todas as sugestões.
3. **Análise IA Profunda:** Sugestões dinâmicas baseadas em histórico real, com opções de **Salvar** e **Copiar**.
4. **Navegação Fluida:** Botão de **Voltar (←)** em todas as telas para acesso instantâneo à Home.
5. **Resultados:** Histórico completo com detalhamento técnico.
6. **Conferência:** Validação automática de acertos e faixas de premiação.
7. **Meus Jogos:** Gerenciamento centralizado de apostas salvas.

---

## 🛠️ Stack Tecnológica

- **Expo SDK 54 / React Native 0.81**
- **IA Strategy Engine:** Algoritmo dinâmico que filtra dezenas quentes/médias/frias com introdução de variedade estatística (Anti-repetição).
- **Clipboard Management:** Integração nativa para compartilhamento e cópia de jogos.
- **Custom Stability Layer:** Implementação de gráficos via View nativa (eliminando crashes de SVG/externos).
- **Resultados Context API:** Sincronização de dados em tempo real em todo o app.
- **AsyncStorage Master:** Cache e persistência local de alta performance.
- **EAS Pipeline:** Preparado para distribuição via Google Play Store e Updates OTA.

---

## 🏗️ Manutenção e Atualizações (EAS Update)

Para garantir que as atualizações cheguem corretamente aos aparelhos instalados, siga estas diretrizes:

### 1. Publicação de Alterações

Sempre publique utilizando o canal correto vinculado ao build (ex: `preview` ou `production`):

```bash
# Publicar na branch main
npx eas-cli update --branch main --message "Descrição da mudança"

# Garantir que o canal está apontando para a branch correta
npx eas-cli channel:edit preview --branch main
```

### 2. Sincronização Agressiva

O arquivo `app.json` está configurado com `fallbackToCacheTimeout: 30000`. Isso força o aplicativo a aguardar até 30 segundos na tela de Splash para baixar novos pacotes antes de carregar a versão antiga do cache.

### 3. Dica de Forçamento (Manual)

Caso um aparelho não receba a atualização:

1. Feche o app completamente.
2. Limpe o **Cache** (não os dados) nas configurações do Android.
3. Abra e aguarde na Splash Screen.

---

**Loto Master - Inteligência em Loteria** 🍀🎯🏆
