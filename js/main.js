
import { fatores, nomes, equivalentes, fertilizantes } from './dados.js';
import { converterQuimica, converterUnidades } from './conversor.js';
import { calcularFertilizante } from './fertilizantes.js';
import { consultarSolo } from './soilgrids.js';

//Funções auxiliares
const $ = id => document.getElementById(id);
const numero = id => $(id).valueAsNumber;

function formatar(valor, casas = 6){
    if(valor !== 0 && Math.abs(valor) < 10 ** (-casas)){
        return valor.toExponential(casas);
    }
    return valor.toLocaleString('pt-BR', {maximumFractionDigits: casas});
}

//Armazenamento local
function guardar(chave, valor){
    try{
        localStorage.setItem('fertimetrica:' + chave, valor);
    }catch{
        //O site continua funcionando sem armazenamento local.
    }
}

function recuperar(chave){
    try{
        return localStorage.getItem('fertimetrica:' + chave);
    }catch{
        return null;
    }
}

//Preenchimento dinâmico dos campos de seleção
function opcoes(id, valores, anterior = ''){
    const select = $(id);
    select.replaceChildren(new Option('Selecione', ''));

    for(const valor of valores){
        select.add(new Option(nomes[valor] || valor, valor));
    }

    if(valores.includes(anterior)){
        select.value = anterior;
    }
}

//Alternância entre as ferramentas
function alternar(aba){
    for(const nome of ['conversor', 'fertilizantes']){
        const ativo = nome === aba;
        $('painel-' + nome).hidden = !ativo;
        $('btn-' + nome).setAttribute('aria-pressed', String(ativo));
    }
    guardar('aba', aba);
}

for(const aba of ['conversor', 'fertilizantes']){
    $('btn-' + aba).addEventListener('click', () =>{
        alternar(aba);
    });
}

alternar(recuperar('aba') === 'fertilizantes' ? 'fertilizantes' : 'conversor');

//Conversor de nutrientes

//Unidades disponíveis
function unidades(){
    const lista = ['mg/dm³', 'kg/ha'];
    const nutriente = $('nutriente').value;

    if(equivalentes[nutriente]){
        lista.push('cmolc/dm³');
    }

    return lista;
}

//Exibição do campo de profundidade
function ajustarProfundidade(){
    const tipo = $('tipo-conversao').value;
    const origem = $('origem').value;
    const destino = $('destino').value;

    const mostrar = tipo === 'unidades' && [origem, destino].includes('kg/ha');

    $('campo-profundidade').hidden = !mostrar;
    $('profundidade').disabled = !mostrar;
    $('profundidade').required = mostrar;
}

//Atualização das opções de destino
function destinos(){
    const origem = $('origem').value;
    const nutriente = $('nutriente').value;
    const tipo = $('tipo-conversao').value;

    let lista = [];

    if(origem){
        if(tipo === 'quimica'){
            lista = Object.keys(fatores[nutriente]?.[origem] || {});
        }else{
            lista = unidades().filter(unidade => unidade !== origem);
        }
    }

    opcoes('destino', lista, $('destino').value);
    ajustarProfundidade();
}

//Atualização das opções de origem
function origens(){
    const quimica = $('tipo-conversao').value === 'quimica';
    const nutriente = $('nutriente').value;

    $('nutriente').required = quimica;

    const lista = quimica ? Object.keys(fatores[nutriente] || {}) : unidades();

    opcoes('origem', lista, $('origem').value);
    destinos();
}

//Eventos do conversor
for(const id of ['tipo-conversao', 'nutriente']){
    $(id).addEventListener('change', origens);
}

$('origem').addEventListener('change', destinos);
$('destino').addEventListener('change', ajustarProfundidade);

$('form-conversor').addEventListener('input', () =>{
    $('resultado-conversor').hidden = true;
});

$('form-conversor').addEventListener('reset', () =>{
    setTimeout(() =>{
        origens();
        $('resultado-conversor').hidden = true;
    }, 0);
});

