export type UserRole = 'admin' | 'seller' | 'developer';

export interface Category {
    _id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface ColorVariant {
    _id?: string;
    color: string;
    amount: number;
    priceCost: number;
    priceSell: number;
}

export interface Product {
    _id: string;
    name: string;
    category: string | Category;
    variants: ColorVariant[];
    minStockAlert: number;
    isActive: boolean;
    image: {
        url: string;
        public_id: string;
    };
    totalProfit?: number;
}

export interface SaleItem {
    productId: string;
    variantId: string;
    name: string;
    quantity: number;
    priceAtSale: number;
}

export interface Sale {
    id: string;
    items: SaleItem[];
    totalAmount: number;
    comment?: string;
    createdAt: string;
}