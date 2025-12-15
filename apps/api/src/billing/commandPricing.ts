export type Currency = 'NOK';

export type CommandPrice = {
  amount: number; // en cents (ex: 100 = 1 NOK)
  currency: Currency;
};

export const COMMAND_PRICING: Record<string, CommandPrice> = {
  createTask: { amount: 100, currency: 'NOK' },
  generateImage: { amount: 200, currency: 'NOK' },
  summarizePdf: { amount: 150, currency: 'NOK' }
};

// fallback sécurité
export const DEFAULT_PRICE: CommandPrice = {
  amount: 100,
  currency: 'NOK'
};
