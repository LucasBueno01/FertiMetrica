//Cálculo da quantidade de fertilizante
export function calcularFertilizante(dose, concentracao, area){
    if(![dose, concentracao, area].every(Number.isFinite) ||
        dose < 0 || concentracao <= 0 || concentracao > 100 || area <= 0
    ){
        throw new Error('Confira a dose, o teor e a área informados.');
    }

    // Quantidade de fertilizante em kg/ha.
    const porHectare = dose / (concentracao / 100);
    // Quantidade total de fertilizante em kg.
    const total = porHectare * area;

    if(![porHectare, total].every(Number.isFinite)){
        throw new Error('Valor fora do intervalo suportado.');
    }
    return{porHectare, total};
}