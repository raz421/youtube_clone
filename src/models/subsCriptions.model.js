import mongoose, { Schema } from "mongoose";
const subsCriptionSchema = new Schema(
  {
    subscriber: {
      id: Schema.Types.ObjectId,
      ref: "User",
    },
    channal: {
      id: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export const Subscription = mongoose.model("Subscription", subsCriptionSchema);
