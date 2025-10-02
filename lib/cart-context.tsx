"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useReducer,
} from 'react';

import type { CartItem } from './types';

interface CartState {
	items: CartItem[];
	total: number;
}

type CartAction =
	| { type: "ADD_ITEM"; payload: CartItem }
	| { type: "REMOVE_ITEM"; payload: string }
	| { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
	| { type: "CLEAR_CART" };

interface CartContextType extends CartState {
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case "ADD_ITEM": {
			const newItems = [...state.items, action.payload];
			const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
			return { items: newItems, total: newTotal };
		}
		case "REMOVE_ITEM": {
			const newItems = state.items.filter((item) => item.id !== action.payload);
			const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
			return { items: newItems, total: newTotal };
		}
		case "UPDATE_QUANTITY": {
				const newItems = state.items.map((item) => {
					if (item.id !== action.payload.id) return item;
					// Recompute unit price from meal + selected add-ons (toppings, sides, beverages)
					const toppingsPrice = (item.toppings || []).reduce((s, t) => s + (t?.price || 0), 0);
					const sidesPrice = (item.sides || []).reduce((s, sd) => s + (sd?.price || 0), 0);
					const beveragesPrice = (item.beverages || []).reduce((s, b) => s + (b?.price || 0), 0);
					const unitPrice = (item.meal?.price || 0) + toppingsPrice + sidesPrice + beveragesPrice;
					const newQuantity = action.payload.quantity;
					return { ...item, quantity: newQuantity, totalPrice: unitPrice * newQuantity };
				});
				const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
				return { items: newItems, total: newTotal };
		}
		case "CLEAR_CART": {
			return { items: [], total: 0 };
		}
		default:
			return state;
	}
}

export function CartProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

	const addItem = (item: CartItem) => {
		dispatch({ type: "ADD_ITEM", payload: item });
	};

	const removeItem = (id: string) => {
		dispatch({ type: "REMOVE_ITEM", payload: id });
	};

	const updateQuantity = (id: string, quantity: number) => {
		if (quantity <= 0) {
			removeItem(id);
		} else {
			dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
		}
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
	};

	return (
		<CartContext.Provider
			value={{
				...state,
				addItem,
				removeItem,
				updateQuantity,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
