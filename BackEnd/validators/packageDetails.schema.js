import Joi from "joi";

export const createPackageDetailsSchema = Joi.object({
  roomId: Joi.string().trim().required(),   // ⬅️ required to match Mongoose

  adultsIncluded: Joi.number().integer().min(1).default(2),

  perks: Joi.object({
    freeCancellationAnytime: Joi.boolean().default(false),
    noPrepaymentNeeded: Joi.boolean().default(false),
    noCreditCardNeeded: Joi.boolean().default(false)
  }).default(),

  meals: Joi.object({
    breakfastIncluded: Joi.boolean().default(false),
    lunchPriceUSD: Joi.number().min(0).default(0),
    dinnerPriceUSD: Joi.number().min(0).default(0)
  }).default(),

  geniusDiscountPercent: Joi.number().min(0).max(100).default(0),
  geniusFreeBreakfast: Joi.boolean().default(false),

  ribbons: Joi.array().items(Joi.string()).default([]),

  wasPriceUSD: Joi.number().min(0).default(0),
  priceUSD: Joi.number().min(0).required(),
  taxesAndChargesUSD: Joi.number().min(0).default(0),

  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isActive: Joi.boolean().default(true)
});

export const updatePackageDetailsSchema = createPackageDetailsSchema.fork(
  ["priceUSD", "roomId"], (s) => s.optional() // allow partial updates
);
