import { Router, type Request, type Response } from "express";
import { supabase } from "../services/supabaseClient.js";
import type { Grade, CreateGrade } from "../types/grades.js";
import type { Student } from "../types/students.js";

const router = Router();

router.get("/grades", async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("grades")
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

router.get("/grades/:id", async (_req: Request, res: Response) => {
    try {
        const { id } = _req.params;
        
        const { data: gradeData, error: gradeError } = await supabase
            .from("grades")
            .select("*")
            .eq("id", id)
            .single();

        if (gradeError) {
            console.error("Erro ao buscar turma:", gradeError);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                message: gradeError.message 
            });
        }

        if (!gradeData) {
            return res.status(404).json({ 
                error: "Turma não encontrada"
            });
        }

        const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("*")
            .eq("grade", gradeData.grade)
            .eq("time", gradeData.time)
            .order("name", { ascending: true });

        if (studentsError) {
            console.error("Erro ao buscar alunos da turma:", studentsError);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                message: studentsError.message 
            });
        }

        return res.status(200).json({
            success: true,
            grade: gradeData as Grade,
            students: studentsData as Student[],
            count: studentsData?.length || 0
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor",
            message: "Erro inesperado ao buscar alunos da turma"
        });
    }
});

// POST /api/grades - Criar nova turma
router.post("/grades", async (req: Request, res: Response) => {
    try {
        const { grade, time }: CreateGrade = req.body;

        if (!grade || !time) {
            return res.status(400).json({
                error: "Dados obrigatórios ausentes",
                message: "Os campos 'grade' e 'time' são obrigatórios"
            });
        }

        if (typeof grade !== "string" || typeof time !== "string") {
            return res.status(400).json({
                error: "Tipo de dados inválido",
                message: "Verifique os tipos dos campos: grade (string), time (string)"
            });
        }

        const { data: existingGrade, error: checkError } = await supabase
            .from("grades")
            .select("*")
            .eq("grade", grade)
            .eq("time", time)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Erro ao verificar turma existente:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: "Erro ao verificar turma existente"
            });
        }

        if (existingGrade) {
            return res.status(409).json({
                error: "Turma já existe",
                message: `Já existe uma turma ${grade} - ${time}`
            });
        }

        const { data, error } = await supabase
            .from("grades")
            .insert([{
                grade,
                time,
            }])
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar turma:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Turma criada com sucesso",
            data: data as Grade
        });

    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({
            error: "Erro interno do servidor",
            message: "Erro inesperado ao criar turma"
        });
    }
});

export default router;
