export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    category?: string;
    rating?: {
        rate: number;
        count: number;
    };
}

export interface CartItems extends Product {
    quantity: number;
}