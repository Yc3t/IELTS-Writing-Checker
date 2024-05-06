import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { EssayProvider } from './context/EssayContext'; // Adjust the path as necessary

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EssayProvider>
      <Component {...pageProps} />
    </EssayProvider>
  );
}
