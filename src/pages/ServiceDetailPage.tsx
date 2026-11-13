import { useParams } from 'react-router-dom';
import { SERVICES } from '@/lib/data';
import { PageCTA, PageHero, FeatureList } from '@/components/sections/MarketingPages';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function ServiceDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) return <NotFoundPage />;

  return (
    <div className="bg-[#FBFBFB] text-[#0C2D48]">
      <PageHero eyebrow="UAE Business Services" title={service.title} description={service.short} />

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative border border-[#0C2D48]/10 bg-white p-7 sm:p-10 shadow-sm">
            <CornerCrosshairs />
            <h2 className="font-heading text-2xl font-semibold text-[#0C2D48]">About this service</h2>
            <p className="mt-4 leading-relaxed text-[#0C2D48]/80">{service.description}</p>
            <h3 className="mt-8 font-heading text-lg font-semibold text-[#0C2D48]">Key benefits</h3>
            <div className="mt-4">
              <FeatureList items={service.benefits} />
            </div>
          </div>

          <div className="relative border border-[#0C2D48]/10 bg-white p-7 sm:p-10 shadow-sm">
            <CornerCrosshairs />
            <h2 className="font-heading text-2xl font-semibold text-[#0C2D48]">What to expect</h2>
            <ol className="mt-5 space-y-4">
              {service.process.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-[#0C2D48]/80">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center bg-[#0C2D48] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-[#0C2D48]/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative border border-[#0C2D48]/10 bg-white p-7 sm:p-10 shadow-sm">
            <CornerCrosshairs />
            <h2 className="font-heading text-2xl font-semibold text-[#0C2D48]">Information to prepare</h2>
            <p className="mb-6 mt-2 text-sm text-[#0C2D48]/70">
              Requirements can vary by authority and application. These are common items to discuss during your consultation.
            </p>
            <FeatureList items={service.requirements} />
          </div>
        </div>
      </section>

      <PageCTA title={`Discuss ${service.title}`} />
    </div>
  );
}
