import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// GET all subjects with search, department filter & pagination
router.get("/", async (req, res) => {
    try {
        const { search, department, page = "1", limit = "10" } = req.query;

        const currentPage = Math.max(1, Number(page));
        const limitPerPage = Math.max(1, Number(limit));
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // 🔍 Search by subject name OR code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        // 🏫 Filter by department name
        if (department) {
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            );
        }

        const whereConditions =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // 🔢 Total count
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereConditions);

        const total = Number(countResult[0]?.count ?? 0);

        // 📦 Data query
        const subjectList = await db
            .select({
                ...getTableColumns(subjects),
                department: {
                    ...getTableColumns(departments),
                },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereConditions)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        // ✅ SINGLE response
        res.status(200).json({
            data: subjectList,
            meta: {
                total,
                page: currentPage,
                limit: limitPerPage,
                totalPages: Math.ceil(total / limitPerPage),
            },
        });

    } catch (e) {
        console.error("GET /subjects error:", e);
        res.status(500).json({ error: "Failed to get subjects" });
    }
});

export default router;
