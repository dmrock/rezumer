import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Contact | Rezumer",
};

export default function ContactPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Contact" description="I'd love to hear from you" />

        <div className="border-border/60 bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <p>
            Need help or have a question? Reach out to me at{" "}
            <Link href="mailto:equi.denis@gmail.com" className="underline underline-offset-4">
              equi.denis@gmail.com
            </Link>
            .
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            Note: This is a temporary solution. I will implement a proper contact form in the
            future.
          </p>
        </div>
      </div>
    </div>
  );
}
