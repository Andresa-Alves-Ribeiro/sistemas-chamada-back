import { Router, type Request, type Response } from "express";
import { supabase } from "../services/supabaseClient.js";
import type { Student } from "../types/students.js";

const router = Router();

router.get("/students", async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("students")
            .select("*")
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

router.get("/students/count", async (_req: Request, res: Response) => {
    try {
        const { count, error } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true });

        if (error) {
            console.error("Erro ao contar alunos:", error);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                message: error.message 
            });
        }

        return res.status(200).json({
            success: true,
            totalStudents: count || 0
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor",
            message: "Erro inesperado ao contar alunos"
        });
    }
});

export default router;
