import express from "express";
const app = express();
import cors from "cors";
import userRouter from "./router/user"
import zapRouter from "./router/zap"

app.use(cors())
app.use(express.json());

app.use("/api/v1/user", userRouter )
app.use("/api/v1/zap", zapRouter )

const PORT = 3001;
app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})