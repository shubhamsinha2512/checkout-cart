import SKUs from "../database/SKU_DATA.json"
import RULES from "../database/rules.json"
import { ICartItems as ICartItem } from "../DTO/CartItemsDto";
import { ISKU } from "../DTO/SKUDto";
import { IConditions, IOfferDto, IRuleDto } from "../DTO/OfferDto";

export default class Cart {

    private items: ICartItem[] = [] as ICartItem[];

    public scan(scannedUnitCode: string): boolean {
        if (this.validateSKU(scannedUnitCode)) {

            const itemIndexInCart: number = this.items?.findIndex((cartItem: ICartItem) => cartItem.sku === scannedUnitCode);

            if (itemIndexInCart === -1) {
                this.items[itemIndexInCart].sku = scannedUnitCode;
                this.items[itemIndexInCart].count = 1;
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

        let cartPrice: number = 0;

        cartItems?.forEach((cartItem: ICartItem) => {
            const offer: IOfferDto = this.findBestMatchingOffer(cartItem);
            const price: number = this.calculateCartItemPrice(cartItem, offer);

            cartPrice += price;
        })

        return cartPrice;
    }

    private validateSKU(scannedUnitCode: string) {
        const foundSKU: ISKU = SKUs?.find((sku: ISKU) => sku.sku === scannedUnitCode) as ISKU;
        if (foundSKU) return true;

        return false;
    }

    private findBestMatchingOffer(cartItem: ICartItem): IOfferDto {
        const possibleRules: IRuleDto[] = RULES?.filter((rule: IRuleDto) => rule.conditions.sku === cartItem.sku); //Find all matching rule for a SKU
        let applicableOffer: IOfferDto = {} as IOfferDto;
        let hightestPriority = 0; //If multiple rules found, to pick highest priority offer

        possibleRules.forEach((rule: IRuleDto) => {
            const conditions: IConditions = rule.conditions;

            if (conditions.operator === "eq") {
                if (conditions.priority > hightestPriority) {
                    if (conditions.value === cartItem.count) {
                        applicableOffer = rule.offer;
                    }
                }
            }

            if (conditions.operator === "gte") {
                if (conditions.priority > hightestPriority) {
                    if (conditions.value >= cartItem.count) {
                        applicableOffer = rule.offer;
                    }
                }
            }
        })

        return applicableOffer;
    }

    private calculateCartItemPrice(cartItem: ICartItem, offer: IOfferDto): number {
        let cartItemPrice: number = 0;
        const skuDetails: ISKU = SKUs?.find((sku: ISKU) => sku.sku === cartItem.sku) as ISKU;

        if (offer) {
            if (offer.offerType === "price-discount") {
                cartItemPrice = cartItem.count * offer.value;
            }

            if (offer.offerType === "unit-discount") {
                cartItemPrice = skuDetails.price * (cartItem.count - offer.value);
            }
        } else {

        }

        return cartItemPrice;
    }
}