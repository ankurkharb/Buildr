import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const FREE_POINTS = parsePositiveInt(
    process.env.FREE_USAGE_POINTS,
    process.env.NODE_ENV === "production" ? 100 : 100,
);
const PRO_POINTS = parsePositiveInt(
    process.env.PRO_USAGE_POINTS,
    process.env.NODE_ENV === "production" ? 500 : 500,
);
const DURATION = 30 * 24 * 60 * 60;//30 days
const GENERATION_COST = 1;
export async function getUsageTracker() {
    const { has } = await auth();
    const hasProAccess = has({ plan: "pro" });

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasProAccess ? PRO_POINTS : FREE_POINTS,
        duration: DURATION,
    });
    return usageTracker;

};
export async function consumeCredits() {
    const { userId } = await auth();


    if (!userId) {
        throw new Error("User not authenticated");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
};


export async function getUsageStatus() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;
}
