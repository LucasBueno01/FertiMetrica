//Fatores de conversão química
export const fatores ={
    N:{
        N:{NO3: 4.427, NH4: 1.288},
        NO3:{N: 0.226, NH4: 0.291},
        NH4:{N: 0.776, NO3: 3.437}
    },

    P:{
        P:{P2O5: 2.290, PO4: 3.066},
        P2O5:{P: 0.436, PO4: 1.338},
        PO4:{P: 0.326, P2O5: 0.747}
    },

    K:{
        K:{K2O: 1.205},
        K2O:{K: 0.830}
    },

    Ca:{
        Ca:{CaO: 1.399, CaCO3: 2.497},
        CaO:{Ca: 0.715, CaCO3: 1.785},
        CaCO3:{Ca: 0.400, CaO: 0.560}
    },

    Mg:{
        Mg:{MgO: 1.658, MgCO3: 3.469},
        MgO:{Mg: 0.603, MgCO3: 2.092},
        MgCO3:{Mg: 0.288, MgO: 0.478}
    },

    S:{
        S:{SO4: 2.996, gesso: 5.368},
        SO4:{S: 0.334, gesso: 1.792},
        gesso:{S: 0.186, SO4: 0.558}
    }
};

// Representação das fórmulas químicas
export const nomes ={
    N: 'N',
    NO3: 'NO₃⁻',
    NH4: 'NH₄⁺',
    P: 'P',
    P2O5: 'P₂O₅',
    PO4: 'PO₄³⁻',
    K: 'K',
    K2O: 'K₂O',
    Ca: 'Ca',
    CaO: 'CaO',
    CaCO3: 'CaCO₃',
    Mg: 'Mg',
    MgO: 'MgO',
    MgCO3: 'MgCO₃',
    S: 'S',
    SO4: 'SO₄²⁻',
    gesso: 'CaSO₄·2H₂O'
};

//Conversão de cmolc/dm³ para mg/dm³
export const equivalentes ={
    K: 391,
    Ca: 200.4,
    Mg: 121.56
};

// Catálogo de fertilizantes
export const fertilizantes =[
    {
        id: 'ureia',
        nome: 'Ureia',
        teores: {
            N: 45
        }
    },

    {
        id: 'sulfato-amonio',
        nome: 'Sulfato de amônio',
        teores: {
            N: 20,
            S: 24
        }
    },

    {
        id: 'nitrato-amonio',
        nome: 'Nitrato de amônio',
        teores: {
            N: 33
        }
    },

    {
        id: 'nitrato-calcio',
        nome: 'Nitrato de cálcio',
        teores: {
            N: 15,
            CaO: 26
        }
    },

    {
        id: 'cloreto-amonio',
        nome: 'Cloreto de amônio',
        teores: {
            N: 24
        }
    },

    {
        id: 'super-simples',
        nome: 'Superfosfato simples (P₂O₅ total)',
        teores: {
            P2O5: 18,
            CaO: 25,
            MgO: 0.5,
            S: 12
        }
    },

    {
        id: 'super-triplo',
        nome: 'Superfosfato triplo (P₂O₅ total)',
        teores: {
            P2O5: 41,
            CaO: 14,
            MgO: 0.5
        }
    },

    {
        id: 'termofosfato',
        nome: 'Termofosfato Yoorin (P₂O₅ total)',
        teores: {
            P2O5: 19,
            CaO: 30,
            MgO: 18
        }
    }
];