//Realização da conversão
$('form-conversor').addEventListener('submit', evento =>{
    evento.preventDefault();

    try{
        const valor = numero('valor-conversao');
        const nutriente = $('nutriente').value;
        const origem = $('origem').value;
        const destino = $('destino').value;
        const quimica = $('tipo-conversao').value === 'quimica';

        let calculo;

        if(quimica){
            calculo = converterQuimica(valor, nutriente, origem, destino);
        }else{
            calculo = converterUnidades(valor, nutriente, origem, destino, numero('profundidade'));
        }

        const {resultado, fator} = calculo;

        $('valor-resultado').textContent = `${formatar(resultado)} ${nomes[destino] || destino}`;

        const explicacao = quimica
            ? 'Equivalência de massa na mesma unidade de entrada.'
            : 'Equivalência matemática; não representa alteração prevista na análise do solo.';

        $('memoria-conversao').textContent = `${formatar(valor)} × ${formatar(fator)} ≈ ${formatar(resultado)}. ${explicacao}`;
        $('resultado-conversor').hidden = false;

    }catch(erro){
        alert(erro.message);
    }
});

origens();

//Calculadora de fertilizantes
const seletor = $('fertilizante');

const nutrientesOriginais = Array.from($('nutriente-fertilizante').options).map(opcao => [opcao.value, opcao.text]);

//Preenchimento do catálogo
for(const fertilizante of fertilizantes){
    seletor.add(new Option(fertilizante.nome, fertilizante.id), seletor.options[seletor.options.length - 1]);
}

//Identificação do fertilizante selecionado
function produto(){
    return fertilizantes.find(fertilizante => fertilizante.id === seletor.value);
}

//Preenchimento da concentração
function teor(){
    const nutriente = $('nutriente-fertilizante').value;
    const fertilizante = produto();

    $('concentracao').value = fertilizante?.teores[nutriente] ?? '';
}

//Seleção dos nutrientes disponíveis
function selecionarProduto(){
    const fertilizante = produto();

    const opcoesDisponiveis = nutrientesOriginais
        .filter(([valor]) =>{
            return !valor || !fertilizante || Object.hasOwn(fertilizante.teores, valor);
        })
        .map(([valor, texto]) =>{
            return new Option(texto, valor);
        });

    $('nutriente-fertilizante').replaceChildren(...opcoesDisponiveis);

    if(fertilizante && Object.keys(fertilizante.teores).length === 1){
        $('nutriente-fertilizante').value = Object.keys(fertilizante.teores)[0];
    }

    teor();
}

//Eventos da calculadora
seletor.addEventListener('change', selecionarProduto);
$('nutriente-fertilizante').addEventListener('change', teor);

$('form-fertilizantes').addEventListener('input', () =>{
    $('resultado-fertilizantes').hidden = true;
});

$('form-fertilizantes').addEventListener('reset', () =>{
    setTimeout(() =>{
        selecionarProduto();
        $('resultado-fertilizantes').hidden = true;
    }, 0);
});

//Realização do cálculo
$('form-fertilizantes').addEventListener('submit', evento =>{
    evento.preventDefault();

    try{
        const dose = numero('dose');
        const concentracao = numero('concentracao');
        const area = numero('area');

        const {porHectare, total} = calcularFertilizante(dose, concentracao, area);

        $('resultado-hectare').textContent = `${formatar(porHectare, 2)} kg/ha`;
        $('resultado-total').textContent = `${formatar(total, 2)} kg`;

        $('memoria-fertilizantes').textContent = `${formatar(dose)} ÷ (${formatar(concentracao)} ÷ 100) ≈ ${formatar(porHectare, 2)} kg/ha; multiplicado por ${formatar(area)} ha ≈ ${formatar(total, 2)} kg. Confira a garantia no rótulo e utilize a mesma forma química na dose e no teor.`;

        $('resultado-fertilizantes').hidden = false;

    }catch(erro){
        alert(erro.message);
    }
});

//Consulta de propriedades do solo
let consulta;
let geracao = 0;

//Mensagens de acompanhamento
function status(mensagem){
    $('status-soilgrids').textContent = mensagem;
}

