import "dotenv/config";
import express, { type Application } from "express";
import turmasRouter from "./routes/grades.js";
import studentsRouter from "./routes/students.js";

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Rotas
app.use("/api", turmasRouter);
app.use("/api", studentsRouter);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
