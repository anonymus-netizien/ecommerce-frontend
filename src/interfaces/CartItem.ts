import type {Product} from "./Product.ts";

export interface CartItem extends Product {
    quantity: number;
}