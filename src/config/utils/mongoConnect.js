import mongoose from "mongoose";

const connectMongoose = async () => {
   const connect = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "E-Commerce",
   });
};

export async function connectDb() {
   try {
      await connectMongoose();
      console.log("Database connection established");
   } catch (error) {
      console.error(error);
   }
}
