"use strict";
import CartService from "./Service/CartService.js"

const cartItems = ["buds", "op10", "buds", "buds"];
const cart = new CartService.Cart();

cartItems?.forEach((item) => {
    cart.scan(item);
})

console.log(cart.calulateCart());