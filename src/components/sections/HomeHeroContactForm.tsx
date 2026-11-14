import { KlayLeadForm } from '@/components/forms/KlayLeadForm';

/**
 * Sovereign Lead Capture Hero Form:
 * Note: Cleanly extracted from the Hero Fold in Milestone 2 in accordance with Equitify design parity.
 * Relocated to dedicated Footer Consultation Zone in Milestone 4 and ContactPage.
 * Retained for direct modular invocation and backward compatibility.
 */
export function HomeHeroContactForm() {
  return (
    <div className="w-full max-w-[560px]">
      <KlayLeadForm
        variant="dark"
        source="home-hero"
        title="Tell us about your plans"
        subtitle="Share your details and the service you are interested in."
        eyebrow="Get in touch"
      />
    </div>
  );
}

export default HomeHeroContactForm;
