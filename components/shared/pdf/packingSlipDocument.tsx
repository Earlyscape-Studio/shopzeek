import {Document, Page, View, Text, StyleSheet} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2 solid #111111",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  orderRef: {
    fontSize: 10,
    color: "#555555",
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    border: "1 solid #111111",
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#777777",
    marginBottom: 4,
  },
  addressBlock: {
    border: "1 solid #111111",
    borderRadius: 4,
    padding: 14,
    marginBottom: 18,
  },
  addressName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  phoneRow: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  itemsHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #111111",
    paddingBottom: 4,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #dddddd",
    paddingVertical: 6,
  },
  colName: { flex: 1 },
  colQty: { width: 50, textAlign: "center" },
  colPrice: { width: 90, textAlign: "right" },
  totalsBlock: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #111111",
    marginTop: 4,
    paddingTop: 6,
  },
  totalLabelFinal: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  totalValueFinal: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    borderTop: "0.5 solid #dddddd",
    paddingTop: 8,
  },
});




export interface PackingSlipItem{
    name: string
    quantity: number
    unitPrice: number
}

export interface PackingSlipData {
  orderId: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  addressLines: string[];
  items: PackingSlipItem[];
  subtotal: number;
  shippingTotal: number;
  discountAmount: number;
  couponCode: string | null;
  totalAmount: number;
  trackingUrl: string | null;
  paymentReference: string | null;
}

function formatNaira(value: number): string {
  return `NGN ${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function PackingSlipDocument({ data }: { data: PackingSlipData }) {
  const shortRef = data.orderId.split("-")[0].toUpperCase();
 
  return (
    <Document title={`Packing Slip - ${shortRef}`}>
      <Page size="A5" style={styles.page}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Zeek</Text>
            <Text style={styles.orderRef}>Order {shortRef}</Text>
            <Text style={styles.orderRef}>
              {new Date(data.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <Text style={styles.statusBadge}>{data.status}</Text>
        </View>
 
        
        <Text style={styles.sectionTitle}>Deliver To</Text>
        <View style={styles.addressBlock}>
          <Text style={styles.addressName}>{data.customerName || "Customer"}</Text>
          {data.addressLines.map((line, i) => (
            <Text key={i} style={styles.addressLine}>
              {line}
            </Text>
          ))}
          <Text style={styles.phoneRow}>{data.customerPhone || "No phone on file"}</Text>
        </View>
 
    
        <Text style={styles.sectionTitle}>Items in this package</Text>
        <View style={styles.itemsHeader}>
          <Text style={[styles.colName, { fontFamily: "Helvetica-Bold", fontSize: 9 }]}>
            ITEM
          </Text>
          <Text style={[styles.colQty, { fontFamily: "Helvetica-Bold", fontSize: 9 }]}>
            QTY
          </Text>
          <Text style={[styles.colPrice, { fontFamily: "Helvetica-Bold", fontSize: 9 }]}>
            AMOUNT
          </Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {formatNaira(item.unitPrice * item.quantity)}
            </Text>
          </View>
        ))}
 
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatNaira(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Shipping</Text>
            <Text>{data.shippingTotal > 0 ? formatNaira(data.shippingTotal) : "Free"}</Text>
          </View>
          {data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount{data.couponCode ? ` (${data.couponCode})` : ""}</Text>
              <Text>-{formatNaira(data.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{formatNaira(data.totalAmount)}</Text>
          </View>
        </View>
 
     
        <Text style={styles.footer}>
          {data.paymentReference ? `Payment ref: ${data.paymentReference}  |  ` : ""}
          Order ID: {data.orderId}
        </Text>
      </Page>
    </Document>
  );
}