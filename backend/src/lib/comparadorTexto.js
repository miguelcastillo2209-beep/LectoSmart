// Compara el texto que el estudiante debía leer contra la transcripción
// que devolvió la IA, usando la subsecuencia común más larga (LCS) a
// nivel de palabra. LCS penaliza omisiones/palabras de más sin penalizar
// dos veces una sola palabra mal dicha, a diferencia de comparar
// posición por posición.

function normalizarPalabra(palabra) {
  return palabra
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/gi, "");
}

function tokenizar(texto) {
  return texto
    .split(/\s+/)
    .map(normalizarPalabra)
    .filter((p) => p.length > 0);
}

function lcsLongitud(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Devuelve qué porcentaje del texto original quedó cubierto por la
// lectura transcrita. palabrasTotal siempre se cuenta sobre el texto
// original (la meta de la lectura), no sobre lo transcrito.
function compararLectura(textoOriginal, transcripcion) {
  const original = tokenizar(textoOriginal);
  const leido = tokenizar(transcripcion);
  const palabrasTotal = original.length;
  if (palabrasTotal === 0) {
    return { porcentaje: 0, palabrasCorrectas: 0, palabrasTotal: 0 };
  }
  const palabrasCorrectas = lcsLongitud(original, leido);
  const porcentaje = Math.round((palabrasCorrectas / palabrasTotal) * 100);
  return { porcentaje, palabrasCorrectas, palabrasTotal };
}

module.exports = { compararLectura, tokenizar };
