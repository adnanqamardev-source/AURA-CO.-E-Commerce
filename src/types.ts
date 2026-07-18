export interface CartItem {
  id: string; // unique cart item id (product_id + chosen_option)
  productId: string;
  name: string;
  price: number;
  image: string;
  optionName?: string;
  selectedOption?: string;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingDetails: ShippingDetails;
  status: "Processing" | "Shipped" | "Delivered";
  trackingNumber: string;
  utr?: string;
  paymentMethod?: "Cash on Delivery" | "UPI" | "Razorpay";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
