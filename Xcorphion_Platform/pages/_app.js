import '../styles/globals.css';
import '../src/styles/globals.css';
import LanguageSwitcher from '../src/components/ui/LanguageSwitcher';

export default function App({ Component, pageProps }) {
  return (
    <>
      <LanguageSwitcher />
      <Component {...pageProps} />
    </>
  );
}
