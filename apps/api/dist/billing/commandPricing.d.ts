export type Currency = 'NOK';
export type CommandPrice = {
    amount: number;
    currency: Currency;
};
export declare const COMMAND_PRICING: Record<string, CommandPrice>;
export declare const DEFAULT_PRICE: CommandPrice;
