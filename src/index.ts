"use strict";
import CartService from "./Service/CartService";

const testCases = [
    ["wtch", "op11", "op11", "op11", "buds", "buds", "op11", "op11"],
    ["buds", "op10", "buds", "buds"],
    ["buds", "op10", "buds", "buds", "op11", "op11", "op11", "op11", "op11", "op11"],
]

testCases.forEach((testCase) => {
    const cart = new CartService();

    testCase?.forEach((item) => {
        console.log("Scanning Item: %s", item)
        cart.scan(item);
    })

    console.log("Final Cart Price: $%s", cart.calulateCart());
    console.log("=========================================================================================================");
})
