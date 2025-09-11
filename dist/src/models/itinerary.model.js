"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ItinerarySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    places: [
        {
            place: { type: mongoose_1.Schema.Types.ObjectId, ref: "Places", required: true },
            day: { type: Number, required: false },
            visited: { type: Boolean, default: false },
        },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: { type: String },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
/**
 * Virtuals
 */
// Duration in days
ItinerarySchema.virtual("durationDays").get(function () {
    if (!this.startDate || !this.endDate)
        return 0;
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
// Progress tracking
ItinerarySchema.virtual("progress").get(function () {
    const total = this.places.length;
    const visited = this.places.filter((p) => p.visited).length;
    return { visited, total };
});
// Middleware: auto-populate
function autoPopulate(next) {
    this.populate("user", "name email");
    this.populate("places.place", "name address category");
    next();
}
ItinerarySchema.pre("find", autoPopulate);
ItinerarySchema.pre("findOne", autoPopulate);
// ItinerarySchema.pre("findById", autoPopulate);
const ItineraryModel = mongoose_1.default.models.Itinerary || mongoose_1.default.model("Itinerary", ItinerarySchema);
exports.default = ItineraryModel;
