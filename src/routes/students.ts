import { Router, type Request, type Response } from "express";
import { supabase } from "../services/supabaseClient.js";
import type { Student } from "../types/students.js";

const router = Router();

// GET /api/students - Buscar todos os alunos
router.get("/students", async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("alunos")
            .select("*")
            .or("excluded.is.null,excluded.eq.false") // Incluir alunos não excluídos ou com excluded null
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
            data: data as Student[],
            count: data?.length || 0
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor",
            message: "Erro inesperado ao buscar alunos"
        });
    }
});

export default router;
