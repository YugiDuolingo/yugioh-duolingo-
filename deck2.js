// Player 1 Deck Definition
console.log('Loading Player 1 deck...');

const player2Deck = [
  {
    "cn": "Once dorado",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 1100,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Treinta pequeño",
    "atr": "dark",
    "tr": 4,
    "ak": 3000,
    "df": 3000,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Veinte grande",
    "atr": "dark",
    "tr": 4,
    "ak": 2000,
    "df": 2000,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Cero marrón",
    "atr": "dark",
    "tr": 4,
    "ak": 0,
    "df": 2000,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Uno naranja",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 100,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Dos morado",
    "atr": "dark",
    "tr": 4,
    "ak": 1200,
    "df": 200,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Tres blanco",
    "atr": "dark",
    "tr": 4,
    "ak": 1300,
    "df": 300,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cuatro rosa",
    "atr": "dark",
    "tr": 4,
    "ak": 1400,
    "df": 400,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cinco azul",
    "atr": "dark",
    "tr": 4,
    "ak": 1500,
    "df": 500,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Seis verde",
    "atr": "dark",
    "tr": 4,
    "ak": 1600,
    "df": 600,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Siete rojo",
    "atr": "dark",
    "tr": 4,
    "ak": 1700,
    "df": 700,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Ocho negro",
    "atr": "dark",
    "tr": 4,
    "ak": 1800,
    "df": 800,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Nueve amarillo",
    "atr": "dark",
    "tr": 4,
    "ak": 1900,
    "df": 900,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Diez gris",
    "atr": "dark",
    "tr": 4,
    "ak": 1000,
    "df": 1000,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Doce plateado",
    "atr": "dark",
    "tr": 4,
    "ak": 1200,
    "df": 1200,
    "tp": "fiend",
    "desc": "empty"
  },
  {
    "cn": "Once dorado",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 1100,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Treinta pequeño",
    "atr": "dark",
    "tr": 4,
    "ak": 3000,
    "df": 3000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Veinte grande",
    "atr": "dark",
    "tr": 4,
    "ak": 2000,
    "df": 2000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cero marrón",
    "atr": "dark",
    "tr": 4,
    "ak": 0,
    "df": 2000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Uno naranja",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 100,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Dos morado",
    "atr": "dark",
    "tr": 4,
    "ak": 1200,
    "df": 200,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Tres blanco",
    "atr": "dark",
    "tr": 4,
    "ak": 1300,
    "df": 300,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cuatro rosa",
    "atr": "dark",
    "tr": 4,
    "ak": 1400,
    "df": 400,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cinco azul",
    "atr": "dark",
    "tr": 4,
    "ak": 1500,
    "df": 500,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Seis verde",
    "atr": "dark",
    "tr": 4,
    "ak": 1600,
    "df": 600,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Siete rojo",
    "atr": "dark",
    "tr": 4,
    "ak": 1700,
    "df": 700,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Ocho negro",
    "atr": "dark",
    "tr": 4,
    "ak": 1800,
    "df": 800,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Nueve amarillo",
    "atr": "dark",
    "tr": 4,
    "ak": 1900,
    "df": 900,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Diez gris",
    "atr": "dark",
    "tr": 4,
    "ak": 1000,
    "df": 1000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Doce plateado",
    "atr": "dark",
    "tr": 4,
    "ak": 1200,
    "df": 1200,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Once dorado",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 1100,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Treinta pequeño",
    "atr": "dark",
    "tr": 4,
    "ak": 3000,
    "df": 3000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Veinte grande",
    "atr": "dark",
    "tr": 4,
    "ak": 2000,
    "df": 2000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cero marrón",
    "atr": "dark",
    "tr": 4,
    "ak": 0,
    "df": 2000,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Uno naranja",
    "atr": "dark",
    "tr": 4,
    "ak": 1100,
    "df": 100,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Dos morado",
    "atr": "dark",
    "tr": 4,
    "ak": 1200,
    "df": 200,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Tres blanco",
    "atr": "dark",
    "tr": 4,
    "ak": 1300,
    "df": 300,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cuatro rosa",
    "atr": "dark",
    "tr": 4,
    "ak": 1400,
    "df": 400,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Cinco azul",
    "atr": "dark",
    "tr": 4,
    "ak": 1500,
    "df": 500,
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Shield & Sword",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Shrink",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "stop attack",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Stop Defense",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Swords of Revealing Light",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "black magic ritual",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Brain Control",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Card Destruction",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "card of sanctity",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "change of heart",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Dark Hole",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "emergency provision",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "extchange",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "feather duster",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "fissure",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "giant trunade",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Quick Attack",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "raigeki",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Scapegoat",
    "atr": "spell",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "ring of destraction",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "trap hole",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "7 tools of the bandit",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "call of the hunted",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Crush Card Virus",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "grave robber",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "magic cylinder",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  },
  {
    "cn": "Magical Hats",
    "atr": "trap",
    "tp": "fairy",
    "desc": "empty"
  }
];

console.log('Player 1 deck loaded:', player1Deck.length, 'cards');
