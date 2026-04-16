import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    default: null 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'product', 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['click', 'view', 'add_to_cart'], 
    default: 'click' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Interaction = mongoose.models.interaction || mongoose.model("interaction", interactionSchema);
export default Interaction;