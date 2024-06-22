import mongoose from "mongoose";

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bd_socialnet");
    console.log("✅ Conectado a la base de datos: bd_socialnet");
  } catch (error) {
    console.log(error);
    throw new error("❌ Error conectando a la base de datos.");
  }
};

export default connection;
