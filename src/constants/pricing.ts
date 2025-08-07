export const SELF_PAY_DISCOUNTS = {
  'office_visit': 0.6,        // 40% off
  'lab_work': 0.5,           // 50% off  
  'imaging': 0.7,            // 30% off
  'procedure': 0.65,         // 35% off
  'consultation': 0.6,       // 40% off
  'default': 0.65            // 35% off default
} as const;

export function calculateDiscountedAmount(originalAmount: number, serviceCode: string): number {
  const discount = SELF_PAY_DISCOUNTS[serviceCode as keyof typeof SELF_PAY_DISCOUNTS] || SELF_PAY_DISCOUNTS.default;
  return Math.round(originalAmount * discount * 100) / 100; // Round to 2 decimal places
}