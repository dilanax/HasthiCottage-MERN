import mongoose from "mongoose";

const packageDetailsSchema = new mongoose.Schema(
  {
    // store the room identifier as a STRING for now (e.g., "A-102")
    roomId: { type: String, required: true, trim: true },

    adultsIncluded: { type: Number, default: 2, min: 1 },

    perks: {
      freeCancellationAnytime: { type: Boolean, default: false },
      noPrepaymentNeeded: { type: Boolean, default: false },
      noCreditCardNeeded: { type: Boolean, default: false },
    },

    meals: {
      breakfastIncluded: { type: Boolean, default: false },
      lunchPriceUSD: { type: Number, default: 0, min: 0 },
      dinnerPriceUSD: { type: Number, default: 0, min: 0 },
    },

    geniusDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
    geniusFreeBreakfast: { type: Boolean, default: false },

    ribbons: [{ type: String }],

    wasPriceUSD: { type: Number, default: 0, min: 0 },
    priceUSD: { type: Number, required: true, min: 0 },
    priceLKR: { type: Number, default: 0, min: 0 },
    taxesAndChargesUSD: { type: Number, default: 0, min: 0 },

    startDate: { type: Date },
    endDate: { type: Date },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("PackageDetails", packageDetailsSchema);
