import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Contact | Rezumer",
};

export default function ContactPage() {
  return (
    <div className="from-background to-muted bg-gradient-to-b p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Contact" description="We'd love to hear from you" />

        <div className="border-border/60 bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <p>
            Need help or have a question? Reach out to us at{" "}
            <Link href="mailto:support@example.com" className="underline underline-offset-4">
              support@example.com
            </Link>
            .
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            Note: This is a placeholder address. Replace with your preferred support channel when
            ready.
          </p>
        </div>
      </div>
    </div>
  );
}
