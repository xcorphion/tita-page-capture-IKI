import ComingSoon from '../src/components/xcorphion/ComingSoon';

const PRODUCTS = {
  'omma-api':       { productKey: 'ommaApi',       backHref: '/omma' },
  'omma-business':  { productKey: 'ommaBusiness',  backHref: '/omma' },
  'omma-chat':      { productKey: 'ommaChat',      backHref: '/omma' },
  'omma-solutions': { productKey: 'ommaSolutions', backHref: '/omma' },
  'contact':        { productKey: 'contact',       backHref: '/'     },
  'models':         { productKey: 'models',        backHref: '/'     },
  'white-label':    { productKey: 'whiteLabel',    backHref: '/'     },
  'sobre':          { productKey: 'sobre',         backHref: '/'     },
};

export default function ProductPage({ slug }) {
  const product = PRODUCTS[slug];
  if (!product) return null;
  return <ComingSoon productKey={product.productKey} backHref={product.backHref} />;
}

export async function getStaticPaths() {
  return {
    paths: Object.keys(PRODUCTS).map(slug => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (!PRODUCTS[params.slug]) return { notFound: true };
  return { props: { slug: params.slug } };
}
