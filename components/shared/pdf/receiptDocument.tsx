import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptShippingAddress {
  name?: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface ReceiptData {
  orderId: string;
  orderDate: string;
  customerName: string;
  email: string;
  phone?: string;
  paymentMethod: string;
  items: ReceiptItem[];
  shippingCost: number;
  discountAmount: number;
  couponCode?: string | null;
  totalAmount: number;
  shippingAddress?: ReceiptShippingAddress;
}

const ORANGE = "#FF5A00";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#18181b",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },
  brandSub: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 8,
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  metaCol: { flexDirection: "column" },
  metaLabel: {
    fontSize: 8,
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 4,
  },
  table: { marginBottom: 16 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    paddingVertical: 6,
  },
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  th: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#71717a",
    textTransform: "uppercase",
  },
  td: { fontSize: 10 },
  totalsBox: { marginLeft: "auto", width: 220, marginBottom: 24 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: { fontSize: 10, color: "#52525b" },
  totalsValue: { fontSize: 10 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: ORANGE },
  addressBox: {
    backgroundColor: "#fafafa",
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    width: 260,
  },
  addressLine: { fontSize: 10, marginBottom: 2 },
  footer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 12,
    textAlign: "center",
  },
  footerText: { fontSize: 9, color: "#a1a1aa", marginBottom: 2 },
});

// "₦" is unreliable across PDF base fonts without registering a custom font,
// so receipts use "NGN" — keeps things crisp without extra font dependencies.
const formatCurrency = (value: number) =>
  `NGN ${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const paymentLabel =
    data.paymentMethod === "card"
      ? "Debit / Credit Card"
      : data.paymentMethod === "bank_transfer"
      ? "Bank Transfer"
      : data.paymentMethod;

  return (
    <Document title={`Zeek Receipt - ${data.orderId}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>zeek</Text>
            <Text style={styles.brandSub}>Order Receipt</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Order Number</Text>
            <Text style={styles.headerValue}>
              #{data.orderId.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={styles.headerLabel}>Date</Text>
            <Text style={styles.headerValue}>{data.orderDate}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Billed To</Text>
            <Text style={styles.metaValue}>{data.customerName}</Text>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{data.email}</Text>
            {data.phone && (
              <>
                <Text style={styles.metaLabel}>Phone</Text>
                <Text style={styles.metaValue}>{data.phone}</Text>
              </>
            )}
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>{paymentLabel}</Text>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: "#16a34a" }]}>Paid</Text>
          </View>
        </View>

        {/* Items table */}
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colItem]}>Item</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.td, styles.colItem]}>{item.name}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colPrice]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.td, styles.colTotal]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>
              {data.shippingCost > 0 ? formatCurrency(data.shippingCost) : "Free"}
            </Text>
          </View>
          {data.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Discount{data.couponCode ? ` (${data.couponCode})` : ""}
              </Text>
              <Text style={[styles.totalsValue, { color: "#16a34a" }]}>
                -{formatCurrency(data.discountAmount)}
              </Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Paid</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(data.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Shipping address */}
        {data.shippingAddress && (
          <>
            <Text style={styles.sectionTitle}>Delivering To</Text>
            <View style={styles.addressBox}>
              {data.shippingAddress.name && (
                <Text style={[styles.addressLine, { fontFamily: "Helvetica-Bold" }]}>
                  {data.shippingAddress.name}
                </Text>
              )}
              {data.shippingAddress.street && (
                <Text style={styles.addressLine}>{data.shippingAddress.street}</Text>
              )}
              {(data.shippingAddress.city || data.shippingAddress.state) && (
                <Text style={styles.addressLine}>
                  {[data.shippingAddress.city, data.shippingAddress.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              <Text style={styles.addressLine}>{data.shippingAddress.country}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for shopping with Zeek!</Text>
          <Text style={styles.footerText}>
            hello@zeek.you · +234 911 049 7316 · zeek.you
          </Text>
        </View>
      </Page>
    </Document>
  );
}