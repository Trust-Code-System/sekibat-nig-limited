import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cms"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
