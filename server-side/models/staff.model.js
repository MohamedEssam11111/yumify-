import mongoose from "mongoose";
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
    position: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    phone : {type:String}
}, { timestamps: true });

export default staffSchema;