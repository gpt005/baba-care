export const SITE = {
  name: "baba pet care",
  shortName: "baba",
  tagline: "home away from home for your fur-babies",
  description:
    "One-on-one, insured, home-style pet care in Ann Arbor, Michigan. Drop-ins, dog walking, boarding, and house sitting from CPR-certified pet sitters.",

  city: "Ann Arbor",
  state: "MI",
  serviceArea: ["Ann Arbor"],

  email: "wutt@babapetcare.com",
  instagramHandle: "@baba.mypetcare",
  instagramUrl: "https://www.instagram.com/baba.mypetcare/",
  roverUrl:
    "https://www.rover.com/promos/wuttht72034?utm_medium=direct&utm_campaign=977262825&utm_content=ssp&utm_source=sit-link&utm_term=gW4wwGzQ",
  intakeFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSeUpPO8vKmiJskO89Mz1Hc4zeJs-U24gqS6mJntliNlTesXpA/viewform",

  insuranceCarrier: "Pet Care Insurance",

  affiliates: [
    {
      name: "Woof Dog Products",
      blurb: "10% off with code: baba",
      url: "https://go.shopyourlikes.com/pi/da89c15340aaf278d2b2aa562970da532ca1b9ef?afId=727808&afCampaignId=540887445&afCreativeId=2993&afPlacementId=70dff4b7-0d7d-4ee2-acf6-d873c6002de2",
    },
    {
      name: "Brooks & Roo",
      blurb: "Handmade pet accessories",
      url: "https://www.brooksandroo.com/discount/YYEQCOIVTC?ref=WUTTHMONEKYI",
    },
  ],
} as const;

export const MAILTO_HREF = `mailto:${SITE.email}`;
