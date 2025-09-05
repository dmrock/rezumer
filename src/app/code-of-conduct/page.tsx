import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Code of Conduct | Rezumer",
};

export default function CodeOfConductPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Code of Conduct" description="Our expectations for using Rezumer" />

        <div className="text-foreground/90 max-w-none space-y-4 leading-relaxed md:space-y-5">
          <p className="m-0 mb-4">
            We are committed to providing a respectful and inclusive experience for everyone using
            Rezumer.
          </p>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Expectations</h2>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>Be respectful and considerate in all interactions.</li>
              <li>Do not harass, threaten, or discriminate against others.</li>
              <li>Do not use the service for unlawful or harmful activities.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Reporting</h2>
            <p className="m-0">
              If you encounter behavior that violates this Code, please contact us via the Contact
              page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Enforcement</h2>
            <p className="m-0">
              Violations may result in warnings, temporary suspension, or account termination at our
              discretion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
