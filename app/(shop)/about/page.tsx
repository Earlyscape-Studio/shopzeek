import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/shared/legal/legalPageLayout";

export const metadata: Metadata = {
  title: "About Us | Zeek",
  description:
    "Zeek is one of Nigeria's fastest growing brands, trusted for quality and affordability.",
};

export default function AboutPage() {
  return (
    <LegalPageLayout title="About Us" breadcrumbLabel="About">
      <LegalSection title="The Zeek Fashion Co.">
        <p>
          Zeek is one of Nigeria&apos;s fastest growing brands, trusted for
          quality and affordability.
        </p>
        <p>
          At The Zeek Fashion Company, our vision of providing our customers
          with quality, and affordable products is at the very core of who we
          are.
        </p>
        <p>
          We are constantly working on expanding our product offerings,
          because we sincerely believe our customers deserve only the best
          products at the best prices.
        </p>
      </LegalSection>

      <LegalSection title="Dedicated Team">
        <p>
          Skilled professionals working together to provide the best products
          for our customers.
        </p>
      </LegalSection>

      <LegalSection title="Affordable Solutions">
        <p>
          Cost-effective options designed to fit budgets while maintaining our
          excellent and quality service standards.
        </p>
      </LegalSection>

      <LegalSection title="Strong Support & Delivery">
        <p>
          Timely assistance available to guide, help, and resolve queries
          whenever needed.
        </p>
      </LegalSection>

      <LegalSection title="Quality Focus">
        <p>
          Commitment to maintaining high standards in every order, ensuring
          quality and maintaining trust.
        </p>
      </LegalSection>

      <LegalSection title="Get in Touch">
        <p>
          <a href="tel:+2349110497316" className="text-[#FF5A00] hover:underline">
            +234 911 049 7316
          </a>
        </p>
        <p>
          <a href="mailto:hello@zeek.you" className="text-[#FF5A00] hover:underline">
            hello@zeek.you
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}