import { Router } from "express";
import { supabase } from "../services/supabaseClient.js";
const router = Router();
// GET /api/students - Buscar todos os alunos
router.get("/students", async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from("students")
            .select("*")
            .eq("excluded", false) // Filtrar apenas alunos não excluídos
            .order("name", { ascending: true });
        if (error) {
            console.error("Erro ao buscar alunos:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: error.message
            });
        }
        return res.status(200).json({
            success: true,
            data: data,
            count: data?.length || 0
        });
    }
    catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({
            error: "Erro interno do servidor",
            message: "Erro inesperado ao buscar alunos"
        });
    }
});
export default router;
//# sourceMappingURL=students.js.map