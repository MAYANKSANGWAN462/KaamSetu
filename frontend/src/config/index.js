export const config = {
  appName: 'KaamSetu',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  supportedLanguages: ['en', 'hi', 'pa', 'ta', 'bn'],
  defaultLanguage: 'en',
  currency: 'INR',
  paginationLimit: 10
}