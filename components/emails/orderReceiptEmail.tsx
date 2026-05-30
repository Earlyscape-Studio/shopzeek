import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Text,
} from '@react-email/components';
import { EmailOrderItem } from '@/types/email';


interface OrderReceiptProps {
  customerName: string
  orderId: string
  totalAmount: number
  items: EmailOrderItem[]
}


export const OrderReceiptEmail = ({
  customerName,
  orderId,
  totalAmount,
  items
}: OrderReceiptProps) => {

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your ShopZeek Order Receipt</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>ShopZeek</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for your order! We are currently processing it. Here are your order details:
          </Text>
          <Text style={subBlock}>
            Order ID: <strong>{orderId}</strong>
          </Text>

          <Hr style={hr} />

          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={{ width: '75%' }}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemMeta}>Qty: {item.quantity}</Text>
              </Column>
              <Column style={{ width: '25%' }} align="right">
                <Text style={itemPrice}>
                  ₦{(item.price * item.quantity).toLocaleString()}
                </Text>
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          <Row>
            <Column>
              <Text style={totalLabel}>Total Paid</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>₦{totalAmount.toLocaleString()}</Text>
            </Column>
          </Row>
        </Container>
      </Body>
    </Html>
  )
}



const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', margin: '40px auto', maxWidth: '600px' };
const heading = { color: '#FF5A00', textAlign: 'center' as const, margin: '0 0 20px 0' };
const paragraph = { fontSize: '16px', color: '#333', lineHeight: '1.5' };
const subBlock = { fontSize: '14px', color: '#555' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const itemRow = { marginBottom: '12px' };
const itemName = { margin: 0, fontWeight: 'bold', fontSize: '14px' };
const itemMeta = { margin: 0, color: '#666', fontSize: '12px' };
const itemPrice = { margin: 0, fontSize: '14px' };
const totalLabel = { margin: 0, fontWeight: 'bold', fontSize: '16px' };
const totalValue = { margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#FF5A00' };

// export default OrderReceiptEmail;