// emails/AdminOrderNotificationEmail.tsx
import * as React from 'react';
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
  Section,
} from '@react-email/components';
import { OrderEmailPayload } from '@/types/email';

export const AdminOrderNotificationEmail = ({
  orderId,
  customerName,
  email,
  phone,
  paymentMethod,
  totalAmount,
  items,
  shippingAddress,
}: Omit<OrderEmailPayload, 'shippingCost' | 'shippingVat'>) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>🎉 New Order Received - #{orderId.slice(0, 8)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Order Alert</Heading>
          
          <Section style={metaSection}>
            <Text style={metaText}><strong>Order ID:</strong> {orderId}</Text>
            <Text style={metaText}><strong>Customer:</strong> {customerName} ({email})</Text>
            <Text style={metaText}><strong>Phone:</strong> {phone}</Text>
            <Text style={metaText}><strong>Payment Method:</strong> {paymentMethod.toUpperCase()}</Text>
          </Section>

          <Heading as="h3" style={subHeading}>Shipping Address</Heading>
          <Section style={addressSection}>
            <Text style={addressText}>{shippingAddress.street}</Text>
            <Text style={addressText}>{shippingAddress.city}, {shippingAddress.state}</Text>
            {shippingAddress.postalCode && <Text style={addressText}>{shippingAddress.postalCode}</Text>}
            <Text style={addressText}>{shippingAddress.country}</Text>
          </Section>

          <Hr style={hr} />

          <Heading as="h3" style={subHeading}>Items Ordered</Heading>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={{ width: '80%' }}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemMeta}>Quantity: {item.quantity}</Text>
              </Column>
              <Column style={{ width: '20%' }} align="right">
                <Text style={itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          <Row>
            <Column>
              <Text style={totalLabel}>Total Revenue</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>₦{totalAmount.toLocaleString()}</Text>
            </Column>
          </Row>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: '#f4f4f5', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', margin: '40px auto', maxWidth: '600px', border: '1px solid #e4e4e7' };
const heading = { color: '#18181b', fontSize: '24px', margin: '0 0 20px 0' };
const subHeading = { color: '#3f3f46', fontSize: '16px', margin: '20px 0 10px 0', borderBottom: '1px solid #f4f4f5', paddingBottom: '4px' };
const metaSection = { backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '6px', marginBottom: '20px' };
const metaText = { margin: '4px 0', fontSize: '14px', color: '#334155' };
const addressSection = { backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px', border: '1px solid #e4e4e7' };
const addressText = { margin: '2px 0', fontSize: '14px', color: '#52525b' };
const hr = { borderColor: '#e4e4e7', margin: '20px 0' };
const itemRow = { marginBottom: '10px' };
const itemName = { margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#18181b' };
const itemMeta = { margin: 0, color: '#71717a', fontSize: '12px' };
const itemPrice = { margin: 0, fontSize: '14px', color: '#18181b' };
const totalLabel = { margin: 0, fontWeight: 'bold', fontSize: '16px' };
const totalValue = { margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#16a34a' };

