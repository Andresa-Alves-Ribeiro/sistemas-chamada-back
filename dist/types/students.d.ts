export type Student = {
    id: string;
    name: string;
    grade: string;
    time: string;
    excluded?: boolean;
    exclusionDate?: Date;
    inclusionDate?: Date;
    transferred?: boolean;
    transferDate?: Date;
    originalGradeId?: number;
    created_at: string;
    updated_at: string;
};
export interface Archive {
    id: number;
    name: string;
    format: string;
    size: string;
    uploadDate: Date;
    studentId: number;
}
export interface ArchiveByStudent {
    studentId: number;
    studentName: string;
    quantityArchives: number;
    archives: Archive[];
}
export type CreateArchive = Omit<Archive, "id" | "uploadDate">;
export type CreateStudent = Omit<Student, "id" | "created_at" | "updated_at">;
export type UpdateStudent = Partial<CreateStudent>;
//# sourceMappingURL=students.d.ts.map