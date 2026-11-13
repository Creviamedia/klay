# 0001 Sovereign Intake Architecture & Local Data Residency

We decided to build the Sovereign Client Onboarding & Legal Intake Engine with self-contained, typed JSON schemas and local backend endpoint storage (`POST /api/leads`), completely bypassing external SaaS CRM widgets (e.g. HubSpot, Typeform, Airtable). Prospective client corporate structures, UBO details, and jurisdiction data remain sovereign and strictly bound by UAE data protection rules, while preventing third-party vendor lock-in.
