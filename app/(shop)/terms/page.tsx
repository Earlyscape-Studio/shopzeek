import type { Metadata } from "next";
import { LegalPageLayout, LegalSection, LegalList } from "@/components/shared/legal/legalPageLayout";

export const metadata: Metadata = {
  title: "Terms and Conditions | Zeek",
  description: "The general terms and conditions governing your use of Zeek's website and services.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="General Terms and Conditions" breadcrumbLabel="Terms & Conditions">
      <LegalSection title="1. Introduction">
        <p>
          The Zeek Fashion Company Limited (hereinafter referred to as &ldquo;Zeek&rdquo; or
          &ldquo;we&rdquo;) operates an e-commerce platform consisting of a website for the purchase of
          consumer products.
        </p>
        <p>
          These general terms and conditions shall apply to all customers and partners on the Zeek
          website and shall govern your use of our services.
        </p>
        <p>
          By using our website you accept these general terms and conditions in full. If you disagree
          with these general terms and conditions or any part of them, you must not use our website.
        </p>
      </LegalSection>

      <LegalSection title="2. Registration and Account">
        <p>
          You may not register with our website if you are under 18 years of age (by using our website or
          agreeing to these general terms and conditions you warrant and represent to us that you are at
          least 18 years of age).
        </p>
        <p>If you register for an account with our website you will be asked to provide an email address/user ID and password, and you agree to:</p>
        <LegalList
          items={[
            "Keep your password confidential;",
            "Notify us in writing immediately (using our contact details provided on the website) if you become aware of any disclosure of your password; and",
            "Be responsible for any activity on our website arising out of any failure to keep your password confidential, and that you may be held liable for any losses arising out of such a failure.",
            "Your account shall be used exclusively by you and you shall not transfer your account to any third party. If you authorize any third party to manage your account on your behalf, this shall be at your own risk.",
            "You may cancel your account on our website by contacting us.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Terms and Conditions of Sale">
        <p>You acknowledge and agree that:</p>
        <LegalList
          items={[
            "Our website provides an online location for customers to purchase products;",
            "A contract for the purchase of a product or products will come into force when you commit to buying the relevant product or products upon the payment confirmation of purchase via our website;",
            "The price for a product will be as stated in the relevant product listing;",
            "The price for the product must include all taxes and comply with applicable laws in force from time to time;",
            "Delivery costs and charges, where applicable, will only be payable by the buyer.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Returns and Refunds">
        <p>
          Returns of products by customers and acceptance of returned products shall be managed in
          accordance with this policy on the website and may be amended from time to time. Acceptance of
          returns shall be at our discretion, subject to compliance with applicable laws of the territory.
        </p>
        <p>
          Refunds in respect of returned products shall be managed in accordance with this policy, and as
          may be amended from time to time. Our rules on refunds shall be exercised at our discretion,
          subject to applicable laws of the territory. We may offer refunds at our discretion:
        </p>
        <LegalList
          items={[
            "In respect of product pricing issues and/or failed delivery;",
            "Refunds shall be by way of coupons, store credits, vouchers, transfers, or such other methods as we may determine from time to time.",
          ]}
        />
        <p>
          Returned products shall be accepted and refunds issued by Zeek. Notwithstanding the above, for
          items to be eligible for returns, they must be sent back, at the cost of the returnee, within 5
          days of delivery, depending on the product category. Returned items must be unused and in their
          original packaging condition as received.
        </p>
        <p>
          Changes to our returns and refunds policies shall be effective in respect of all purchases made
          from the date of publication of the change on our website.
        </p>
      </LegalSection>

      <LegalSection title="5. Promotions">
        <p>
          Promotions and competitions run by Zeek shall be managed in accordance with the Promotions Terms
          and Conditions. You can view each promotion&rsquo;s terms and conditions on our website.
        </p>
      </LegalSection>

      <LegalSection title="7. Use of Website and/or Mobile Applications">
        <p>In this section, &ldquo;Zeek&rdquo; and &ldquo;website&rdquo; shall be used interchangeably to refer to Zeek&rsquo;s websites and/or mobile applications.</p>
        <p>You may:</p>
        <LegalList
          items={[
            "View pages from our website in a web browser;",
            "Download pages from our website for caching in a web browser;",
            "Print pages from our website for your own personal and non-commercial use, provided that such printing is not systematic or excessive;",
            "Use Zeek's services by means of a web browser, subject to the other provisions of these general terms and conditions.",
          ]}
        />
        <p>
          Except as expressly permitted above, you must not download any material from our website or
          save any such material to your computer, or edit or otherwise modify any material on our
          website. You may only use our website for your own personal and business purposes in respect of
          purchasing products.
        </p>
        <p>Unless you own or control the relevant rights in the material, you must not:</p>
        <LegalList
          items={[
            "Republish material from our website (including republication on another website);",
            "Sell, rent, or sub-license material from our website;",
            "Show any material from our website in public;",
            "Exploit material from our website for a commercial purpose; or",
            "Redistribute material from our website.",
          ]}
        />
        <p>
          Notwithstanding the above, you may forward links to products on our website and redistribute
          our newsletter and promotional materials in print and electronic form to any person.
        </p>
        <p>
          We reserve the right to suspend or restrict access to our website, to areas of our website,
          and/or to functionality on our website &mdash; for example, during server maintenance or when we
          update the website. You must not circumvent or bypass, or attempt to circumvent or bypass, any
          access restriction measures on the website.
        </p>
        <p>You must not:</p>
        <LegalList
          items={[
            "Use our website in any way, or take any action, that causes or may cause damage to the website or impairment of its performance, availability, accessibility, integrity, or security;",
            "Use our website in any way that is unethical, unlawful, illegal, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity;",
            "Hack or otherwise tamper with our website;",
            "Probe, scan, or test the vulnerability of our website without our permission;",
            "Circumvent any authentication or security systems or processes on or relating to our website;",
            "Use our website to copy, store, host, transmit, send, use, publish, or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit, or other malicious computer software;",
            "Impose an unreasonably large load on our website resources (including bandwidth, storage capacity, and processing capacity);",
            "Decrypt or decipher any communications sent by or to our website without our permission;",
            "Conduct any systematic or automated data collection activities (including scraping, data mining, data extraction, and data harvesting) on or in relation to our website without our express written consent;",
            "Access or otherwise interact with our website using any robot, spider, or other automated means, except for the purpose of search engine indexing;",
            "Use our website except by means of our public interfaces;",
            "Violate the directives set out in the robots.txt file for our website;",
            "Use data collected from our website for any direct marketing activity (including email marketing, SMS marketing, telemarketing, and direct mailing); or",
            "Do anything that interferes with the normal use of our website.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Copyright and Trademarks">
        <p>Subject to the express provisions of these general terms and conditions:</p>
        <LegalList
          items={[
            "We, together with our licensors, own and control all the copyright and other intellectual property rights in our website and the material on our website; and",
            "All the copyright and other intellectual property rights in our website and the material on our website are reserved.",
          ]}
        />
        <p>
          Zeek&rsquo;s logos and our other registered and unregistered trademarks are trademarks belonging
          to us; we give no permission for the use of these trademarks, and such use may constitute an
          infringement of our rights.
        </p>
        <p>
          Third-party registered and unregistered trademarks or service marks on our website are the
          property of their respective owners, and we do not endorse and are not affiliated with any of
          the holders of any such rights &mdash; as such, we cannot grant any license to exercise such
          rights.
        </p>
      </LegalSection>

      <LegalSection title="9. Data Privacy">
        <p>
          Customers agree to processing of their personal data in accordance with the terms of
          Zeek&rsquo;s Privacy Policy and Cookie Notice.
        </p>
        <p>
          Zeek shall process all personal data obtained through the website and related services in
          accordance with the terms of our Privacy and Cookie Notice and Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Conflict Resolution and Discontinuation">
        <p>
          We do not warrant or represent that the website will operate without fault, or that the website
          or any service on the website will remain available during the occurrence of events beyond
          Zeek&rsquo;s control (force majeure events), including but not limited to: flood, drought,
          earthquake, or other natural disasters; hacking, viruses, malware, or other malicious software
          attacks on the website; terrorist attacks, civil war, civil commotion, or riots; war, threat of
          or preparation for war; epidemics or pandemics; or extra-constitutional events or circumstances
          which materially and adversely affect the political or macro-economic stability of the territory
          as a whole.
        </p>
        <p>
          We reserve the right to discontinue or alter any or all of our website services, and to stop
          publishing our website at any time in our sole discretion without notice or explanation; you
          will not be entitled to any compensation or other payment upon the discontinuance or alteration
          of any website services or if we stop publishing the website. This is without prejudice to your
          rights in respect of any unfulfilled orders or other existing liabilities of Zeek.
        </p>
        <p>
          If we discontinue or alter any or all of our website in circumstances not relating to force
          majeure, we will provide prior notice to our customers of not less than thirty (30) days, with
          clear guidance on the way forward for pending transactions or other existing liabilities of
          Zeek.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitations and Exclusions of Liability">
        <p>Nothing in these general terms and conditions will:</p>
        <LegalList
          items={[
            "Limit any liabilities in any way that is not permitted under applicable law; or",
            "Exclude any liabilities or statutory rights that may not be excluded under applicable law.",
          ]}
        />
        <p>
          Our aggregate liability to you in respect of any contract to provide services to you under these
          general terms and conditions shall not exceed the total amount paid and payable to us under the
          contract. Each separate transaction on the website shall constitute a separate contract for this
          purpose.
        </p>
        <p>We will not be liable to you for any loss or damage of any nature, including in respect of:</p>
        <LegalList
          items={[
            "Any losses occasioned by any interruption or dysfunction to the website;",
            "Any losses arising out of any event or events beyond our reasonable control;",
            "Any business losses, including loss of or damage to profits, income, revenue, use, production, anticipated savings, business contracts, commercial opportunities, or goodwill;",
            "Any loss or corruption of any data, database, or software; or",
            "Any special, indirect, or consequential loss or damage.",
          ]}
        />
        <p>
          We accept that we have an interest in limiting the personal liability of our officers and
          employees; having regard to that interest, you agree that you will not bring any claim
          personally against our officers or employees in respect of any losses you suffer in connection
          with the website or these general terms and conditions (this will not limit or exclude the
          liability of the limited liability entity itself for the acts and omissions of our officers and
          employees).
        </p>
        <p>
          Our website may include hyperlinks to other websites owned and operated by third parties; such
          hyperlinks are not recommendations. We have no control over third-party websites and their
          contents, and we accept no responsibility for them or for any loss or damage that may arise from
          your use of them.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnification">
        <p>You hereby indemnify us and undertake to keep us indemnified against:</p>
        <LegalList
          items={[
            "Any and all losses, damages, costs, liabilities, and expenses (including legal expenses and any amounts paid by us to any third party in settlement of a claim or dispute) incurred or suffered by us and arising directly or indirectly out of your use of our website or any breach by you of any provision of these general terms and conditions or the Zeek policies or guidelines; and",
            "Any VAT liability or other tax liability that we may incur in relation to any sale, supply, or purchase made through our website, where that liability arises out of your failure to pay, withhold, declare, or register to pay any VAT or other tax properly due.",
          ]}
        />
      </LegalSection>

      <LegalSection title="13. Breaches of These General Terms and Conditions">
        <p>
          If we permit the registration of an account on our website, it will remain open indefinitely
          subject to these general terms and conditions.
        </p>
        <p>
          If you breach these general terms and conditions, or if we reasonably suspect that you have
          breached them or any Zeek policies or guidelines in any way, we may:
        </p>
        <LegalList
          items={[
            "Temporarily suspend your access to our website;",
            "Permanently prohibit you from accessing our website;",
            "Block computers using your IP address from accessing our website;",
            "Contact any or all of your internet service providers and request that they block your access to our website;",
            "Delete your account on our website; and/or",
            "Commence legal action against you, whether for breach of contract or otherwise.",
          ]}
        />
        <p>
          Where we suspend, prohibit, or block your access to our website, you must not take any action to
          circumvent such suspension, prohibition, or blocking (including creating and/or using a
          different account).
        </p>
      </LegalSection>

      <LegalSection title="14. Entire Agreement">
        <p>
          These general terms and conditions and the Zeek policies and guidelines shall constitute the
          entire agreement between you and us in relation to your use of our website, and shall supersede
          all previous agreements between you and us in relation to your use of our website.
        </p>
      </LegalSection>

      <LegalSection title="15. Variation">
        <p>
          We may revise these general terms and conditions and all other Zeek policies and guidelines from
          time to time. The revised general terms and conditions shall apply from the date of publication
          on the website.
        </p>
      </LegalSection>

      <LegalSection title="16. No Waiver">
        <p>
          No waiver of any breach of any provision of these general terms and conditions shall be
          construed as a further or continuing waiver of any other breach of that provision, or any breach
          of any other provision of these general terms and conditions.
        </p>
      </LegalSection>

      <LegalSection title="17. Severability">
        <p>
          If a provision of these general terms and conditions is determined by any court or other
          competent authority to be unlawful and/or unenforceable, the other provisions will continue in
          effect.
        </p>
        <p>
          If any unlawful and/or unenforceable provision of these general terms and conditions would be
          lawful or enforceable if part of it were deleted, that part will be deemed to be deleted and the
          rest of the provision will continue in effect.
        </p>
      </LegalSection>

      <LegalSection title="18. Assignment">
        <p>
          You hereby agree that we may assign, transfer, sub-contract, or otherwise deal with our rights
          and/or obligations under these general terms and conditions.
        </p>
        <p>
          You may not, without our prior written consent, assign, transfer, sub-contract, or otherwise
          deal with any of your rights and/or obligations under these general terms and conditions.
        </p>
      </LegalSection>

      <LegalSection title="19. Third Party Rights">
        <p>
          A contract under these general terms and conditions is for our benefit and your benefit, and is
          not intended to benefit or be enforceable by any third party.
        </p>
        <p>
          The exercise of the parties&rsquo; rights under a contract under these general terms and
          conditions is not subject to the consent of any third party.
        </p>
      </LegalSection>

      <LegalSection title="20. Law and Jurisdiction">
        <p>
          These general terms and conditions shall be governed by and construed in accordance with the
          relevant laws of the Federal Republic of Nigeria.
        </p>
        <p>
          Any disputes relating to these general terms and conditions shall be subject to the exclusive
          jurisdiction of the relevant courts of the Federal Republic of Nigeria.
        </p>
      </LegalSection>

      <LegalSection title="Our Company Details and Notices">
        <p>You can contact us by using the contact details listed on the website.</p>
        <p>
          You consent to receive notices electronically from us. We may provide all communications and
          information related to your use of our website in electronic format, either by posting to our
          website or application or by email to the email address on your account. All such communications
          will be deemed to be notices in writing and received by, and properly given to, you.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}