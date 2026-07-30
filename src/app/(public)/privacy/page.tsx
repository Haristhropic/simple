import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Maison privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-tighter sm:text-4xl lg:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 2026
        </p>

        <div className="mt-12 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your name, email address,
              and any other details you submit through our contact form or when making a purchase.
              We also automatically collect certain technical information such as your IP address,
              browser type, and browsing behavior on our site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">2. How We Use Your Information</h2>
            <p>
              We use your information to process transactions, respond to inquiries, improve our
              website, and send occasional updates if you have opted in. We never sell your personal
              data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">4. Cookies</h2>
            <p>
              Our site uses essential cookies for functionality. We may also use analytics cookies
              to understand how visitors interact with our site. You can control cookie preferences
              through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              To exercise these rights, please contact us through our contact page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">6. Contact</h2>
            <p>
              If you have any questions about this privacy policy, please reach out via our
              contact page or email us at privacy@maison.com.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
