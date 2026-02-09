export type UserRole = 'admin' | 'seller' | 'developer';

export interface Category {
    _id: string;
    name: string;
}

export interface Color {
    _id: string;
    name: string;
    hex: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface ColorVariant {
    _id?: string;
    color: string | Color;
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

export interface ProductFormValues {
    name: string;
    category: string;
    minStockAlert: number;
    variants: (Omit<ColorVariant, 'color'> & { color: string })[]; 
    image: FileList | null;
}