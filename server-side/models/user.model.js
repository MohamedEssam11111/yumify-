import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl :{type:String,default:'def.svg'},
  role: { 
    type: String, 
    // to restrict roles to either customer or owner if null then guest or err
    enum: ["customer", "owner"], 
    required: true 
  }, // restaurant schema
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" ,default: null }, // only for owners
  address: { type: String  },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", default: null },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  phone : {type:String},
  favourites: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: "Food",
  default: []
},
isVerified: { type: Boolean, default: false },

notifications: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    default: null
  },
],

verifyToken: {
  type: String,
  default: null
},

verifyTokenExpiry: {
  type: Date,
  default: null
},
passwordResetToken: {
  type: String,
  default: null
},
passwordResetTokenExpiry: {
  type: Date,
  default: null
},

}, { timestamps: true });

export default mongoose.model("User", userSchema); // "User" is the model name
