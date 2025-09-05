import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Terms of Use | Rezumer",
};

export default function TermsPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Terms of Use" description={"Last updated: September 5, 2025"} />

        <div className="text-foreground/90 max-w-none space-y-4 leading-relaxed md:space-y-5">
          <p className="m-0 mb-4">
            Welcome to Rezumer. By accessing or using our website and services, you agree to these
            Terms of Use. If you do not agree, please do not use Rezumer.
          </p>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              1. Service Description
            </h2>
            <p className="m-0">
              Rezumer helps you track job applications and, in the future, create resumes. Core
              features currently include tracking your application submissions. Planned features
              include resume building and, in a distant future, optional export features for
              companies — only with your explicit consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              2. Your Account
            </h2>
            <p className="m-0">
              You may sign in using email or Google. When you sign in with Google, we may receive
              your name from Google. You are responsible for maintaining the confidentiality of your
              account and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">3. Your Data</h2>
            <p className="m-0">
              We store your application submissions. They are not shared with others and are
              accessible only to you. In the future, we may store information you choose to include
              in resumes. Any export or sharing of resume data will only occur with your explicit
              consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              4. Acceptable Use
            </h2>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>Do not abuse, disrupt, or attempt to circumvent security of the service.</li>
              <li>Do not upload unlawful, infringing, or harmful content.</li>
              <li>Respect others and follow our Code of Conduct.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              5. Intellectual Property
            </h2>
            <p className="m-0">
              Rezumer and its logos are the property of their respective owners. You retain rights
              to the content you add.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">6. Termination</h2>
            <p className="m-0">
              We may suspend or terminate access for behavior that violates these terms. You may
              stop using the service at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">7. Disclaimers</h2>
            <p className="m-0">
              The service is provided on an &quot;as is&quot; basis without warranties of any kind
              to the extent permitted by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">8. Changes</h2>
            <p className="m-0">
              We may update these terms. If changes are material, we will notify you by reasonable
              means.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">9. Contact</h2>
            <p className="m-0">For questions about these terms, see the Contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
