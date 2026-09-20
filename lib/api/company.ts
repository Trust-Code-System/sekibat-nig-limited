import { cache } from "react";
import { company } from "@/data/company";
import type { Company } from "@/types";
import { CACHE_TAGS, remoteOrLocal } from "./client";

/** Company repository. Single record; later a CMS or admin settings endpoint. */
export const getCompany = cache(async (): Promise<Company> => {
  return remoteOrLocal("/company", [CACHE_TAGS.company], () => company);
});
