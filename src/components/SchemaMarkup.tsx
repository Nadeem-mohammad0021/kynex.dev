// ✅ Server component version — no "use client"
export default function SchemaMarkup() {
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "KYNEX.dev",
      url: "https://kynex.dev",
      logo: "https://kynex.dev/favicon-512x512.png",
      sameAs: [
        "https://www.linkedin.com/company/kynex-dev/",
        "https://x.com/kynex_dev",
        "https://github.com/kynex-dev"
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
      url: "https://kynex.dev",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://kynex.dev/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "KYNEX.dev - AI Agent Development Platform",
      operatingSystem: "Web",
      applicationCategory: "DeveloperApplication",
      url: "https://kynex.dev",
      logo: "https://kynex.dev/favicon-512x512.png",
      description:
        "Create and deploy AI agents with ease using KYNEX.dev - the ultimate AI agent development platform.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "100"
      }
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
