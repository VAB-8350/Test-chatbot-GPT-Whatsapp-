function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const d = [];

  for (let i = 0; i <= m; i++) {
    d[i] = [];
    d[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        d[i][j] = d[i - 1][j - 1];
      } else {
        d[i][j] = Math.min(
          d[i - 1][j] + 1, // delete
          d[i][j - 1] + 1, // insert
          d[i - 1][j - 1] + 1 // substitute
        );
      }
    }
  }

  return d[m][n];
}

function findMostSimilarString(strMaster, strArray) {
  let minDistance = Infinity;
  let mostSimilarString = '';

  for (let i = 0; i < strArray.length; i++) {
    const distance = levenshteinDistance(strMaster, strArray[i]);
    if (distance < minDistance) {
      minDistance = distance;
      mostSimilarString = strArray[i];
    }
  }

  return [mostSimilarString, minDistance];
}

function limpiarCadena(cadena) {
  // Reemplaza los acentos
  cadena = cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Elimina los espacios en blanco al inicio y final
  cadena = cadena.trim();

  // Convierte todo a minúsculas
  cadena = cadena.toLowerCase();

  // Retorna la cadena resultante
  return cadena;
}

module.exports = {findMostSimilarString, limpiarCadena}