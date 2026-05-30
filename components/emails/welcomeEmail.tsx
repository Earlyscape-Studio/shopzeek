
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
} from '@react-email/components';




interface WelcomeEmailProps {
    firstName: string
}


export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to ShopZeek, {firstName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>ShopZeek</Heading>
          
          <Text style={paragraph}>Hi {firstName},</Text>
          <Text style={paragraph}>
            Welcome to ShopZeek! We are thrilled to have you join our community. Your account is now fully set up, which means you can start building your wishlist, track orders easily, and enjoy faster checkouts.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={process.env.NEXT_PUBLIC_BASE_URL}>
              Start Shopping Now
            </Button>
          </Section>

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

