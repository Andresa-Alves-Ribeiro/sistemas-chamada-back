import { Router, type Request, type Response } from "express";
import { supabase } from "../services/supabaseClient.js";
import type { Grade, CreateGrade, UpdateGrade } from "../types/grades.js";
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

router.post("/grades", async (req: Request, res: Response) => {
    try {
        const { grade, time }: CreateGrade = req.body;

        if (!grade || !time) {
            return res.status(400).json({
                error: "Dados obrigatórios ausentes",
                message: "Os campos 'grade' e 'time' (horário) são obrigatórios"
            });
        }

        if (typeof grade !== "string" || typeof time !== "string") {
            return res.status(400).json({
                error: "Tipo de dados inválido",
                message: "Verifique os tipos dos campos: grade (string), time (string - horário)"
            });
        }

        // Validar formato de hora
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                error: "Formato de hora inválido",
                message: "O campo 'time' deve estar no formato HH:MM (ex: 08:30, 14:00)"
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

router.put("/grades/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { grade, time }: UpdateGrade = req.body;

        const { data: existingGrade, error: fetchError } = await supabase
            .from("grades")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("Erro ao buscar turma:", fetchError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: "Erro ao buscar turma"
            });
        }

        if (!existingGrade) {
            return res.status(404).json({
                error: "Turma não encontrada",
                message: `Turma com ID ${id} não foi encontrada`
            });
        }

        if (grade !== undefined && typeof grade !== "string") {
            return res.status(400).json({
                error: "Tipo de dados inválido",
                message: "O campo 'grade' deve ser uma string"
            });
        }

        if (time !== undefined && typeof time !== "string") {
            return res.status(400).json({
                error: "Tipo de dados inválido",
                message: "O campo 'time' (horário) deve ser uma string"
            });
        }

        if (time !== undefined && time !== "") {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(time)) {
                return res.status(400).json({
                    error: "Formato de hora inválido",
                    message: "O campo 'time' deve estar no formato HH:MM (ex: 08:30, 14:00)"
                });
            }
        }

        if (grade || time) {
            const newGrade = grade || existingGrade.grade;
            const newTime = time || existingGrade.time;

            const { data: duplicateGrade, error: checkError } = await supabase
                .from("grades")
                .select("*")
                .eq("grade", newGrade)
                .eq("time", newTime)
                .neq("id", id)
                .single();

            if (checkError && checkError.code !== "PGRST116") {
                console.error("Erro ao verificar turma duplicada:", checkError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    message: "Erro ao verificar turma duplicada"
                });
            }

            if (duplicateGrade) {
                return res.status(409).json({
                    error: "Turma já existe",
                    message: `Já existe uma turma ${newGrade} - ${newTime}`
                });
            }
        }

        const updateData: any = {};
        if (grade !== undefined) updateData.grade = grade;
        if (time !== undefined) updateData.time = time;

        const { data: updatedGrade, error: updateError } = await supabase
            .from("grades")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("Erro ao atualizar turma:", updateError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: updateError.message
            });
        }

        if ((grade && grade !== existingGrade.grade) || (time && time !== existingGrade.time)) {
            const newGrade = grade || existingGrade.grade;
            const newTime = time || existingGrade.time;

            const { error: studentsUpdateError } = await supabase
                .from("students")
                .update({
                    grade: newGrade,
                    time: newTime
                })
                .eq("grade", existingGrade.grade)
                .eq("time", existingGrade.time);

            if (studentsUpdateError) {
                console.error("Erro ao atualizar referências dos estudantes:", studentsUpdateError);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Turma atualizada com sucesso",
            data: updatedGrade as Grade
        });

    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({
            error: "Erro interno do servidor",
            message: "Erro inesperado ao atualizar turma"
        });
    }
});

router.delete("/grades/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: existingGrade, error: fetchError } = await supabase
            .from("grades")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("Erro ao buscar turma:", fetchError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: "Erro ao buscar turma"
            });
        }

        if (!existingGrade) {
            return res.status(404).json({
                error: "Turma não encontrada",
                message: `Turma com ID ${id} não foi encontrada`
            });
        }

        const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, name")
            .eq("grade", existingGrade.grade)
            .eq("time", existingGrade.time);

        if (studentsError) {
            console.error("Erro ao verificar alunos da turma:", studentsError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: "Erro ao verificar alunos da turma"
            });
        }

        if (studentsData && studentsData.length > 0) {
            return res.status(409).json({
                error: "Não é possível deletar a turma",
                message: `A turma ${existingGrade.grade} - ${existingGrade.time} possui ${studentsData.length} aluno(s) cadastrado(s). Remova os alunos antes de deletar a turma.`,
                students: studentsData
            });
        }

        const { error: deleteError } = await supabase
            .from("grades")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Erro ao deletar turma:", deleteError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                message: deleteError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: `Turma ${existingGrade.grade} - ${existingGrade.time} deletada com sucesso`,
            deletedGrade: existingGrade
        });

    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({
            error: "Erro interno do servidor",
            message: "Erro inesperado ao deletar turma"
        });
    }
});

export default router;
