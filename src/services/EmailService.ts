import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

// ponytail: init once at module level
if (PUBLIC_KEY) {
    emailjs.init({ publicKey: PUBLIC_KEY });
}

export interface OrderEmailItem {
    image_url: string;
    name: string;
    units: number;
    price: string;
}

export interface OrderEmailParams {
    order_id: string;
    orders: OrderEmailItem[];
    cost: {
        shipping: string;
        tax: string;
        total: string;
    };
    coupon: string;
    email: string;
}

export async function sendOrderConfirmation(params: any): Promise<boolean> {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn("EmailJS not configured — skipping email. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env");
        return false;
    }
    try {
        const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
        console.log("Order email sent:", res.status);
        return true;
    } catch (err) {
        console.error("Failed to send order email:", err);
        return false;
    }
}
