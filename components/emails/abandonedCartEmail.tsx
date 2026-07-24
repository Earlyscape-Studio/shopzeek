import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Img,
  Tailwind
} from '@react-email/components';

interface AbandonedCartProps {
  customerName: string;
  items: { name: string }[];
  cartUrl: string;
}

export const AbandonedCartEmail = ({
  customerName,
  items,
  cartUrl,
}: AbandonedCartProps) => {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Did you forget something awesome? 👀</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            <Tailwind>
              <Img
                alt="zeek logo"
                width={250}
                height={150}
                src="https://swjqqxhvicbxqcembkml.supabase.co/storage/v1/object/sign/email%20assets/zeek1.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZmMyMThlOS1mZmMzLTQxMTItODlkYy02M2QxNmRkOTU0ZjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJlbWFpbCBhc3NldHMvemVlazEuc3ZnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDkwNzEzNCwiZXhwIjoxODE2NDQzMTM0fQ.tRzoJ4BJbBGid_qp8QsDaw4rRP_mPLcmDesV9rYD5fo"
                />
            </Tailwind>
          </Heading>
          <div style={spacer} />
          <Text style={paragraph}>Hey {customerName},</Text>
          <Text style={paragraph}>
            We were walking through the aisles and noticed you left some pretty great stuff sitting in your cart. We totally get it—life happens, tabs get closed, dodo gets burnt.
          </Text>
          <Text style={paragraph}>
            But we couldn&apos;t just let these beauties sit lonely in the dark!
          </Text>
          
          <Section style={infoSection}>
            <Text style={subHeading}>Waiting patiently for you:</Text>
            <ul style={list}>
              {items.map((item, index) => (
                <li key={index} style={listItem}>{item.name}</li>
              ))}
            </ul>
          </Section>

          <Text style={paragraph}>
            We saved your cart so you can easily pick up exactly where you left off.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={cartUrl}>
              TAKE ME BACK TO MY CART
            </Button>
          </Section>

          <Section style={offerSection}>
            <Text style={offerText}>
              Psst... still on the fence? Use the code <strong style={code}>ZCART5</strong> at checkout for a cheeky 5% off these items. Don&apos;t wait too long though, they might sell out!
            </Text>
          </Section>

          <Text style={footerText}>
            Happy Shopping,<br />
            <strong>The Zeek Team 🧡</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif', padding: '10px 0' };
const container = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', margin: '40px auto', maxWidth: '600px', border: '1px solid #e6ebf1' };
const heading = { color: '#FF5A00', textAlign: 'center' as const, margin: '0 0 20px 0', fontSize: '28px', fontWeight: 'bold' };
const spacer = { height: '20px' };
const paragraph = { fontSize: '16px', color: '#333', lineHeight: '1.5', margin: '16px 0' };
const subHeading = { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' };
const infoSection = { margin: '24px 0' };
const list = { paddingLeft: '20px', color: '#333', margin: '0 0 16px 0' };
const listItem = { fontSize: '15px', marginBottom: '8px', lineHeight: '1.4' };
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = {
  backgroundColor: '#FF5A00',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px 0',
};
const offerSection = { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px dashed #ccc', margin: '24px 0' };
const offerText = { fontSize: '14px', color: '#555', margin: 0, lineHeight: '1.5' };
const code = { color: '#FF5A00', fontSize: '16px' };
const footerText = { fontSize: '16px', color: '#333', lineHeight: '1.6', marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' };
