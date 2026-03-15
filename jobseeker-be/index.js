const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const verifyJwt = require("./middlewares/authMiddleware");
const credentials = require("./middlewares/credentials");
const corOptions = require("./config/allowedOrigins");
const express = require("express");
const app = express();
require("dotenv").config();
const { initSocket } = require("./socket/socket.js");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

const PORT = 3800;
app.use(cors({ origin: corOptions, credentials: true }));

const server = http.createServer(app);
initSocket(server);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(credentials);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
//no verify jwt
app.use("/auth", require("./routers/auth.route.js"));

// verify jwt
app.use(verifyJwt);

// Protected routes
app.use("/user", require("./routers/api/user.route.js"));
app.use("/seeker", require("./routers/api/seeker.route.js"));
app.use("/job", require("./routers/api/job.route.js"));
app.use("/application", require("./routers/api/application.route.js"));
app.use("/category", require("./routers/api/category.route.js"));

app.use((req, res, next) => {
  res
    .status(404)
    .json({ message: `Method ${req.method} at ${req.url} is not supported!` });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
  console.log(`Swagger is running on http://localhost:${PORT}/swagger...`);
});
