"use client";

import Head from "next/head";

export default function SchemaMarkup() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KYNEX.dev",
    url: "https://kynex.dev",
    logo: "https://kynex.dev/favicon-512x512.png",
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
}
