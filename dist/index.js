import "dotenv/config";
import express, {} from "express";
import turmasRouter from "./routes/grades.js";
import studentsRouter from "./routes/students.js";
const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
// Rotas
app.use("/turmas", turmasRouter);
app.use("/api", studentsRouter);
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map