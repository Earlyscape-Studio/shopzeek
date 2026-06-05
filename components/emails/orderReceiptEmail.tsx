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


interface OrderReceiptProps {
  customerName: string
  orderId: string
  orderDate: string
  totalAmount: number
  orderDetailUrl: string
}


export const OrderReceiptEmail = ({
  customerName,
  orderId,
  orderDate,
  totalAmount,
  orderDetailUrl
}: OrderReceiptProps) => {

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Cha-ching! We got your order! 🛍️</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>zeek</Heading>
          <Text style={paragraph}>You did it, {customerName}!</Text>
          <Text style={paragraph}>
            Great news: your payment went through, your order is confirmed, and our team is already getting your items ready for their grand journey to your doorstep.
          </Text>
          
          <Text style={paragraph}>Here’s what you snagged:</Text>
          
          <Section style={infoSection}>
            <Text style={infoText}>
              Order Number: <strong>#{orderId}</strong>
            </Text>
            <Text style={infoText}>
              Order Date: <strong>{orderDate}</strong>
            </Text>
            <Text style={infoText}>
              Total Paid: <strong>₦{totalAmount.toLocaleString()}</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={paragraph}>Need a recap of your items?</Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={orderDetailUrl}>
              VIEW ORDER DETAILS
            </Button>
          </Section>

          <Text style={paragraph}>
            We’ll send you another quick update as soon as your box of joy leaves our warehouse. Until then,
          </Text>
          
          <Text style={footerText}>
            Happy Shopping<br />
            The Zeek Team 🧡
          </Text>
        </Container>
      </Body>
    </Html>
  )
}



const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', margin: '40px auto', maxWidth: '600px' };
const heading = { color: '#FF5A00', textAlign: 'center' as const, margin: '0 0 20px 0' };
const paragraph = { fontSize: '16px', color: '#333', lineHeight: '1.5' };
const infoSection = { margin: '20px 0' };
const infoText = { fontSize: '14px', color: '#555', margin: '4px 0' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const buttonContainer = { textAlign: 'center' as const, margin: '30px 0' };
const button = {
  backgroundColor: '#FF5A00',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 0',
};
const footerText = { fontSize: '16px', color: '#333', lineHeight: '1.5', marginTop: '20px' };

// export default OrderReceiptEmail;
