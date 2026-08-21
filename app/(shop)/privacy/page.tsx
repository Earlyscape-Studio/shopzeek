import type { Metadata } from "next";
import { LegalPageLayout, LegalSection, LegalList } from "@/components/shared/legal/legalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Zeek",
  description: "How Zeek collects, uses, shares, stores, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" breadcrumbLabel="Privacy Policy">
      <LegalSection title="Your Personal Information">
        <p>
          As a data subject (customer, delivery recipient), you can be assured that The Zeek Fashion Co.
          (&ldquo;Zeek,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is dedicated to
          protecting your privacy and maintaining the highest level of security whenever you interact with
          us.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect, how we collect, use, share,
          store, and protect it, and the rights you have regarding your data. By visiting our website
          (http://www.zeek.you), communicating with our customer service, or engaging with any of our
          services (collectively, the &ldquo;Services&rdquo;), you consent to the practices described in
          this policy.
        </p>
      </LegalSection>

      <LegalSection title="Personal Information Collected and How We Collect It">
        <p>
          Personal information refers to any data that can identify you as an individual. Depending on how
          you interact with Zeek, we may collect:
        </p>
        <LegalList
          items={[
            <>
              <strong>Personal/Contact Details:</strong> Full name, phone number, email, postal address.
            </>,
            <>
              <strong>Delivery &amp; Transaction Data:</strong> Package details, delivery addresses,
              sender/receiver details, payment information, and related service records.
            </>,
            <>
              <strong>Financial Information:</strong> Billing details, card or bank account numbers when
              you place an order on our website.
            </>,
          ]}
        />
        <p>
          We collect this information via our website, call center, live chat, email, social media
          channels, and physical service points.
        </p>
      </LegalSection>

      <LegalSection title="Legal Basis for Processing">
        <p>Zeek processes personal data only when at least one of these conditions applies:</p>
        <LegalList
          items={[
            <>
              <strong>Consent:</strong> You have given clear consent for specific processing purposes by
              placing an order on our website.
            </>,
            <>
              <strong>Contract:</strong> Processing is necessary to fulfil a delivery or other service
              contract with you.
            </>,
            <>
              <strong>Legal Obligation:</strong> Processing required to comply with applicable laws (e.g.,
              tax, anti-fraud).
            </>,
            <>
              <strong>Vital Interest:</strong> To protect your life or another person&rsquo;s vital
              interests in emergencies.
            </>,
            <>
              <strong>Public Interest/Legitimate Interest:</strong> For legitimate business purposes that
              do not override your rights.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="How We Use Your Personal Data">
        <p>To the extent permitted by law, we use your information to:</p>
        <LegalList
          items={[
            "Provide and operate our order fulfilment and delivery related services.",
            "Manage pickups, deliveries, payments, and customer support.",
            "Improve our services, develop new offerings, and conduct data analytics for operational efficiency.",
            "Detect and prevent fraud, theft, or abuse of our systems.",
            "Communicate service updates, promotions, or offers (where permitted).",
            "Comply with legal and regulatory requirements, including responding to law enforcement requests.",
          ]}
        />
        <p>Without this information, we may be unable to provide you with certain services.</p>
      </LegalSection>

      <LegalSection title="Sharing and Transfer of Personal Data">
        <p>We may share personal data with:</p>
        <LegalList
          items={[
            "Third-party delivery services & affiliates that need the information to provide services.",
            "Third-party partners & service providers (e.g., payment processors, IT support, couriers) bound by confidentiality agreements.",
            "Regulatory or government authorities where required by law or legal process.",
            "Business transfers in the event of a merger, acquisition, or asset sale.",
          ]}
        />
      </LegalSection>

      <LegalSection title="International Orders">
        <p>
          If personal data is transferred to a country lacking equivalent data protection laws, we will
          implement appropriate safeguards (such as standard contractual clauses) and ensure compliance
          with the Nigeria Data Protection Regulation (NDPR) and other applicable laws.
        </p>
      </LegalSection>

      <LegalSection title="Data Protection Measures">
        <p>Zeek applies robust technical and organizational controls to protect your data, including:</p>
        <LegalList
          items={[
            "Encryption of data in transit and at rest",
            "Secure servers and firewalls",
            "Access controls and multi-factor authentication",
            "Regular security audits",
          ]}
        />
        <p>
          You are responsible for maintaining the secrecy of your account credentials and promptly
          notifying us of any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection title="Data Breach Notification">
        <p>
          In the event of a personal data breach, Zeek will notify the appropriate authorities and
          affected individuals within 72 hours of becoming aware of the breach, as required by NDPR.
        </p>
      </LegalSection>

      <LegalSection title="Your Data Protection Rights">
        <p>You have the right to:</p>
        <LegalList
          items={[
            "Be informed about how we use your data.",
            "Access the personal data we hold about you.",
            "Rectification of inaccurate or incomplete data.",
            "Erasure of data where legally permissible (\u201cright to be forgotten\u201d).",
            "Restrict processing under certain conditions.",
            "Data portability to receive or transfer your data in a machine-readable format.",
            "Object to certain processing, including marketing.",
            "Withdraw consent at any time, without affecting prior lawful processing.",
          ]}
        />
        <p>To exercise these rights, contact us (details below).</p>
      </LegalSection>

      <LegalSection title="Automated Processing and Profiling">
        <p>
          Our third-party delivery and other service agents may use automated decision-making, including
          profiling, for route optimization, fraud prevention, and service personalization. Such
          processing will never have legal or significant effects on you without human oversight. You can
          object to this by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="Data Retention">
        <p>
          We keep your personal data only as long as necessary to fulfil the purposes described here and
          to comply with legal obligations (e.g., tax and accounting rules). When data is no longer
          required, it will be securely deleted or anonymized.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>Zeek uses cookies to enhance your experience on our website and apps:</p>
        <LegalList
          items={[
            "Essential cookies for site functionality.",
            "Analytics cookies to understand usage and improve performance.",
            "Preference cookies to remember settings and tailor content.",
          ]}
        />
        <p>
          You can manage or disable cookies through your browser settings, but some site features may not
          function properly if you do so.
        </p>
      </LegalSection>

      <LegalSection title="Children's Privacy">
        <p>
          Our services are not directed to children under 18, and we do not knowingly collect personal
          data from them. Parents or guardians should supervise children&rsquo;s online activities.
        </p>
      </LegalSection>

      <LegalSection title="Communication & Marketing">
        <p>
          By providing your email, phone number, or similar contact details, you consent that Zeek may
          contact you for service updates, delivery notifications, or marketing (where permitted). You can
          opt out of marketing communications at any time.
        </p>
      </LegalSection>

      <LegalSection title="External Links">
        <p>
          Our websites may link to external websites. We are not responsible for the privacy practices of
          those third-party sites and encourage you to review their privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="Do We Share Your Data?">
        <p>
          We do not disclose or share personal data provided to us on this website, unless it is
          absolutely necessary. We may share your personal information with affiliates; authorised
          agents; service providers, such as IT service providers; operating companies and other related
          entities.
        </p>
      </LegalSection>

      <LegalSection title="Policy Updates">
        <p>
          Zeek reserves the right to update this Privacy Policy periodically. Changes will be posted on
          our website with a new &ldquo;Last Updated&rdquo; date. We encourage you to review it regularly.
        </p>
      </LegalSection>

      <LegalSection title="Contact Information">
        <p>
          For questions, concerns, or to exercise your rights under this Policy, please contact:
        </p>
        <p className="text-gray-900 font-medium">
          The Zeek Fashion Company
          <br />
          52-54 Isaac John Street, Ikeja GRA, Lagos 100282, Lagos
          <br />
          Email: hello@zeek.you
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}