//Cancelamento de consultas anteriores
function cancelarConsulta(){
    geracao++;
    consulta?.abort();

    $('btn-consultar-solo').disabled = false;
    $('btn-localizacao').disabled = false;
    $('resultado-soilgrids').hidden = true;

    status('');
}

$('form-soilgrids').addEventListener('input', cancelarConsulta);
$('form-soilgrids').addEventListener('reset', cancelarConsulta);

//Geolocalização
$('btn-localizacao').addEventListener('click', () =>{
    cancelarConsulta();

    const atual = geracao;

    if(!navigator.geolocation){
        status('Geolocalização indisponível. Informe as coordenadas.');
        return;
    }

    $('btn-localizacao').disabled = true;
    status('Obtendo localização...');

    navigator.geolocation.getCurrentPosition(
        posicao =>{
            if(atual !== geracao){
                return;
            }

            $('latitude').value = posicao.coords.latitude.toFixed(6);
            $('longitude').value = posicao.coords.longitude.toFixed(6);
            $('btn-localizacao').disabled = false;

            status('Localização obtida. Clique em consultar propriedades.');
        },

        () =>{
            if(atual !== geracao){
                return;
            }

            $('btn-localizacao').disabled = false;

            status('Não foi possível obter a localização. Informe as coordenadas manualmente.');
        },

        {timeout: 15000, maximumAge: 0}
    );
});

//Consulta à API SoilGrids
$('form-soilgrids').addEventListener('submit', async evento =>{
    evento.preventDefault();
    cancelarConsulta();

    const atual = geracao;

    consulta = new AbortController();

    const controle = consulta;

    const timer = setTimeout(() =>{
        controle.abort();
    }, 30000);

    const latitude = numero('latitude');
    const longitude = numero('longitude');
    const profundidade = $('profundidade-solo').value;

    $('btn-consultar-solo').disabled = true;
    status('Consultando SoilGrids...');

    try{
        const dados = await consultarSolo(latitude, longitude, profundidade, controle.signal);

        if(atual !== geracao){
            return;
        }

        $('dados-soilgrids').replaceChildren();

        for(const dado of dados){
            const linha = document.createElement('tr');

            const resultado = dado.valor === null
                ? 'Não disponível'
                : `${formatar(dado.valor)} ${dado.unidade}`.trim();

            const valores = [dado.nome, resultado];

            for(const texto of valores){
                const celula = document.createElement('td');
                celula.textContent = texto;
                linha.append(celula);
            }

            $('dados-soilgrids').append(linha);
        }

        $('localizacao-consultada').textContent = `Latitude: ${latitude}; longitude: ${longitude}; profundidade: ${profundidade}.`;
        $('resultado-soilgrids').hidden = false;

        const indisponivel = dados.every(dado => dado.valor === null);

        status(indisponivel ? 'Nenhum dado disponível para este ponto.' : 'Consulta concluída.');

    }catch(erro){
        if(atual === geracao){
            status(erro.name === 'AbortError'
                ? 'Tempo limite da consulta excedido. Tente novamente.'
                : `Não foi possível consultar o solo. ${erro.message}`);
        }

    }finally{
        clearTimeout(timer);

        if(atual === geracao){
            $('btn-consultar-solo').disabled = false;
        }
    }
});

//Cópia dos resultados
const tiposResultado = ['conversao', 'fertilizantes', 'soilgrids'];

for(const tipo of tiposResultado){
    const botao = $('copiar-' + tipo);

    botao.addEventListener('click', async () =>{
        const identificador = tipo === 'conversao' ? 'conversor' : tipo;
        const secao = $('resultado-' + identificador);

        const texto = Array.from(secao.children)
            .filter(elemento => elemento !== botao)
            .map(elemento => elemento.innerText)
            .join('\n');

        try{
            await navigator.clipboard.writeText(texto);
            botao.textContent = 'Copiado!';

            setTimeout(() =>{
                botao.textContent = 'Copiar resultado';
            }, 1800);

        }catch{
            alert('Não foi possível copiar automaticamente. Selecione o resultado e copie manualmente.');
        }
    });
}