import mongoose, { Schema } from "mongoose";

const watchEventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    second: {
      type: Number,
      required: true,
      min: 0,
    },
    hits: {
      type: Number,
      default: 1,
    },
    totalWatchDuration: {
      type: Number,
      default: 0,
    },
    completionCount: {
      type: Number,
      default: 0,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

watchEventSchema.index({ user: 1, video: 1, second: 1 }, { unique: true });

export const WatchEvent = mongoose.model("WatchEvent", watchEventSchema);
