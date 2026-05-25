export const SITE = {
  name: "baba pet care",
  shortName: "baba",
  tagline: "home away from home for your fur-babies",
  description:
    "One-on-one, insured, home-style pet care in Ann Arbor, Michigan. Drop-ins, dog walking, boarding, and house sitting from CPR-certified pet sitters.",

  city: "Ann Arbor",
  state: "MI",
  serviceArea: ["Ann Arbor", "Ypsilanti", "Saline", "Dexter", "Pittsfield Township", "Scio Township"],

  phoneDisplay: "(734) 555-0123",
  phoneE164: "+17345550123",

  email: "hello@babapetcare.com",
  instagramHandle: "@baba.mypetcare",
  instagramUrl: "https://www.instagram.com/baba.mypetcare/",
  roverUrl: "https://www.rover.com/members/wutt-hmone-kyi/",
  intakeFormUrl: "https://forms.gle/REPLACE_WITH_REAL_INTAKE_FORM",

  insuranceCarrier: "Pet Care Insurance",

  affiliates: [
    {
      name: "Woof Dog Products",
      blurb: "10% off with code: baba",
      url: "https://example.com/woof",
    },
    {
      name: "Brooks & Roo",
      blurb: "Handmade pet accessories",
      url: "https://example.com/brooksandroo",
    },
  ],
} as const;

export const TEL_HREF = `tel:${SITE.phoneE164}`;
export const SMS_HREF = `sms:${SITE.phoneE164}`;
export const MAILTO_HREF = `mailto:${SITE.email}`;
