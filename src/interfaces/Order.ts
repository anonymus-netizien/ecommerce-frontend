import type { CartItem } from "./CartItem";

export interface Order {
    orderNumber: number;
    customerName: string;
    mobile: string;
    email: string;
    address: string;
    paymentMode: string;
    grandTotal: number;
    discount: number;
    finalAmount: number;
    orderDate: string;
    status: string;
    items: CartItem[];
}
