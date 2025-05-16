const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./src/app");

dotenv.config();

const PORT = process.env.PORT || 8088;

// Kết nối tới MongoDB và khởi động server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });
