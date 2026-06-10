export async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    const errorMessage = errorData.message || errorData.error || 'Erro na requisição';
    alert(`Erro: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}
