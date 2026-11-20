
import { fatores, equivalentes } from './dados.js';

//Aplicação do fator de conversão 
function aplicar(valor, fator){
    const resultado = valor * fator;
    if(!Number.isFinite(resultado)){
        throw new Error('Valor fora do intervalo suportado.');
    }
    return {resultado, fator};
}

//Conversão entre formas químicas
export function converterQuimica(valor, nutriente, origem, destino){
    const fator = fatores[nutriente]?.[origem]?.[destino];
    if(!Number.isFinite(valor) || valor < 0 || !fator){
        throw new Error('Informe uma conversão válida.');
    }
    return aplicar(valor, fator);
}

//Conversão entre unidades de medida
export function converterUnidades(valor, nutriente, origem, destino, profundidade){
    if(!Number.isFinite(valor) || valor < 0 || origem === destino){
        throw new Error('Informe uma conversão válida.');
    }
    const unidades = ['mg/dm³', 'kg/ha', 'cmolc/dm³'];

    if(!unidades.includes(origem) || !unidades.includes(destino)){
        throw new Error('Unidade inválida.');
    }

    const usaProfundidade = [origem, destino].includes('kg/ha');

    if(usaProfundidade &&(!Number.isFinite(profundidade) || profundidade <= 0)){
        throw new Error('Informe uma profundidade positiva.');
    }

    const usaCarga = [origem, destino].includes('cmolc/dm³');

    if(usaCarga && !equivalentes[nutriente]){
        throw new Error('Conversão disponível apenas para K, Ca e Mg.');
    }

    // Fatores para converter cada unidade em mg/dm³
    const base = {'mg/dm³': 1, 'kg/ha': usaProfundidade ? 10 / profundidade : 1, 'cmolc/dm³': equivalentes[nutriente]};
    
    const fator = base[origem] / base[destino];
    return aplicar(valor, fator);
}
