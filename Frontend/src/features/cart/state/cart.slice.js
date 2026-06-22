import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name:"cart",
    initialState:{
        totalPrice:null,
        currency:null,
        items:[],
        loading:false
    },
    reducers:{
        setItems:(state,action)=>{
            state.totalPrice = action.payload.totalPrice;
            state.currency = action.payload.currency;
            state.items = action.payload.items;
        },
        addItem:(state,action)=>{
            state.items.push(action.payload)
        },
        increamentCartItem:(state,action)=>{
            const {productId,variantId} = action.payload;

            state.items = state.items.map(item=>{
                if(item.product._id === productId && item.variant === variantId){
                    const matchedVariant = Array.isArray(item.product?.variants) ? item.product?.variants?.find(v => v._id === item.variant) : item.product?.variants;
                    const variantPrice = matchedVariant?.price?.amount || item.price.amount;
                    state.totalPrice += variantPrice;
                    return {
                        ...item,
                        quantity:item.quantity+1
                    }
                }
                return item;
            })
        },
        decrementCartItem:(state,action)=>{
            const {productId,variantId} = action.payload;

            state.items = state.items.map(item=>{
                if(item.product._id === productId && item.variant === variantId){
                    const matchedVariant = Array.isArray(item.product?.variants) ? item.product?.variants?.find(v => v._id === item.variant) : item.product?.variants;
                    const variantPrice = matchedVariant?.price?.amount || item.price.amount;
                    state.totalPrice -= variantPrice;
                    return {
                        ...item,
                        quantity:item.quantity-1
                    }
                }
                return item;
            })
        },
        removeItem: (state, action) => {

            const { productId, variantId } = action.payload;

            const itemToRemove = state.items.find(item => item.product._id === productId && item.variant?.toString() === variantId);
            if (itemToRemove) {
                const matchedVariant = Array.isArray(itemToRemove.product?.variants) ? itemToRemove.product?.variants?.find(v => v._id === itemToRemove.variant) : itemToRemove.product?.variants;
                const variantPrice = matchedVariant?.price?.amount || itemToRemove.price.amount;
                state.totalPrice -= (variantPrice * itemToRemove.quantity);
            }

            state.items = state.items.filter(
                item =>
                    !(
                        item.product._id === productId &&
                        item.variant?.toString() === variantId
                    )
            );
        },
        setLoading:(state,action)=>{
            state.loading = action.payload;
        }


    }
});


export const {setItems,addItem,increamentCartItem,decrementCartItem,removeItem,setLoading} = cartSlice.actions;
export default cartSlice.reducer;

