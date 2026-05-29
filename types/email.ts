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
  email: string;
  customerName: string;
  phone: string;
  paymentMethod: "card" | "bank_transfer" | "checkout";
  totalAmount: number;
  shippingCost: number;
  shippingVat: number;
  items: EmailOrderItem[];
  shippingAddress: EmailShippingAddress;
}