export interface CompanyValue {
  title: string;
  body: string;
}

export interface Company {
  name: string;
  legalName: string;
  positioning: string;
  /** The two-sided business, stated plainly. */
  ownedSide: string;
  clientSide: string;
  intro: string;
  values: CompanyValue[];
  /** All placeholders until the client supplies real details. */
  contact: {
    addressLines: string[];
    phone: string;
    email: string;
    hours: string;
    isPlaceholder: boolean;
  };
  social: { label: string; href: string }[];
}
