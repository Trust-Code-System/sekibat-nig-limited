import { cache } from "react";
import { publishedRecords } from "./cms-store";
import type { Company } from "@/types";
import { CACHE_TAGS, remoteOrLocal } from "./client";

/** Published company details from the built-in CMS or configured remote API. */
export const getCompany = cache(async (): Promise<Company> => {
  return remoteOrLocal("/company", [CACHE_TAGS.company], async () => (await publishedRecords<Company>("company"))[0]);
});
