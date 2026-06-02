import type { OutreachDraftAsset, OutreachAssetKind, OutreachChannel, ReviewFlag } from "@ple/types";

const sourceDocument = "workflow_templates.md#Scripts";

function asset(input: {
  kind: OutreachAssetKind;
  title: string;
  intendedUse: string;
  language: OutreachDraftAsset["language"];
  channel: OutreachChannel;
  body: string;
}): OutreachDraftAsset {
  const reviewFlags: ReviewFlag[] = [
    "SCRIPT_REVIEW_REQUIRED",
    "COMPLIANCE_REVIEW_REQUIRED",
    "LIVE_OUTREACH_DISABLED",
    "NO_AUTO_SEND_GUARD",
    "HUMAN_REVIEW_REQUIRED",
  ];

  return {
    id: `draft-${input.kind}`,
    kind: input.kind,
    title: input.title,
    intendedUse: input.intendedUse,
    language: input.language,
    channel: input.channel,
    status: "draft",
    sourceDocument,
    body: input.body.trim(),
    reviewerPlaceholder: "Assign Joshua or approved compliance reviewer before manual use.",
    requiredDisclaimerPlaceholder: "Add approved HeirRight disclaimer before any external use.",
    automationAllowed: false,
    externalUseAllowed: false,
    reviewFlags,
  };
}

export function buildOutreachDraftAssets(): OutreachDraftAsset[] {
  return [
    asset({
      kind: "unclassified_associate_call",
      title: "Unclassified associate call script",
      intendedUse: "Ask a non-target contact for a better way to reach the heir.",
      language: "en",
      channel: "call",
      body: `
Hi, good afternoon, is (heir) available to speak?

If no: Do you know when would be a better time for me to reach (heir)?

If asked who is calling: My name is Joshua. I work with an asset recovery firm here in Miami that helps families get their estates settled. I was trying to get a hold of (heir) because they inherited a portion of a property from their family and we are in the process of helping them with the estate. Is there a good number I could reach (heir) at?
`,
    }),
    asset({
      kind: "neighbor_call",
      title: "Neighbor call script",
      intendedUse: "Ask a neighbor for occupancy or family-contact clues after approval.",
      language: "en",
      channel: "call",
      body: `
Hi, (neighbor), good afternoon. I am sorry this is a little random, but I have been trying to get in contact with the relatives of your neighbor, (deceased person). I know they passed away some time ago. We are currently in the process of doing the probate for their estate and, since you are their neighbor, I wanted to reach out and see if you knew of anyone living at the house or continually going in and out.

Then ask family-tree questions: What are their names? Do you know of any family members I could reach out to?
`,
    }),
    asset({
      kind: "relative_call",
      title: "Relative call script",
      intendedUse: "Confirm family-tree information with a possible relative.",
      language: "mixed",
      channel: "call",
      body: `
Hi, (seller name). Good afternoon. This is (your name). Sorry this is a little random, but I have been trying to get in contact with you and some of the other family members of (deceased person). They left behind a property that would be an inheritance to some of the family members, so I was trying to get in contact with the closest relatives to see if we can help them with the estate. Do you know if (deceased person) had kids?

Spanish variant: Buenas tardes. Soy (tu nombre). Disculpa que esto sea un poco inesperado, pero he estado tratando de ponerme en contacto contigo y con algunos otros miembros de la familia de (nombre del fallecido). Dejo una propiedad que podria ser una herencia para algunos familiares, y queriamos ver si podemos ayudarles con el proceso de sucesion o venta.
`,
    }),
    asset({
      kind: "owner_call",
      title: "Owner call script",
      intendedUse: "Open a manual conversation with a possible owner or heir.",
      language: "mixed",
      channel: "call",
      body: `
Hey (seller name), this is _____. I was calling to see if you had any plans on liquidating your portion of the property on (street address).

We specialize in inheritance recovery, so we help heirs and family members get paid for their portions of the house. We go through the judicial process and take care of the legal and financial headaches that come with settling the estate.

Spanish variant: Nos especializamos en recuperacion de herencias. Ayudamos a herederos y familiares a recibir el pago correspondiente por su parte de la propiedad, y nos encargamos del proceso judicial y de los problemas legales y financieros que conlleva la liquidacion de una sucesion.
`,
    }),
    asset({
      kind: "only_heir_call",
      title: "Only-heir call script",
      intendedUse: "Discuss awareness, probate friction, and possible liquidation with an heir after review.",
      language: "en",
      channel: "call",
      body: `
Hi, (seller name). Good afternoon. This is (your name). I know this is a little random, but I was trying to get in contact with some of the family members of, I believe, your (father/mother/etc.), (decedent name). Are you aware of the house they left behind that would be an inheritance to multiple family members on (street name)?

If aware: Have you had any trouble figuring out the property or how to claim your portion of the inheritance?

If not aware: Please write this down: (address). We specialize in inheritance recovery and help heirs get paid for their portions of the house. I will send you a text with our info and the property I mentioned. Can we circle back in a day or two?
`,
    }),
    asset({
      kind: "closing_call",
      title: "Closing call script",
      intendedUse: "Explain process, timeline, and expected payout after manager/operator review.",
      language: "en",
      channel: "call",
      body: `
Hi (heir), this is (your name). Is now still a good time?

On this call I am going to explain the process, timeline, and how much you would walk away with after it is all said and done. Before I get into the process, I need to confirm: whether there was a will, the family tree, whether the property was homestead, and whether the decedent left bank accounts.

After that, send the approved written summary by email if the heir confirms the best email address.
`,
    }),
    asset({
      kind: "text_message",
      title: "Text message template",
      intendedUse: "Manual text follow-up after approval; never auto-send.",
      language: "en",
      channel: "text",
      body: `
Hi (seller name), good afternoon. This is Joshua. I know this is a little random, but I was trying to get in contact with some of the family members of (decedent). Are you aware of the house they left behind that would be an inheritance to multiple family members?

Address:

I wanted to know if you have had any trouble figuring out the property or how to claim your portion of the inheritance. When would be a good time to speak?

Best regards,
Joshua Hernandez
360 NW 27th St, Fl 8
Miami, FL 33127
HeirRight LLC
www.HeirRight.com
`,
    }),
    asset({
      kind: "email",
      title: "Email follow-up template",
      intendedUse: "Manual written summary after a reviewed call.",
      language: "en",
      channel: "email",
      body: `
Good afternoon,

Below are the details for this estate referencing (property address).

Property owner:
DOB:
DOD:

Detailed case summary:
1. Probate proceedings may need to be initiated for the listed individuals.
2. Any will or contest could affect distribution and timing.
3. Once the estates are administered, sale or buyout options can be discussed if all heirs agree.
4. Timeline and payout details must be confirmed by the approved operator before sending.
`,
    }),
    asset({
      kind: "offer_letter",
      title: "Offer letter template",
      intendedUse: "Draft offer letter only after report, underwriting, and compliance review.",
      language: "en",
      channel: "letter",
      body: `
Date:
Property Address:
Estate of:

Hello, (seller name).

My name is _____________________. I have been trying to get in contact with you and some of the other family members of (deceased person). They left behind a property that would possibly be an inheritance to you and some other family members.

After approved due diligence and operator review, HeirRight may discuss buying your portion of the inheritance. Offer amount, probate language, and legal statements must be approved before this draft is used externally.

Best regards,
Joshua Hernandez
`,
    }),
  ];
}
