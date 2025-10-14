// ✅ Server component version — no "use client"
export default function SchemaMarkup() {
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KYNEX.dev",
      url: "https://agent.kynex.dev",
      logo: "https://agent.kynex.dev/favicon-512x512.png",
      sameAs: [
        "https://www.linkedin.com/company/kynex-dev/",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@kynex.dev",
        contactType: "customer support"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "KYNEX.dev - AI Agent Development Platform",
      url: "https://agent.kynex.dev",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://agent.kynex.dev/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
