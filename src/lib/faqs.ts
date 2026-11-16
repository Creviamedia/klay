export interface FaqItem {
  question: string;
  answer: string;
}

export interface NumberedFaqItem extends FaqItem {
  number: string;
}

export const HOMEPAGE_FAQS: NumberedFaqItem[] = [
  {
    number: '01',
    question: 'Can foreign nationals own 100% of a UAE company?',
    answer:
      'Yes. Under UAE Federal Decree-Law No. 26 of 2020, foreign investors can own 100% of companies across both Free Zones and most Dubai Mainland (DED) commercial activities without requiring an Emirati national shareholder or local nominee.',
  },
  {
    number: '02',
    question: 'What is the main difference between Mainland and Free Zone setup?',
    answer:
      'A Dubai Mainland (DED) license allows your company to trade directly across all 7 UAE emirates, open retail/office premises anywhere, and bid for UAE government contracts. A Free Zone license offers 100% customs duty exemptions and 0% corporate tax on qualifying foreign income, making it ideal for international consulting, tech, trade, and export services.',
  },
  {
    number: '03',
    question: 'How fast can a UAE business license be issued?',
    answer:
      'With Klay Consultants, pre-approved Free Zone licenses can be issued within 24 to 48 hours. Dubai Mainland licenses typically take 3 to 5 business days once trade name approvals and digital MOA notarisation are completed.',
  },
  {
    number: '04',
    question: 'How do you guarantee corporate bank account opening?',
    answer:
      'UAE banking regulations require rigorous KYC and AML compliance. Klay prepares an institutional compliance profile of your company, business activities, and ultimate beneficial owners (UBOs) prior to submission. We partner directly with senior relationship managers at Emirates NBD, Mashreq, FAB, and Wio to ensure seamless account approval.',
  },
  {
    number: '05',
    question: 'Can I sponsor my family and obtain a UAE Golden Visa?',
    answer:
      'Yes. Company shareholders and investors holding a trade license can sponsor their spouse, children, and parents for UAE residency visas. Qualifying investors with setup capital of AED 2M+ or real estate assets may also apply for the prestigious 10-year UAE Golden Visa.',
  },
];

export const CALCULATOR_FAQS: NumberedFaqItem[] = [
  {
    number: '01',
    question: 'How accurate is the Dubai trade license cost estimate?',
    answer:
      'The calculator uses the official 2026 tariff schedules across UAE Mainland (DED) and major Free Zones (Meydan, IFZA, DMCC, RAK ICC). Exact fees are verified with the regulatory authority prior to filing based on your exact commercial activities.',
  },
  {
    number: '02',
    question: 'Does the estimated cost include UAE residency visas?',
    answer:
      'Yes. When you specify investor, partner, or employment visas, the calculation dynamically incorporates entry permits, medical VIP screening, Emirates ID fees, and immigration establishment card allocations.',
  },
  {
    number: '03',
    question: 'Can overseas international investors use this calculator?',
    answer:
      'Yes. The calculator supports both UAE residents and foreign founders worldwide. International investors can incorporate 100% foreign-owned entities remotely without traveling to Dubai for initial trade license issuance.',
  },
  {
    number: '04',
    question: 'Are external regulatory approvals included in the quote?',
    answer:
      'General commercial and consulting activities require zero external approvals. Specialized sectors (healthcare, legal, education, engineering, cryptocurrency) may require approvals from MOHAP, KHDA, or VARA, which our advisory desk pre-screens for you.',
  },
  {
    number: '05',
    question: 'How do I proceed once I receive my estimate?',
    answer:
      'You can submit your calculation directly to receive an official, line-item verified proposal from our senior corporate structuring directors with zero hidden fees.',
  },
];

export const GOLDEN_VISA_FAQS: FaqItem[] = [
  {
    question: 'What is the UAE Golden Visa?',
    answer:
      'The UAE Golden Visa is a long-term residency program for eligible investors, entrepreneurs, professionals and talented individuals, offering renewable residency without the need for a local sponsor.',
  },
  {
    question: 'Who can apply for Golden Visa UAE?',
    answer:
      'Eligibility varies by category and can include investors, entrepreneurs, skilled professionals, students or graduates, and recognized talent, subject to the applicable authority requirements and documentation.',
  },
  {
    question: 'Is the UAE Golden Visa valid for 10 years?',
    answer:
      'The program commonly supports renewable long-term residency, and the precise duration depends on the specific category and authority processes involved.',
  },
  {
    question: 'What is the minimum investment for property investors?',
    answer:
      'Requirements can vary, and property-related eligibility often depends on valuation, title deed documentation and the applicable conditions for the route being considered.',
  },
  {
    question: 'How much does the UAE Golden Visa cost?',
    answer:
      'Government fees, medical and Emirates ID charges, and legal or advisory costs are different, so it is best to review the specific route and supporting costs before making assumptions.',
  },
  {
    question: 'Can Golden Visa holders sponsor their family?',
    answer:
      'Family sponsorship is generally a key benefit of the program, but the specific rules and dependent conditions depend on the applicable regulations and circumstances.',
  },
  {
    question: 'What documents are required?',
    answer:
      'A typical application requires a valid passport, financial records, relevant supporting documents for the category, health insurance and the necessary legal paperwork for the chosen route.',
  },
  {
    question: 'Can a Golden Visa application be rejected?',
    answer:
      'Yes. Incomplete documentation, weak structure, non-alignment of records and compliance issues can create problems, which is why careful preparation matters.',
  },
  {
    question: 'What is the difference between Dubai and Abu Dhabi processing?',
    answer:
      'The overall eligibility is federal in character, but the application route and authority handling can differ by emirate and by the specific category.',
  },
  {
    question: 'How can I discuss my eligibility?',
    answer:
      'The best next step is to speak with an adviser to review your profile, category, documents and the most suitable route before filing anything.',
  },
];
