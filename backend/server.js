require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const nodemailer = require("nodemailer")

const authRoutes = require("./routes/authRoutes")
const orderRoutes = require("./routes/orders")
const cartRoutes = require("./routes/cart")
const loginRoutes = require("./routes/loginRoutes")
const menuRoutes = require("./routes/menuRoutes")
const supportRoutes = require("./routes/support")
const bookingRoutes = require("./routes/bookingRoutes")
const appAuthRoutes = require("./routes/appAuth")
const foodRoutes = require("./routes/foodRouter")
const supplierRoutes = require("./routes/supplierRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
const supporderRouter = require("./routes/supporderRoutes")
const completedOrderRoutes = require("./routes/completedOrderRoutes")
const refundRoutes = require("./routes/refundRoutes")

const app = express()

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)

app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())
app.use(express.json())

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body)
  next()
})

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err))

// ✅ Routes
app.use("/api", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/login", loginRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/support", supportRoutes)
app.use("/api/booking", bookingRoutes)
app.use("/api", appAuthRoutes)
app.use("/api/foods", foodRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/deliverystatus", supporderRouter)
app.use("/orderdone", completedOrderRoutes)
// ✅ NEW: Add refund routes
app.use("/api", refundRoutes)

// 📩 Support email route
app.post("/api/support", async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Support Request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ message: "Email sent successfully!" })
  } catch (error) {
    console.error("❌ Email sending error:", error)
    res.status(500).json({ message: "Error sending email", error })
  }
})

// ✅ Server listener
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
