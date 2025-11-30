import mongoose from "mongoose";
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
    role: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    phone : {type:String},
    shift: { type: String  },
    status: { type: String, enum: ['active', 'inactive',"on_leave"], default: 'active' },
    salary: { type: Number  },
    email: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model("Staff", staffSchema);