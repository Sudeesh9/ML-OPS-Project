const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Health check error:", err);
    return { status: "offline", error: err.message };
  }
}

export async function getModelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/model-info`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Get model info error:", err);
    throw err;
  }
}

export async function predictSingle(reviewText) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review: reviewText }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed with status: ${res.status}`);
  }
  return await res.json();
}

export async function previewFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE_URL}/preview-file`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `File preview failed with status: ${res.status}`);
  }
  return await res.json();
}

export async function predictDataset(file, reviewColumn, labelColumn = null, cleanEmpty = true) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('review_column', reviewColumn);
  if (labelColumn) {
    formData.append('label_column', labelColumn);
  }
  formData.append('clean_empty', cleanEmpty.toString());

  const res = await fetch(`${API_BASE_URL}/predict-file`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Dataset prediction failed: ${res.status}`);
  }
  return await res.json();
}

export async function getSystemMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error(`Metrics error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Metrics fetch error:", err);
    throw err;
  }
}

export async function getMlopsInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/mlops-info`);
    if (!res.ok) throw new Error(`MLOps info error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("MLOps info fetch error:", err);
    throw err;
  }
}

export function getSampleFileUrl() {
  return `${API_BASE_URL}/sample-file`;
}

export { API_BASE_URL };
