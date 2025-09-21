import { Router, type Request, type Response } from "express";
import { supabase } from "../services/supabaseClient.js";
import type { Grade } from "../types/grades.js";

const router = Router();

router.get("/grades", async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("Turmas")
            .select("*")
            .order("grade", { ascending: true });

        if (error) {
            console.error("Erro ao buscar turmas:", error);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                message: error.message 
            });
        }

        return res.status(200).json({
            success: true,
            data: data as Grade[],
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
