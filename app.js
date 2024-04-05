const express = require("express");
const cors = require("cors");
const app = express();
const dnsRecordRouter = require("./routes/dnsRecordRoutes");
const authRouter = require("./routes/authRoutes");
/** middlewares */
app.use(express.json());
app.use(cors());
app.disable("x-powered-by");

/** api routes */

app.use("/api/v1", authRouter);

app.use("/api/v1/domain/records", dnsRecordRouter);

/** defining PORT */
const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
