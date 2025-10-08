import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kynex.dev";

  const routes = [
    "",
    "dashboard",
    "deployments",
    "contact-us",
    "my-account",
    "subscription",
    "docs",
    "workflows",
    "my-agents",
    "agents",
    "help",
    "terms",
    "privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
