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

interface DeliveryScheduleProps {
  customerName: string;
  estimatedDeliveryDate: string;
  trackingUrl: string;
}

export const DeliveryScheduleEmail = ({
  customerName,
  estimatedDeliveryDate,
  trackingUrl,
}: DeliveryScheduleProps) => {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Knock, knock! Your delivery is scheduled 🚚💨</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            <Tailwind>
              <Img
                alt="zeek logo"
                width={250}
                height={150}
                src={`${baseUrl}/static/zeek1.svg`} 
                />
            </Tailwind>
          </Heading>
          <div style={spacer} />
          <Text style={paragraph}>Get excited, {customerName}!</Text>
          <Text style={paragraph}>
            Your goodies from Zeek is officially on the move and heading your way.
          </Text>
          
          <Section style={infoSection}>
            <Text style={infoText}>
              🗓️ <strong>Estimated Delivery Date:</strong> {estimatedDeliveryDate}
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}><strong>What to do next:</strong></Text>
          
          <ul style={list}>
            <li style={listItem}>Clear your schedule (or at least keep an ear out for the doorbell).</li>
            <li style={listItem}>Track your package's every move using the link below!</li>
          </ul>
          
          <Section style={buttonContainer}>
            <Button style={button} href={trackingUrl}>
              TRACK MY PACKAGE
            </Button>
          </Section>

          <Text style={paragraph}>
            If you need to make any changes or leave special instructions for the driver, just click the tracking link above.
          </Text>
          
          <Text style={footerText}>
            Always at your service,<br />
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
const infoSection = { margin: '24px 0', backgroundColor: '#FFF5F0', padding: '20px', borderRadius: '8px', border: '1px solid #FFE0D1' };
const infoText = { fontSize: '16px', color: '#333', margin: 0 };
const hr = { borderColor: '#e6ebf1', margin: '24px 0' };
const list = { paddingLeft: '20px', color: '#333', margin: '16px 0' };
const listItem = { fontSize: '15px', marginBottom: '12px', lineHeight: '1.4' };
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
const footerText = { fontSize: '16px', color: '#333', lineHeight: '1.6', marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' };
