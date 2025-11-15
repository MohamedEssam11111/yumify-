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
}

}, { timestamps: true });

export default userSchema; // "User" is the model name
