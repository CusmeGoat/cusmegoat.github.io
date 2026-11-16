export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response.status(503).json({ error: 'Sync not configured' });
  return response.status(200).json({ url, key });
}
