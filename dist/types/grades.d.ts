export type Grade = {
    id: string;
    grade: string;
    time: string;
    studentsQuantity: number;
    created_at: string;
    updated_at: string;
};
export type CreateGrade = Omit<Grade, "id" | "created_at" | "updated_at">;
export type UpdateGrade = Partial<CreateGrade>;
//# sourceMappingURL=grades.d.ts.map