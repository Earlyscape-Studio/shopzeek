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
  Row,
  Column,
} from "@react-email/components";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  name?: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

interface OrderReceiptProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderDetailUrl: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  shippingCost?: number;
  discountAmount?: number;
  couponCode?: string | null;
}

export const OrderReceiptEmail = ({
  customerName,
  orderId,
  orderDate,
  totalAmount,
  orderDetailUrl,
  items = [],
  shippingAddress,
  paymentMethod,
  shippingCost = 0,
  discountAmount = 0,
  couponCode,
}: OrderReceiptProps) => {
  const subtotal = totalAmount - shippingCost + discountAmount;

  const paymentLabel =
    paymentMethod === "card"
      ? "Debit / Credit Card"
      : paymentMethod === "bank_transfer"
      ? "Bank Transfer"
      : paymentMethod ?? "Online Payment";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Cha-ching! Your order is confirmed 🛍️</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Heading style={heading}>zeek</Heading>
          <Text style={subheader}>Order Confirmation</Text>

          <Text style={paragraph}>
            You did it, {customerName}!
          </Text>
          <Text style={paragraph}>
            Your payment went through and your order is confirmed. Our team is already
            getting your items ready for delivery.
          </Text>

          {/* Order meta */}
          <Section style={metaBox}>
            <Row>
              <Column style={{ width: "50%" }}>
                <Text style={metaLabel}>Order Number</Text>
                <Text style={metaValue}>#{orderId.slice(0, 8).toUpperCase()}</Text>
              </Column>
              <Column style={{ width: "50%" }}>
                <Text style={metaLabel}>Order Date</Text>
                <Text style={metaValue}>{orderDate}</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: "12px" }}>
              <Column style={{ width: "50%" }}>
                <Text style={metaLabel}>Payment Method</Text>
                <Text style={metaValue}>{paymentLabel}</Text>
              </Column>
              <Column style={{ width: "50%" }}>
                <Text style={metaLabel}>Status</Text>
                <Text style={{ ...metaValue, color: "#16a34a" }}>Paid ✓</Text>
              </Column>
            </Row>
          </Section>

          {/* Items */}
          {items.length > 0 && (
            <>
              <Hr style={hr} />
              <Text style={sectionTitle}>Items Ordered</Text>
              {items.map((item, i) => (
                <Row key={i} style={itemRow}>
                  <Column style={{ flex: 1 }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQty}>Qty: {item.quantity}</Text>
                  </Column>
                  <Column align="right" style={{ whiteSpace: "nowrap" as const }}>
                    <Text style={itemPrice}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </Column>
                </Row>
              ))}
            </>
          )}

          {/* Totals */}
          <Hr style={hr} />
          <Section style={totalsBox}>
            {items.length > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Subtotal</Text></Column>
                <Column align="right">
                  <Text style={totalValue}>₦{subtotal.toLocaleString()}</Text>
                </Column>
              </Row>
            )}
            {shippingCost > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Shipping</Text></Column>
                <Column align="right">
                  <Text style={totalValue}>₦{shippingCost.toLocaleString()}</Text>
                </Column>
              </Row>
            )}
            {discountAmount > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>
                    Discount{couponCode ? ` (${couponCode})` : ""}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ ...totalValue, color: "#16a34a" }}>
                    -₦{discountAmount.toLocaleString()}
                  </Text>
                </Column>
              </Row>
            )}
            <Row style={{ ...totalRow, borderTop: "2px solid #e4e4e7", paddingTop: "10px", marginTop: "6px" }}>
              <Column>
                <Text style={{ ...totalLabel, fontWeight: "bold", fontSize: "16px", color: "#18181b" }}>
                  Total Paid
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ ...totalValue, fontWeight: "bold", fontSize: "18px", color: "#FF5A00" }}>
                  ₦{totalAmount.toLocaleString()}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping address */}
          {shippingAddress && (
            <>
              <Hr style={hr} />
              <Text style={sectionTitle}>Delivering To</Text>
              <Section style={addressBox}>
                {shippingAddress.name && (
                  <Text style={addressLine}><strong>{shippingAddress.name}</strong></Text>
                )}
                {shippingAddress.street && (
                  <Text style={addressLine}>{shippingAddress.street}</Text>
                )}
                {(shippingAddress.city || shippingAddress.state) && (
                  <Text style={addressLine}>
                    {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ")}
                  </Text>
                )}
                <Text style={addressLine}>{shippingAddress.country}</Text>
              </Section>
            </>
          )}

          <Hr style={hr} />

          {/* CTA */}
          <Text style={paragraph}>
            We&apos;ll send you another update as soon as your order ships.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={orderDetailUrl}>
              VIEW ORDER DETAILS
            </Button>
          </Section>

          <Text style={footerText}>
            Happy Shopping 🛍️<br />
            <strong>The Zeek Team 🧡</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif", padding: "10px 0" };
const container = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "600px", border: "1px solid #e6ebf1" };
const heading = { color: "#FF5A00", textAlign: "center" as const, margin: "0 0 4px 0", fontSize: "28px", fontWeight: "bold" };
const subheader = { color: "#52525b", textAlign: "center" as const, margin: "0 0 24px 0", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" as const };
const paragraph = { fontSize: "15px", color: "#333", lineHeight: "1.5", margin: "12px 0" };
const metaBox = { backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "6px", margin: "20px 0" };
const metaLabel = { fontSize: "11px", fontWeight: "bold" as const, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 2px 0" };
const metaValue = { fontSize: "14px", color: "#18181b", fontWeight: "600" as const, margin: 0 };
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const sectionTitle = { fontSize: "15px", fontWeight: "bold" as const, color: "#18181b", margin: "0 0 12px 0" };
const itemRow = { marginBottom: "10px" };
const itemName = { margin: 0, fontSize: "14px", color: "#18181b", fontWeight: "500" as const };
const itemQty = { margin: 0, fontSize: "12px", color: "#71717a" };
const itemPrice = { margin: 0, fontSize: "14px", color: "#18181b", fontWeight: "600" as const };
const totalsBox = { margin: "0" };
const totalRow = { marginBottom: "6px" };
const totalLabel = { margin: 0, fontSize: "14px", color: "#52525b" };
const totalValue = { margin: 0, fontSize: "14px", color: "#18181b" };
const addressBox = { backgroundColor: "#fafafa", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e4e4e7" };
const addressLine = { margin: "2px 0", fontSize: "14px", color: "#18181b" };
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
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
const footerText = { fontSize: "15px", color: "#333", lineHeight: "1.6", marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" };