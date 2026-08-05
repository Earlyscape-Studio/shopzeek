export interface EmailOrderItem {
    name: string
    quantity: number
    price: number
}

export interface EmailShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface OrderEmailPayload {
  orderId: string;
  orderDate: string;
  orderDetailUrl: string;
  email: string;
  customerName: string;
  phone: string;
  paymentMethod: "card" | "bank_transfer" | "checkout" | "globalpay";
  totalAmount: number;
  shippingCost: number;
  shippingVat: number;
  discountAmount: number;
  couponCode?: string | null;
  items: EmailOrderItem[];
  shippingAddress: EmailShippingAddress;
}

export interface DeliveryEmailPayload {
  customerName: string;
  email: string;
  estimatedDeliveryDate: string;
  trackingUrl: string;
}

export interface AbandonedCartEmailPayload {
  customerName: string;
  email: string;
  items: { name: string }[];
  cartUrl: string;
}