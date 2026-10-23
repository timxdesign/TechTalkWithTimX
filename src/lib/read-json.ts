// Parses an API response without throwing on an empty or non-JSON body
// (a crashed Worker or a gateway error page), so the UI can show a real message.
export async function readJson<T extends { error?: string }>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: `The server returned an unexpected response (${res.status}). Please try again.` } as T;
  }
}
