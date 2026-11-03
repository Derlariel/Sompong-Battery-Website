export const GTM_CONTAINER_ID = "GTM-5XGWC4V5";

export default function GoogleTagManager() {
  return <>
    <script async src={`https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`} />
    <script dangerouslySetInnerHTML={{ __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    ` }} />
  </>;
}
