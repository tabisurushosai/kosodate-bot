import type { Metadata } from "next";

const siteName = "Kosodate Bot";
const siteDescription =
  "不登校児・発達特性児の保護者が、教育心理・発達心理ベースで具体的な声かけを相談できるAI相談ボットです。";
const fallbackUrl = "http://localhost:3000";

const siteUrl = process.env.NEXTAUTH_URL ?? fallbackUrl;

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

const getUrl = (path = "/") => new URL(path, siteUrl);

export const defaultMetadata: Metadata = {
  metadataBase: getUrl(),
  applicationName: siteName,
  title: {
    default: `${siteName} | 保護者・支援者向けAI相談ボット`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName,
    title: `${siteName} | 保護者・支援者向けAI相談ボット`,
    description: siteDescription,
    url: getUrl("/")
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | 保護者・支援者向けAI相談ボット`,
    description: siteDescription
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml"
      }
    ],
    shortcut: "/favicon.svg",
    apple: "/brand-mark.svg"
  }
};

export const createPageMetadata = ({
  title,
  description = siteDescription,
  path = "/",
  noIndex = false
}: PageMetadataInput): Metadata => {
  const pageTitle = title ?? `${siteName} | 保護者・支援者向けAI相談ボット`;
  const url = getUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName,
      title: pageTitle,
      description,
      url
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description
    },
    robots: noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  };
};
