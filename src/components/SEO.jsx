import { memo } from "react";
import { Helmet } from "react-helmet-async";

const SEO = memo(function SEO({ data = {} }) {
  const { title, description, canonical, noIndex, openGraph = {}, schema = null } = data;
  const domain = "https://algoflow.vercel.app";
  return (
    <Helmet>
      {title && <title>{title} | AlgoFlow</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {openGraph.title && <meta property="og:title" content={openGraph.title} />}
      {openGraph.description && <meta property="og:description" content={openGraph.description} />}
      {openGraph.url && <meta property="og:url" content={openGraph.url} />}
      <meta property="og:image" content={`${domain}${openGraph.image || "/images/defaults/preview.png"}`} />
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
});

export default SEO;
