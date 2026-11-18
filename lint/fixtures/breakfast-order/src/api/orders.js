// 所有呼叫點餐 API 的函式都放在這裡，元件不直接呼叫 fetch
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function createOrder(order) {
  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return response.json();
}
