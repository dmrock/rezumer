export const metadata = {
  title: "Privacy Policy | Rezumer",
};

import { PageHeader } from "@/components/shared/page-header";

export default function PrivacyPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Privacy Policy" description={"Last updated: September 5, 2025"} />

        <div className="text-foreground/90 max-w-none space-y-4 leading-relaxed md:space-y-5">
          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Overview</h2>
            <p className="m-0">
              Rezumer respects your privacy. This policy explains what we collect, how we use it,
              and your choices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              Data We Collect
            </h2>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>
                Account data: your email. If you sign in with Google, we also receive your name as
                provided by Google.
              </li>
              <li>
                Application data: information you add about your job application submissions (e.g.,
                job title, company, notes).
              </li>
              <li>
                Future resume data: information you choose to include in resumes you create within
                Rezumer (planned feature).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              How We Use Data
            </h2>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>
                To provide and improve the service (e.g., display and organize your applications).
              </li>
              <li>To secure your account and authenticate you.</li>
              <li>To communicate with you about service updates and support.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Data Sharing</h2>
            <p className="m-0">
              We do not sell or share your application or resume data with third parties. Your data
              is accessible only to you. In the distant future, we may offer optional exports of
              resume data to companies, but only with your explicit consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Data Retention</h2>
            <p className="m-0">
              We retain your data for as long as your account is active or as needed to provide the
              service. You may request deletion of your account and associated data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Security</h2>
            <p className="m-0">
              We use reasonable organizational and technical measures to protect your data. No
              method of transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Your Choices</h2>
            <ul className="m-0 list-disc space-y-1 pl-5">
              <li>Access, update, or delete your data within the product where available.</li>
              <li>Request account deletion by contacting us.</li>
              <li>Manage Google account permissions if you used Google sign-in.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Children</h2>
            <p className="m-0">
              The service is not intended for children under 13, and we do not knowingly collect
              their personal information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Changes</h2>
            <p className="m-0">
              We may update this policy from time to time. If changes are material, we will notify
              you by reasonable means.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Contact</h2>
            <p className="m-0">For privacy questions or requests, see the Contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
