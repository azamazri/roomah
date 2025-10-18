import { Metadata } from "next";

const defaultMetadata = {
  title: "Roomah - Platform Taaruf Islami",
  description:
    "Platform Taaruf terpercaya untuk membantu Anda menemukan pasangan hidup yang sesuai dengan nilai-nilai Islam",
  keywords: [
    "taaruf",
    "Taaruf",
    "pernikahan islami",
    "cari jodoh",
    "muslim",
    "muslimah",
  ],
};

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    title: overrides?.title || defaultMetadata.title,
    description: overrides?.description || defaultMetadata.description,
    keywords: overrides?.keywords || defaultMetadata.keywords,
    ...overrides,
  };
}
