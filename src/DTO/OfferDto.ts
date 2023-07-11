export interface IRuleDto {
    conditions: IConditions;
    offer: IOfferDto;
}

export interface IConditions {
    priority: number,
    sku: string;
    operator: string;
    value: number;
}

export interface IOfferDto {
    offerType: string;
    discountType: string;
    value: number;
}