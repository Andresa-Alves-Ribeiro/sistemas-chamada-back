import { Router } from "express";
import { supabase } from "../services/supabaseClient.js";
const router = Router();
router.get("/grades", async (_req, res) => {
    const { data, error } = await supabase.from("grades").select("*");
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
export default router;
//# sourceMappingURL=grades.js.map