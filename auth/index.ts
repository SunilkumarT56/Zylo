import connectDB from "./db/db";

(async () => {
  await connectDB();
  console.log("🔥 Global DB Connected");
})();