
import e from "express"; // Import Express framework
import dotenv from "dotenv"; // Import dotenv to manage environment variables
import cors from "cors";// Import CORS middleware
import path from "path"; // Import path module for handling file paths
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import foodRoutes from "./routes/food.route.js";
import cartRoutes from "./routes/cart.rotes.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js"
import reviewRoutes from "./routes/review.route.js"
import notifcationRoutes from "./routes/notification.route.js"
import staffRoutes from "./routes/staff.route.js"
import bookingRoutes from "./routes/booking.route.js"
import restaurantRoutes from './routes/restaurents.route.js'
import chatbotRoutes from "./routes/chatbot.route.js"
import { connectDB } from "./config/db.js";

dotenv.config(); // Load environment variables (.env file mongoDB connection, PORT, etc.)

const app = e();// Initialize Express app
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));    // Enable CORS for cross-origin requests
app.use(e.json());  // Middleware to parse JSON request bodies
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(path.join(__dirname, '../uploads'));

// Mount API routers under /api prefix so client can use /api/foods 
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/notifications', notifcationRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.use("/uploads", e.static(path.join(__dirname, "../uploads"))); // Serve static files from uploads directory

const PORT = process.env.PORT || 5000;





// Connect to database then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server due to DB error:", err);
});