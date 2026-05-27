import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { inngest } from "./client";
import { z } from "zod/v4";
import { createAgent, openai, createTool, createNetwork, type Tool, type Message, createState } from '@inngest/agent-kit';
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { prisma } from "@/lib/db";



interface AgentState {
    summary: string;
    files: { [path: string]: string };
};


export const BuildrAgent = inngest.createFunction(
    { id: "BuildrAgent", triggers: [{ event: "BuildrAgent/run" }] },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("buildr-nextjs");
            return sandbox.sandboxId;
        });
        const previousMessages = await step.run("get-previous-messages", async () => {
            const formattedMessages: Message[] = [];
            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,

                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            });
            for (const message of messages) {// jaise build calculator
                formattedMessages.push({
                    type: "text",
                    role: message.role === "ASSISTANT" ? "assistant" : "user",
                    content: message.content,

                });
            }
            return formattedMessages.reverse();
        });
        const state = createState<AgentState>({
            summary: "",
            files: {},
        },
            {
                messages: previousMessages,

            },
        );

        const codeAgent = createAgent<AgentState>({
            name: 'code-agent',
            description: "An Expert Coding Agent",
            system: PROMPT,
            model: openai({ // chatgpt ka model ingest ko diya h 
                model: "gpt-5.1",
            }),
            tools: [
                createTool({ // 
                    name: "terminal",
                    description: "Use the terminal to run commands",
                    parameters: z.object({
                        command: z.string(),

                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: "", stderr: "" };
                            try {
                                const sandbox = await getSandbox(sandboxId);// id chalane ke liye
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data;
                                    }
                                });
                                return result.stdout;
                            }
                            catch (e) {
                                console.error(
                                    `Command failed:${e}\nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,

                                );

                                return `Command failed:${e}\nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`;

                            }
                        });
                    },


                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the sandbox",// create and update ke liye
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string(),
                            }),
                        ),
                    }),
                    handler: async (
                        { files },
                        { step, network }: Tool.Options<AgentState>

                    ) => {

                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                for (const file of files) {
                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }
                                return updatedFiles;
                            }
                            catch (e) {
                                return "Error: " + e;

                            }
                        });

                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }

                    }

                }),
                createTool({
                    name: "readFiles",
                    description: "Read files form the sandbox",// verificstion ke liy read files
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async ({ files }, { step }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId);
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }
                                return JSON.stringify(contents);
                            }
                            catch (e) {
                                return "Error" + e;
                            }
                        })
                    },
                })


            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText = lastAssistantTextMessageContent(result);
                    if (lastAssistantMessageText && network) {
                        if (lastAssistantMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }
                    return result;
                },
            },

        });
        const network = createNetwork<AgentState>({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
                return codeAgent;
            },
        });



        const result = await network.run(event.data.value, { state });
        const validationError = await step.run("validate-sandbox", async () => {
            if (
                !result.state.data.summary ||
                Object.keys(result.state.data.files || {}).length === 0
            ) {
                return null;
            }

            const sandbox = await getSandbox(sandboxId);
            const buffers = { stdout: "", stderr: "" };

            try {
                await sandbox.commands.run("npm run build", {
                    timeoutMs: 120_000,
                    onStdout: (data: string) => {
                        buffers.stdout += data;
                    },
                    onStderr: (data: string) => {
                        buffers.stderr += data;
                    },
                });
            } catch (error) {
                return [
                    "Generated app failed to build.",
                    String(error),
                    buffers.stdout,
                    buffers.stderr,
                ]
                    .filter(Boolean)
                    .join("\n")
                    .slice(0, 4000);
            }

            try {
                await sandbox.commands.run(
                    'pkill -f "[n]ext dev" || true; rm -rf .next; nohup npm run dev -- --hostname 0.0.0.0 --port 3000 > /tmp/buildr-next-dev.log 2>&1 &',
                    { timeoutMs: 30_000 },
                );
            } catch {
                // The preview check below will report the failure if the dev server did not restart.
            }

            try {
                const preview = await sandbox.commands.run(
                    'for i in $(seq 1 45); do status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || true); if [ "$status" = "200" ]; then echo "$status"; exit 0; fi; sleep 1; done; cat /tmp/buildr-next-dev.log >&2; echo "${status:-000}"; exit 1',
                    { timeoutMs: 60_000 },
                );
                const statusCode = preview.stdout.trim();
                if (!statusCode.startsWith("2") && !statusCode.startsWith("3")) {
                    return `Generated app preview returned HTTP ${statusCode || "unknown"}.`;
                }
            } catch (error) {
                return `Generated app preview check failed: ${String(error)}`.slice(0, 4000);
            }

            return null;
        });

        const fragmentTitleGenerator = createAgent({// 
            name: "fragment-title-generator",
            description: "A fragment title generator",
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({
                model: "gpt-5-mini",
            })
        })
        const responseGenerator = createAgent({
            name: "response-generator",
            description: "A responsee generator",
            system: RESPONSE_PROMPT,
            model: openai({
                model: "gpt-5-mini",
            })
        })
        const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
        const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);
        const generateFragmentTitle = () => {
            if (fragmentTitleOutput[0].type !== "text") {
                return "Fragment";
            }
            if (Array.isArray(fragmentTitleOutput[0].content)) {
                return fragmentTitleOutput[0].content.map((txt) => txt).join("");
            }
            else {
                return fragmentTitleOutput[0].content;
            }
        };

        const generateResponse = () => {
            if (responseOutput[0].type !== "text") {
                return "Here you go";
            }
            if (Array.isArray(responseOutput[0].content)) {
                return responseOutput[0].content.map((txt) => txt).join("");
            }
            else {
                return responseOutput[0].content;
            }


        }


        // error yha handle hore hai
        const isError = !result.state.data.summary || 
            Object.keys(result.state.data.files || {}).length === 0 ||
            !!validationError;
        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.setTimeout(60_00 * 10 * 5)

            const host = sandbox.getHost(3000);
            return `https://${host}`;

        });


        await step.run("save-result", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: validationError || "Something went wrong,Please try again.",
                        role: "ASSISTANT",
                        type: "ERROR",
                    },
                });
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: generateResponse(),
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragment: {
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: generateFragmentTitle(),
                            files: result.state.data.files,
                        }
                    },
                },
            })
        });
        return {
            url: sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary
        };
    },
);
