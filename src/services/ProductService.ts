import type { Product } from "../interfaces/Product";

interface DummyJSONProduct {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    thumbnail: string;
    images: string[];
    rating: {
        rate: number;
        count: number;
    };
}

const API_URL = "https://dummyjson.com/products";

// ponytail: fetch all pages in parallel, dedupe by id (DummyJSON shares some IDs across categories)
function mapToProduct(item: DummyJSONProduct): Product {
    return {
        id: item.id,
        name: item.title,
        price: item.price,
        description: item.description,
        imageUrl: item.thumbnail || item.images?.[0] || "",
        category: item.category,
        rating: item.rating,
    };
}

export async function fetchProducts(): Promise<Product[]> {
    // Fetch 194 products in batches to cover all categories
    const [res1, res2] = await Promise.all([
        fetch(`${API_URL}?limit=100&skip=0&select=id,title,price,description,category,thumbnail,images,rating`),
        fetch(`${API_URL}?limit=100&skip=100&select=id,title,price,description,category,thumbnail,images,rating`),
    ]);

    if (!res1.ok || !res2.ok) throw new Error("Failed to fetch products");

    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    const all: DummyJSONProduct[] = [...data1.products, ...data2.products];

    // Dedupe by id
    const seen = new Set<number>();
    return all.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    }).map(mapToProduct);
}
