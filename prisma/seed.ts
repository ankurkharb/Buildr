import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

const projectData: Prisma.ProjectCreateInput[] = [
    {
        name: "Sample Project 1",
        userId: "user-1",
    },
    {
        name: "Sample Project 2", 
        userId: "user-2",
    },
];

export async function main() {
    for (const p of projectData) {
        await prisma.project.create({ data: p });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
