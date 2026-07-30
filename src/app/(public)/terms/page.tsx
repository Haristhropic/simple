import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Maison terms of service — the conditions governing your use of our website.",
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </span>
        <h1 className="mt-3 text-3xl font-medium tracking-tighter sm:text-4xl lg:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: July 2026
        </p>

        <div className="mt-12 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Maison website, you agree to be bound by these Terms of
              Service. If you do not agree with any part of these terms, you should not use our
              site or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">2. Use of the Site</h2>
            <p>
              You agree to use our site for lawful purposes only. You must not use the site in any
              way that violates applicable laws or regulations, infringes on the rights of others,
              or disrupts the operation of the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">3. Intellectual Property</h2>
            <p>
              All content on this site — including text, images, graphics, and design — is the
              property of Maison unless otherwise credited. You may not reproduce, distribute, or
              modify any content without prior written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">4. Product Information</h2>
            <p>
              We strive to display accurate product descriptions and pricing. However, we do not
              guarantee that all information is error-free. We reserve the right to correct any
              errors and update information at any time without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">5. Limitation of Liability</h2>
            <p>
              Maison shall not be held liable for any indirect, incidental, or consequential
              damages arising from your use of our website or products. Our total liability is
              limited to the amount you have paid us for the specific product or service in
              question.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">6. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Changes will be posted on
              this page with an updated revision date. Continued use of the site after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">7. Contact</h2>
            <p>
              For questions about these terms, please contact us through our contact page or at
              legal@maison.com.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
