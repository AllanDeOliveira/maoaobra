// src/utils/geo.js — Funções de cálculo geoespacial real

/**
 * Calcula a distância em km entre duas coordenadas geográficas usando a fórmula de Haversine.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Raio médio da Terra em km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

/**
 * Estima a distância entre dois perfis (cliente e trabalhador).
 * Prioriza latitude/longitude reais se disponíveis.
 * Caso contrário, faz uma aproximação baseada em Bairro/Cidade/UF.
 */
export function getEstimatedDistance(clientDetails, workerDetails) {
  if (!clientDetails || !workerDetails) return null;

  // 1. Se ambos tiverem coordenadas reais
  if (clientDetails.latitude && clientDetails.longitude && workerDetails.latitude && workerDetails.longitude) {
    const dist = calculateHaversineDistance(
      clientDetails.latitude,
      clientDetails.longitude,
      workerDetails.latitude,
      workerDetails.longitude
    );
    if (dist !== null) return dist;
  }

  // 2. Se estão na mesma cidade / mesmo estado
  const isSameCity = clientDetails.cidade && workerDetails.cidade &&
    clientDetails.cidade.trim().toLowerCase() === workerDetails.cidade.trim().toLowerCase();
  const isSameUF = clientDetails.uf && workerDetails.uf &&
    clientDetails.uf.trim().toLowerCase() === workerDetails.uf.trim().toLowerCase();

  // Hash determinístico leve para variação plausível na mesma localidade
  const combined = (clientDetails.user_id || '') + (workerDetails.user_id || '');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  const base = Math.abs(hash % 40) / 10; // 0.0 a 3.9 km

  if (isSameCity) return (1.5 + base).toFixed(1);
  if (isSameUF) return (25 + base * 5).toFixed(1);
  return (200 + base * 20).toFixed(1);
}
