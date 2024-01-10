import mongoose from "mongoose";
import slugify from "slugify";

const schema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
         unique: true,
         index: true,
      },
   },
   {
      versionKey: false,
      timestamps: true,
   },
);

schema.pre("validate", function (next) {
   if (this.title) {
      this.title = slugify(this.title.toLowerCase());
   }
   next();
});

const BrandsModel = mongoose.model("brands", schema);

export default BrandsModel;
