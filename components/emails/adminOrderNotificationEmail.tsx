import * as React from "react";
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
  Button,
} from "@react-email/components";
import { OrderEmailPayload } from "@/types/email";

export const AdminOrderNotificationEmail = ({
  orderId,
  customerName,
  email,
  phone,
  paymentMethod,
  totalAmount,
  items,
  shippingAddress,
  discountAmount,
  couponCode,
}: Omit<OrderEmailPayload, "shippingCost" | "shippingVat" | "orderDate" | "orderDetailUrl">) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>🎉 New Order — {customerName} · ₦{totalAmount.toLocaleString()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Order Alert 🎉</Heading>

          {/* Customer meta */}
          <Section style={metaSection}>
            <Text style={metaText}><strong>Order ID:</strong> {orderId}</Text>
            <Text style={metaText}><strong>Customer:</strong> {customerName}</Text>
            <Text style={metaText}><strong>Email:</strong> {email}</Text>
            <Text style={metaText}><strong>Phone:</strong> {phone || "—"}</Text>
            <Text style={metaText}><strong>Payment:</strong> {paymentMethod.replace("_", " ").toUpperCase()}</Text>
            {couponCode && discountAmount > 0 && (
              <Text style={metaText}>
                <strong>Coupon:</strong> {couponCode} (₦{discountAmount.toLocaleString()} off)
              </Text>
            )}
          </Section>

          {/* Shipping address */}
          <Heading as="h3" style={subHeading}>Shipping Address</Heading>
          <Section style={addressSection}>
            {customerName && (
              <Text style={{ ...addressText, fontWeight: "bold", color: "#18181b" }}>
                {customerName}
              </Text>
            )}
            {shippingAddress.street && (
              <Text style={addressText}>{shippingAddress.street}</Text>
            )}
            {(shippingAddress.city || shippingAddress.state) && (
              <Text style={addressText}>
                {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ")}
              </Text>
            )}
            {shippingAddress.postalCode && (
              <Text style={addressText}>{shippingAddress.postalCode}</Text>
            )}
            <Text style={addressText}>{shippingAddress.country}</Text>
          </Section>

          <Hr style={hr} />

          {/* Items */}
          <Heading as="h3" style={subHeading}>Items Ordered</Heading>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={{ width: "80%" }}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemMeta}>Qty: {item.quantity} × ₦{item.price.toLocaleString()}</Text>
              </Column>
              <Column style={{ width: "20%" }} align="right">
                <Text style={itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          {/* Totals */}
          {discountAmount > 0 && (
            <Row style={{ marginBottom: "8px" }}>
              <Column>
                <Text style={{ ...totalLabel, color: "#16a34a" }}>Discount Applied</Text>
              </Column>
              <Column align="right">
                <Text style={{ ...totalValue, color: "#16a34a" }}>-₦{discountAmount.toLocaleString()}</Text>
              </Column>
            </Row>
          )}
          <Row>
            <Column>
              <Text style={totalLabel}>Total Revenue</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>₦{totalAmount.toLocaleString()}</Text>
            </Column>
          </Row>

          <Hr style={hr} />

          {/* Admin CTA */}
          <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders`}
              style={button}
            >
              VIEW IN ADMIN PANEL
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: "#f4f4f5", fontFamily: "sans-serif" };
const container = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "600px", border: "1px solid #e4e4e7" };
const heading = { color: "#18181b", fontSize: "24px", margin: "0 0 20px 0" };
const subHeading = { color: "#3f3f46", fontSize: "16px", margin: "20px 0 10px 0", borderBottom: "1px solid #f4f4f5", paddingBottom: "4px" };
const metaSection = { backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "6px", marginBottom: "20px" };
const metaText = { margin: "4px 0", fontSize: "14px", color: "#334155" };
const addressSection = { backgroundColor: "#fafafa", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e4e4e7" };
const addressText = { margin: "3px 0", fontSize: "14px", color: "#52525b" };
const hr = { borderColor: "#e4e4e7", margin: "20px 0" };
const itemRow = { marginBottom: "10px" };
const itemName = { margin: 0, fontWeight: "bold" as const, fontSize: "14px", color: "#18181b" };
const itemMeta = { margin: 0, color: "#71717a", fontSize: "12px" };
const itemPrice = { margin: 0, fontSize: "14px", color: "#18181b", fontWeight: "600" as const };
const totalLabel = { margin: 0, fontWeight: "bold" as const, fontSize: "16px" };
const totalValue = { margin: 0, fontWeight: "bold" as const, fontSize: "16px", color: "#16a34a" };
const button = {
  backgroundColor: "#FF5A00",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block" as const,
  width: "100%",
  padding: "14px 0",
};