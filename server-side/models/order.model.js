import mongoose from "mongoose";

// Sub-order schema for each restaurant
const subOrderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },

        request: {
          type: String,
          default: "",
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on the way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Delivery information schema
const deliverySchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // One sub-order for each restaurant
    subOrders: [subOrderSchema],

    totalPrice: {
      type: Number,
      required: true,
    },

    overallStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "onlineWallet"],
      default: "cash",
    },

    // Delivery information
    delivery: deliverySchema,
  },
  { timestamps: true },
);

// Virtual to determine if all restaurant orders are delivered
orderSchema.virtual("isFullyDelivered").get(function () {
  return this.subOrders.every((subOrder) => subOrder.status === "delivered");
});

// Update overall order status based on all restaurant orders
orderSchema.methods.updateOverallStatus = function () {
  const allCancelled = this.subOrders.every(
    (sub) => sub.status === "cancelled",
  );

  const allDelivered = this.subOrders.every(
    (sub) => sub.status === "delivered",
  );

  const hasProcessing = this.subOrders.some((sub) =>
    ["confirmed", "preparing", "ready", "on the way"].includes(sub.status),
  );

  if (allCancelled) {
    this.overallStatus = "cancelled";
  } else if (allDelivered) {
    this.overallStatus = "completed";
  } else if (hasProcessing) {
    this.overallStatus = "processing";
  } else {
    this.overallStatus = "pending";
  }
};

export default mongoose.model("Order", orderSchema);
