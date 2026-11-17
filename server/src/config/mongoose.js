import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("toJSON", {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose;
