import axios from 'axios';

const LotofacilAPI = {
  async buscarUltimosResultados(quantidade = 100) {
    try {
      console.log('Buscando dados da API oficial da Caixa...');

      const response = await axios.get(
        'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/',
        {
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );

      if (!response.data || !response.data.numero) {
        console.log('Falha na API oficial, tentando API alternativa...');
        return await this.buscarAPIAlternativa(quantidade);
      }

      const ultimoConcurso = response.data.numero;
      console.log('Ultimo concurso (API Caixa):', ultimoConcurso);

      const resultados = [];

      resultados.push(this.formatarResultadoCaixa(response.data));

      const inicio = Math.max(1, ultimoConcurso - quantidade + 1);

      for (let num = ultimoConcurso - 1; num >= inicio; num--) {
        try {
          const res = await axios.get(
            'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/' + num,
            {
              timeout: 5000,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
              }
            }
          );

          if (res.data && res.data.numero) {
            resultados.push(this.formatarResultadoCaixa(res.data));
          }
        } catch (err) {
          console.log('Erro ao buscar concurso', num);
        }
      }

      console.log('Total carregado:', resultados.length, '- Ultimo:', resultados[0].concurso);
      return resultados;

    } catch (error) {
      console.error('Erro na API oficial:', error.message);
      return await this.buscarAPIAlternativa(quantidade);
    }
  },

  async buscarAPIAlternativa(quantidade) {
    try {
      console.log('Usando API alternativa...');
      const response = await axios.get(
        'https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest',
        { timeout: 10000 }
      );

      if (response.data && response.data.concurso) {
        const ultimoConcurso = response.data.concurso;
        const resultados = [];
        const inicio = Math.max(1, ultimoConcurso - quantidade + 1);

        for (let num = ultimoConcurso; num >= inicio; num--) {
          try {
            const res = await axios.get(
              'https://loteriascaixa-api.herokuapp.com/api/lotofacil/' + num,
              { timeout: 5000 }
            );

            if (res.data && res.data.concurso) {
              resultados.push(this.formatarResultadoAlternativo(res.data));
            }
          } catch (err) {
            console.log('Erro ao buscar concurso', num);
          }
        }

        return resultados;
      }
    } catch (error) {
      console.error('Erro na API alternativa:', error.message);
    }

    return this.usarDadosLocais();
  },

  formatarResultadoCaixa(data) {
    if (!data || !data.numero) return null;

    const dezenas = [];
    for (let i = 0; i < 15; i++) {
      const key = 'dezena' + (i + 1);
      if (data[key]) {
        dezenas.push(parseInt(data[key]));
      } else if (data.listaDezenas && data.listaDezenas[i]) {
        dezenas.push(parseInt(data.listaDezenas[i]));
      }
    }

    const dataApuracao = data.dataApuracao || '';
    const partesData = dataApuracao.split('/');
    const dataFormatada = partesData.length === 3 ?
      partesData[0] + '/' + partesData[1] + '/' + partesData[2] : dataApuracao;

    return {
      concurso: data.numero,
      data: dataFormatada,
      dezenas: dezenas,
      acumulado: data.acumulado || false
    };
  },

  formatarResultadoAlternativo(data) {
    return {
      concurso: data.concurso,
      data: data.data || 'Sem data',
      dezenas: data.dezenas ? data.dezenas.map(n => parseInt(n)) : [],
      acumulado: data.acumulado || false
    };
  },

  usarDadosLocais() {
    try {
      console.log('Usando dados locais...');
      const combinacoesData = require('../data/combinacoes.json');
      const historico = Array.isArray(combinacoesData) ? combinacoesData : [];

      return historico.slice(-100).reverse().map((item, idx) => ({
        concurso: item.concurso || (historico.length - idx),
        data: item.data || 'Sem data',
        dezenas: item.dezenas || [],
        acumulado: false
      }));
    } catch (error) {
      return [];
    }
  }
};

export default LotofacilAPI;