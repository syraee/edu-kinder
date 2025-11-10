const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    const adminRole = await prisma.role.create({
        data: { type: "Admin" },
    });

    const teacherRole = await prisma.role.create({
        data: { type: "Teacher" },
    });

    const parentRole = await prisma.role.create({
        data: { type: "Parent" },
    });

    const user1 = await prisma.user.create({
        data: {
            firstName: "admin",
            lastName: "admin2",
            roleId: adminRole.id,
            email: "a9edukinder@gmail.com",
            active: true,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            firstName: "Anna",
            lastName: "Kovacova",
            roleId: parentRole.id,
            email: "anna@example.com",
            active: true,
        },
    });

    const child1 = await prisma.child.create({
        data: {
            firstName: "Peter",
            lastName: "Novak",
            startDate: new Date("2023-09-01"),
            groupId: 1,
        },
    });

    const child2 = await prisma.child.create({
        data: {
            firstName: "Eva",
            lastName: "Kovacova",
            startDate: new Date("2023-09-01"),
            groupId: 1,
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user2.id,
            childId: child2.id,
            relationship: "mother",
        },
    });

    console.log("Seeding finished!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
