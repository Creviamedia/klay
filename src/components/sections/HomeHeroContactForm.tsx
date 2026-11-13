import { KlayLeadForm } from '@/components/forms/KlayLeadForm';

/**
 * Sovereign Lead Capture Hero Form:
 * 100% native React form with zero third-party iframe overhead or layout shift.
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
