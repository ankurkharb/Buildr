import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {BuildrAgent } from "@/inngest/functions";

export const maxDuration = 300;

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
    BuildrAgent,
    ],
});
