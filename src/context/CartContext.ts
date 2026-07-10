import {createContext} from "react";
import type {CartItem} from "../interfaces/CartItem";
import type {Product} from "../interfaces/Product";

export interface CartContextType {
    cart: CartItem[];

    addToCart: (product: Product) => void;

    removeFromCart: (id: number) => void;

    increaseQuantity: (id: number) => void;

    decreaseQuantity: (id: number) => void;

    clearCart: () => void;
}

export const CartContext = createContext<CartContextType>(null!);