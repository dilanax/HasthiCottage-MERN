import Joi from "joi";

const extras = {
  reservationNumber: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  userEmail: Joi.string().email().optional(),
  description: Joi.string().max(200).optional(),
  metadata: Joi.object()
    .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()))
    .max(50)
    .optional(),
};

const currencyField = Joi.string().length(3).uppercase().default("USD");
const amountField   = Joi.number().integer().min(50).max(10_000_000).required();

/** Tokenized PaymentMethod payload (we reuse it just to validate amount/currency/extras) */
const pmSchema = Joi.object({
  payment_method: Joi.string().pattern(/^pm_[A-Za-z0-9_]+$/).optional(),
  amount: amountField,
  currency: currencyField,
  confirm: Joi.boolean().default(true),
  ...extras,
});

export const paymentSchema = pmSchema.prefs({ abortEarly: false, convert: true, stripUnknown: true });
