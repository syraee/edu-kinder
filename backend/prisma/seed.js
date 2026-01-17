require("dotenv").config();
const prisma = require("./client");

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
            lastName: "Kovačová",
            roleId: parentRole.id,
            email: "anna@example.com",
            active: true,
        },
    });

    const user3 = await prisma.user.create({
        data: {
            firstName: 'Magdaléna',
            lastName: 'Juhásová',
            email: 'magdalena.juhasova@example.com',
            active: true,
            roleId: parentRole.id,
        },
    });

    const user4 = await prisma.user.create({
        data: {
            firstName: 'Patrik',
            lastName: 'Borský',
            email: 'patrik.borsky@example.com',
            active: true,
            roleId: parentRole.id,
        },
    });

    const user5 = await prisma.user.create({
        data: {
            firstName: 'Samuel',
            lastName: 'Antal',
            email: 'samuel.antal@example.com',
            active: true,
            roleId: parentRole.id,
        },
    });

    const user6 = await prisma.user.create({
        data: {
            firstName: 'Izabela',
            lastName: 'Antalová',
            email: 'lizzsyrae11@gmail.com',
            active: false,
            roleId: parentRole.id,
        },
    });

    const teacher1 = await prisma.user.create({
        data: {
            firstName: 'Mgr. Eliška',
            lastName: 'Učenlivá',
            email: 'eliska.ucenliva@example.com',
            active: true,
            roleId: teacherRole.id,
        },
    });

    const teacher2 = await prisma.user.create({
        data: {
            firstName: 'Mgr. Frederika',
            lastName: 'Zavadská',
            email: 'frederika.zavadska@example.com',
            active: true,
            roleId: teacherRole.id,
        },
    });



    const classYear = new Date('2024-09-01');

    const class1 = await prisma.groupClass.create({
        data: { name: 'včielky', class: 'A', classYear, roomName: '101' , classTeacherId: teacher1.id},
    });

    const class2 = await prisma.groupClass.create({
        data: { name: 'lienky', class: 'B', classYear, roomName: '102' , classTeacherId: teacher2.id},
    });

    const class3 = await prisma.groupClass.create({
        data: { name: 'motýliky', class: 'C', classYear, roomName: '103' },
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
            lastName: "Kovačová",
            startDate: new Date("2023-09-01"),
            groupId: 1,
        },
    });

    const child3 = await prisma.child.create({
        data: {
            firstName: 'Eugen',
            lastName: 'Juhás',
            startDate: new Date("2023-09-01"),
            groupId: class1.id,
        },
    });

    const child4 = await prisma.child.create({
        data: {
            firstName: 'Anna',
            lastName: 'Borská',
            startDate: new Date("2023-09-01"),
            groupId: class2.id,
        },
    });

    const child5 = await prisma.child.create({
        data: {
            firstName: 'Kristína',
            lastName: 'Antalová',
            startDate: new Date("2023-09-01"),
            groupId: class3.id,
        },
    });

    const child6 = await prisma.child.create({
        data: {
            firstName: 'Svätopluk',
            lastName: 'Antal',
            startDate: new Date("2023-09-01"),
            groupId: class3.id,
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user2.id,
            childId: child2.id,
            relationship: "mother",
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user3.id,
            childId: child3.id,
            relationship: "mother",
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user4.id,
            childId: child4.id,
            relationship: "father",
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user5.id,
            childId: child5.id,
            relationship: "father",
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user5.id,
            childId: child6.id,
            relationship: "father",
        },
    });

    await prisma.childGuardian.create({
        data: {
            userId: user6.id,
            childId: child5.id,
            relationship: "mother",
        },
    });


    await prisma.childGuardian.create({
        data: {
            userId: user6.id,
            childId: child6.id,
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
