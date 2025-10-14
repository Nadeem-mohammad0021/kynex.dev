import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://agent.kynex.dev/sitemap.xml",
    host: "https://agent.kynex.dev",
  };
}
