import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema({
  provinceId: { type: Number, required: true, unique: true },
  provinceName: { type: String, required: true },
});

const districtSchema = new mongoose.Schema({
  districtId: { type: Number, required: true, unique: true },
  provinceId: { type: Number, required: true },
  districtName: { type: String, required: true },
});

const wardSchema = new mongoose.Schema({
  wardCode: { type: String, required: true, unique: true },
  districtId: { type: Number, required: true },
  wardName: { type: String, required: true },
});

const Province =
  mongoose.models.province || mongoose.model("province", provinceSchema);
const District = mongoose.model("district", districtSchema);
const Ward = mongoose.model("ward", wardSchema);

export { Province, District, Ward };

