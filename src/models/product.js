// src/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  nutriscore: { type: String },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
