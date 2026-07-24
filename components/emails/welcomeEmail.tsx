
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






interface WelcomeEmailProps {
  firstName: string
}


export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to zeek, {firstName}!</Preview>
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

          <Text style={paragraph}>Hi {firstName},</Text>
          <Text style={paragraph}>
            We are doing a happy dance over here because you just joined the Zeek family!

            Whether you&apos;re here to treat yourself, find the perfect gift, or just window-shop our latest drops, we promise to make it worth your while. Here is what you can expect from us:

            Early access to our newest collections.

            Exclusive discounts that we only share with our email crew.

            Zero spam. Just the good stuff.

            To kick things off, we want to treat you to 5% OFF your first order.

            Use code: ZEEKFAM at checkout.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={process.env.NEXT_PUBLIC_BASE_URL}>
              Start Shopping Now
            </Button>
          </Section>.

          <Text style={paragraph}>
            Happy Shopping,

            The Zeek Team ❤️
          </Text>
          <Tailwind>
            <Img 
            alt="zeek logo"
            className=""
            width={150}
            height={80}
            src="https://swjqqxhvicbxqcembkml.supabase.co/storage/v1/object/sign/email%20assets/zeek1.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZmMyMThlOS1mZmMzLTQxMTItODlkYy02M2QxNmRkOTU0ZjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJlbWFpbCBhc3NldHMvemVlazEuc3ZnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NDkwNzEzNCwiZXhwIjoxODE2NDQzMTM0fQ.tRzoJ4BJbBGid_qp8QsDaw4rRP_mPLcmDesV9rYD5fo" 
            />
          </Tailwind>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Reply to this email, and our support team will get back to you right away.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', margin: '40px auto', maxWidth: '600px' };
const heading = { color: '#FF5A00', textAlign: 'center' as const, margin: '0 0 20px 0' };
const paragraph = { fontSize: '16px', color: '#333', lineHeight: '1.5' };
const btnContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#FF5A00', borderRadius: '4px', color: '#fff', fontSize: '16px', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '14px 20px', fontWeight: 'bold' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '16px' };

