//Configuração da API SoilGrids
const endpoint = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

const propriedades = {
    clay: ['Argila', '%'],
    sand: ['Areia', '%'],
    silt: ['Silte', '%'],
    phh2o: ['pH em água', '']
};

// Consulta das propriedades do solo
export async function consultarSolo(latitude, longitude, profundidade, sinal){
    if(!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) || Math.abs(longitude) > 180){
            throw new Error('Coordenadas inválidas.');
    }

    // Construção da URL da requisição.
    const url = new URL(endpoint);
    url.searchParams.set('lat', latitude);
    url.searchParams.set('lon', longitude);
    url.searchParams.set('depth', profundidade);
    url.searchParams.set('value', 'mean');

    Object.keys(propriedades).forEach(propriedade => {
        url.searchParams.append('property', propriedade);
    });

    // Requisição HTTP.
    const resposta = await fetch(url, {signal: sinal});

    if(!resposta.ok){
        throw new Error(`SoilGrids indisponível (HTTP ${resposta.status}).`);
    }

    const json = await resposta.json();

    if(!Array.isArray(json.properties?.layers)){
        throw new Error('Resposta inesperada do SoilGrids.');
    }

    // Organização e normalização dos dados recebidos.
    return Object.entries(propriedades).map(
        ([chave, [nome, unidade]])=>{
            const camada = json.properties.layers.find(item => item.name === chave);

            const media = camada?.depths?.find(item => item.label === profundidade)?.values?.mean;

            const divisor = camada?.unit_measure?.d_factor;

            const valor = Number.isFinite(media) && Number.isFinite(divisor) && 
                divisor > 0 ? media / divisor : null;

            return {nome, unidade, valor};
        }
    );
}
