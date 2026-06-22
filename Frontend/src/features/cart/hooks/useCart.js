import { useDispatch, useSelector } from "react-redux";
import { addItem, createBuyNowOrderApi, createCartOrder, decrementCartItemApi, getCart, incrementCartItemApi, removeItemApi, verifyCartOrder } from "../service/cart.api.js";
import { addItem as addItemToCart, decrementCartItem, increamentCartItem, removeItem, setItems, setLoading } from "../state/cart.slice.js";


export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        dispatch(setLoading(true));
        try {
            const data = await addItem({ productId, variantId });
            return data;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetCart() {
        dispatch(setLoading(true));
        try {
            const data = await getCart();
            dispatch(setItems(data.cart));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleIncrementItem({ productId, variantId }) {

        // Optimistic UI update
        dispatch(increamentCartItem({ productId, variantId }));

        try {

            // API request
            await incrementCartItemApi({ productId, variantId });

        } catch (error) {

            console.error("Failed to update cart on server", error);

            // Revert optimistic update
            dispatch(decrementCartItem({ productId, variantId }));

            // Show error message
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error("Failed to increase quantity");
            }
        }
    }

    async function handleDecrementItem({ productId, variantId }) {


        // Optimistic UI Update: Update Redux immediately so the UI feels instant!
        dispatch(decrementCartItem({ productId, variantId }));

        try {
            // Then fire the API call in the background
            await decrementCartItemApi({ productId, variantId });
        } catch (error) {
            console.error("Failed to update cart on server", error);
            // If it fails, revert the change here
            dispatch(increamentCartItem({ productId, variantId }));
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error("Failed to decrease quantity");
            }
        }
    }

    async function handleRemoveItem({ productId, variantId }) {
        // Optimistic UI Update: Update Redux immediately so the UI feels instant!
        dispatch(removeItem({ productId, variantId }));

        try {
            // Then fire the API call in the background
            await removeItemApi({ productId, variantId });
        } catch (error) {
            console.error("Failed to update cart on server", error);
            // If it fails, you would ideally revert the change here

        }
    }

    async function handleCreateOrder(){
        dispatch(setLoading(true));
        try {
            const data = await createCartOrder();
            return data;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleCreateBuyNowOrder({ productId, variantId, quantity }) {
        dispatch(setLoading(true));
        try {
            const data = await createBuyNowOrderApi({ productId, variantId, quantity });
            return data;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleVerifyOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}){
        dispatch(setLoading(true));
        try {
            const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature});
            return data.success;
        } finally {
            dispatch(setLoading(false));
        }
    }


    return {
        handleAddItem,
        handleGetCart,
        handleIncrementItem,
        handleDecrementItem,
        handleRemoveItem,
        handleCreateOrder,
        handleCreateBuyNowOrder,
        handleVerifyOrder
    }

}


