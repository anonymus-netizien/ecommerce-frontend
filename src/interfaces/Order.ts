export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    email: string;
    paymentMethod: string;
    shippingMethod: string;
    createdAt: string;
}
