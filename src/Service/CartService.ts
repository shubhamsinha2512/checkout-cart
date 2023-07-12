import SKUs from "../database/SKU_DATA.json"
import RULES from "../database/rules.json"
import { ICartItems as ICartItem } from "../DTO/CartItemsDto";
import { ISKU } from "../DTO/SKUDto.js";
import { IConditions, IOfferDto, IRuleDto } from "../DTO/OfferDto";
import { isEmpty } from "../utils/utils"

export default class CartService {

    private items: ICartItem[] = [] as ICartItem[];

    public scan(scannedUnitCode: string): boolean {
        if (this.validateSKU(scannedUnitCode)) {

            const itemIndexInCart: number = this.items?.findIndex((cartItem: ICartItem) => cartItem.sku === scannedUnitCode);

            if (itemIndexInCart === -1) {
                this.items.push({
                    sku: scannedUnitCode,
                    count: 1
                })
            } else {
                this.items[itemIndexInCart].count += 1;
            }

            return true;
        }

        return false;
    }

    public calulateCart(): number {
        return this.calculateCartPrice(this.items);
    }

    private calculateCartPrice(cartItems: ICartItem[]) {
        console.log("calculateCartPrice", cartItems)
        let cartPrice: number = 0;

        cartItems?.forEach((cartItem: ICartItem) => {
            console.log("cart item::", cartItem)
            const rule: IRuleDto = this.findBestMatchingOffer(cartItem);
            const price: number = this.calculateCartItemPrice(cartItem, rule);

            cartPrice += price;
        })

        return cartPrice;
    }

    private validateSKU(scannedUnitCode: string) {
        const foundSKU: ISKU = SKUs?.find((sku: ISKU) => sku.sku === scannedUnitCode) as ISKU;
        if (!isEmpty(foundSKU)) return true;

        return false;
    }

    private findBestMatchingOffer(cartItem: ICartItem): IRuleDto {
        const possibleRules: IRuleDto[] = RULES?.filter((rule: IRuleDto) => rule.conditions.sku === cartItem.sku); //Find all matching rule for a SKU
        let applicableRule: IRuleDto = {} as IRuleDto;
        let hightestPriority = 0; //If multiple rules found, to pick highest priority offer

        console.log("Finding Best Matching Offer For: %o", cartItem)
        console.log("Possible Applicable Rules:", possibleRules)

        possibleRules.forEach((rule: IRuleDto) => {
            const conditions: IConditions = rule.conditions;
            if (conditions.operator == "eq") {
                if (conditions.priority > hightestPriority) {
                    if (conditions.value === cartItem.count) {
                        applicableRule = rule;
                    }
                }
            }

            if (conditions.operator == "gte") {
                if (conditions.priority > hightestPriority) {
                    if (conditions.value <= cartItem.count) {
                        applicableRule = rule;
                    }
                }
            }
        })
        console.log("Best Matching Found Rule: %o", applicableRule)
        return applicableRule;
    }

    private calculateCartItemPrice(cartItem: ICartItem, rule: IRuleDto): number {
        let cartItemPrice: number = 0;
        const skuDetails: ISKU = SKUs?.find((sku: ISKU) => sku.sku === cartItem.sku) as ISKU;
        const offer: IOfferDto = rule?.offer;

        console.log("Calculating Cart Price...")
        console.log("Cart Item: %o ,Offer: %o", cartItem, offer)

        if (!isEmpty(offer)) {
            if (offer.offerType === "price-discount") {
                cartItemPrice = cartItem.count * offer.value;
            }

            if (offer.offerType === "unit-discount") {
                const billableUnits = (cartItem.count - (cartItem.count / rule.conditions.value)) + (cartItem.count % rule.conditions.value);
                console.log("Billable Units: %s", billableUnits)
                cartItemPrice = skuDetails.price * billableUnits;
            }
        } else {
            cartItemPrice = skuDetails.price * cartItem.count;
        }

        console.log("Calculated Item Price: $%s", cartItemPrice)
        return parseFloat(cartItemPrice.toFixed(2));
    }
}