import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { inter, spaceGrotesk, sourceCodePro } from "./fonts";
import { Analytics } from "@vercel/analytics/next";
import { headers } from "next/headers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Dynamic metadata for all pages
export async function generateMetadata(): Promise<Metadata> {
  const path = headers().get("x-invoke-path") || "";

  if (path.startsWith("/docs")) {
    return {
      title: "KYNEX Documentation | Build, Deploy & Manage AI Agents",
      description:
        "Official KYNEX.dev documentation. Learn how to build, deploy, and manage AI agents with step-by-step tutorials, workflows, and integrations.",
      openGraph: {
        title: "KYNEX Documentation | KYNEX.dev",
        description:
          "Learn how to create, deploy, and manage AI agents with KYNEX.dev’s official documentation.",
        url: "https://kynex.dev/docs",
        siteName: "KYNEX.dev",
        images: [
          {
            url: "/favicon-512x512.png",
            width: 1200,
            height: 630,
            alt: "KYNEX Documentation",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "KYNEX Documentation | KYNEX.dev",
        description:
          "Step-by-step guides and tutorials to help you build and manage AI agents with KYNEX.dev.",
        images: ["/favicon-512x512.png"],
      },
    };
  }

  if (path.startsWith("/help")) {
    return {
      title: "KYNEX Help Center | Tutorials, FAQs & Resources",
      description:
        "Find tutorials, FAQs, and resources to get started with KYNEX.dev. Learn how to create, deploy, and manage AI agents efficiently.",
      openGraph: {
        title: "KYNEX Help Center | KYNEX.dev",
        description:
          "Get support, tutorials, and answers to FAQs about building and managing AI agents.",
        url: "https://kynex.dev/help",
        siteName: "KYNEX.dev",
        images: [
          {
            url: "/favicon-512x512.png",
            width: 1200,
            height: 630,
            alt: "KYNEX Help Center",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "KYNEX Help Center | KYNEX.dev",
        description:
          "Resources, FAQs, and support guides for AI agents on KYNEX.dev.",
        images: ["/favicon-512x512.png"],
      },
    };
  }

  if (path.startsWith("/subscription")) {
    return {
      title: "KYNEX Pricing & Subscription Plans",
      description:
        "Choose from free, pro, or enterprise plans to build, deploy, and scale AI agents with KYNEX.dev. Find the perfect plan for your needs.",
      openGraph: {
        title: "KYNEX Pricing & Subscription Plans",
        description:
          "Flexible pricing for individuals, startups, and enterprises building AI agents.",
        url: "https://kynex.dev/subscription",
        siteName: "KYNEX.dev",
        images: [
          {
            url: "/favicon-512x512.png",
            width: 1200,
            height: 630,
            alt: "KYNEX Pricing",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "KYNEX Pricing & Subscription Plans",
        description:
          "Compare KYNEX.dev pricing plans and choose the one that fits your AI automation needs.",
        images: ["/favicon-512x512.png"],
      },
    };
  }

  if (path.startsWith("/contact-us")) {
    return {
      title: "Contact KYNEX.dev | Support & Partnerships",
      description:
        "Get in touch with the KYNEX.dev team for support, technical inquiries, or partnership opportunities. We're here to help.",
      openGraph: {
        title: "Contact KYNEX.dev | Support & Partnerships",
        description:
          "Reach out to KYNEX.dev for technical support, collaborations, or partnership opportunities.",
        url: "https://kynex.dev/contact-us",
        siteName: "KYNEX.dev",
        images: [
          {
            url: "/favicon-512x512.png",
            width: 1200,
            height: 630,
            alt: "Contact KYNEX.dev",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Contact KYNEX.dev",
        description:
          "Connect with the KYNEX.dev team for support, questions, or collaborations.",
        images: ["/favicon-512x512.png"],
      },
    };
  }

  // Default = main site (keep your existing metadata and icons here)
  return {
    title: "KYNEX.dev - AI Agent Development Platform",
    description:
      "Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development. Build powerful AI workflows with our intuitive visual editor.",
    keywords:
      "AI agents, artificial intelligence, automation, workflow, chatbots, deployment, KYNEX, KYNEX.dev",
    authors: [{ name: "KYNEX.dev Team" }],
    creator: "KYNEX.dev",
    publisher: "KYNEX.dev",
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    manifest: "/manifest.json",
    openGraph: {
      title: "KYNEX.dev - AI Agent Development Platform",
      description:
        "Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development.",
      url: "https://kynex.dev",
      siteName: "KYNEX.dev",
      images: [
        {
          url: "/favicon-512x512.png",
          width: 1200,
          height: 630,
          alt: "KYNEX.dev - AI Agent Development Platform",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "KYNEX.dev - AI Agent Development Platform",
      description:
        "Create and deploy AI agents with ease using KYNEX.dev - The ultimate platform for AI agent development.",
      images: ["/favicon-512x512.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Adobe Fonts - Replace 'your-kit-id' with your actual Adobe Fonts project ID */}
        <link rel="stylesheet" href="https://use.typekit.net/your-kit-id.css" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TutorialProvider>{children}</TutorialProvider>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster />
        <Analytics />
      </body>
    </html>
  );
}
