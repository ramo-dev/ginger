import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { desc } from "drizzle-orm";

export const getConversations = createServerFn({ method: "GET" })
    .handler(async () => {
        const data = await db.select().from(conversations).orderBy(desc(conversations.updatedAt)).limit(20);
        return data.map(c => ({
            ...c,
            metadata: (c.metadata ?? {}) as any
        }));
    });
