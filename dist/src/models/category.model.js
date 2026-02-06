"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true, lowercase: true, unique: true },
    image: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
categorySchema.index({ title: 1 });
categorySchema.index({ value: 1 }, { unique: true });
const CategoryModel = mongoose_1.default.model('Category', categorySchema);
exports.default = CategoryModel;
