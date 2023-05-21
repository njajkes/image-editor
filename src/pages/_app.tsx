import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Component {...pageProps} />
    </main>
  )
}
