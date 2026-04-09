const request = require('supertest');
const express = require('express');

jest.mock('../../src/middleware/authenticate', () =>
    jest.fn((req, res, next) => {
        req.user = { id: 1 };
        next();
    })
);

jest.mock('../../prisma/client', () => ({
    child: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    childGuardian: {
        findMany: jest.fn(),
    },
    groupClass: {
        findFirst: jest.fn(),
    },
}));

const prisma = require('../../prisma/client');
const authenticate = require('../../src//middleware/authenticate');
const childRouter = require('../../src/routes/childRoutes');

const app = express();
app.use(express.json());
app.use('/api/child', childRouter);

describe('Child Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==================== GET /api/child ====================
    describe('GET /api/child', () => {
        it('vráti zoznam všetkých detí', async () => {
            prisma.child.findMany.mockResolvedValue([
                {
                    id: 1,
                    firstName: 'Adam',
                    lastName: 'Novák',
                    group: { name: 'Slniečka', class: 'A', classYear: 2025 },
                },
                {
                    id: 2,
                    firstName: 'Sofia',
                    lastName: 'Kováčová',
                    group: null,
                },
            ]);

            const res = await request(app).get('/api/child');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toMatchObject({
                id: 1,
                firstName: 'Adam',
                lastName: 'Novák',
                groupName: 'Slniečka',
                className: 'A',
            });
        });
    });

    // ==================== GET /api/child/mine ====================
    describe('GET /api/child/mine', () => {
        it('vráti deti prihláseného rodiča', async () => {
            prisma.childGuardian.findMany.mockResolvedValue([
                {
                    child: {
                        id: 10,
                        firstName: 'Emma',
                        lastName: 'Nováková',
                        groupId: 3,
                    },
                },
            ]);

            const res = await request(app).get('/api/child/mine');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data[0]).toMatchObject({
                id: 10,
                firstName: 'Emma',
                lastName: 'Nováková',
                groupId: 3,
            });
        });

        it('vráti 401 ak nie je autentifikovaný', async () => {
            authenticate.mockImplementationOnce((req, res, next) => {
                res.status(401).json({ success: false, error: 'Not authenticated' });
            });

            const res = await request(app).get('/api/child/mine');

            expect(res.status).toBe(401);
        });
    });

    // ==================== POST /api/child ====================
    describe('POST /api/child', () => {
        it('úspešne vytvorí dieťa', async () => {
            const newChild = {
                id: 99,
                firstName: 'Jakub',
                lastName: 'Kováč',
                birthday: new Date('2020-05-15'),
                groupId: 2,
            };

            prisma.child.create.mockResolvedValue(newChild);

            const res = await request(app)
                .post('/api/child')
                .send({
                    firstName: 'Jakub',
                    lastName: 'Kováč',
                    birthDate: '2020-05-15',
                    groupId: 2,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('úspešne pridané');
            expect(prisma.child.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    firstName: 'Jakub',
                    lastName: 'Kováč',
                    birthday: expect.any(Date),
                    groupId: 2,
                }),
            });
        });

        it('vráti 400 pri chýbajúcich povinných poliach(priezvisko)', async () => {
            const res = await request(app)
                .post('/api/child')
                .send({
                    firstName: 'Jakub',
                    //lastName: 'Kováč',
                    birthDate: '2020-05-15',
                    groupId: 2,
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing required fields.');
        });
        it('vráti 400 pri chýbajúcich povinných poliach(krstne meno)', async () => {
            const res = await request(app).post('/api/child').send({
                //firstName: 'Jakub',
                lastName: 'Kováč',
                birthDate: '2020-05-15',
                groupId: 2,
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing required fields.');
        });
        it('vráti 400 pri chýbajúcich povinných poliach(datum narodenia)', async () => {
            const res = await request(app).post('/api/child').send({
                firstName: 'Jakub',
                lastName: 'Kováč',
                //birthDate: '2020-05-15',
                groupId: 2,
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing required fields.');
        });
        it('vráti 400 pri chýbajúcich povinných poliach(group id)', async () => {
            const res = await request(app).post('/api/child').send({
                firstName: 'Jakub',
                lastName: 'Kováč',
                birthDate: '2020-05-15',
                //groupId: 2,
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing required fields.');
        });
    });

    // ==================== PATCH /api/child/:id ====================
    describe('PATCH /api/child/:id', () => {
        it('úspešne aktualizuje dieťa podľa groupName', async () => {
            prisma.groupClass.findFirst.mockResolvedValue({ id: 5, name: 'Slniečka' });
            prisma.child.update.mockResolvedValue({
                id: 1,
                firstName: 'Adam',
                lastName: 'Novák',
                groupId: 5,
            });

            const res = await request(app)
                .patch('/api/child/1')
                .send({
                    firstName: 'Adam',
                    lastName: 'Novák',
                    groupName: 'Slniečka',
                    className: 'A',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(prisma.groupClass.findFirst).toHaveBeenCalledWith({
                where: { name: 'Slniečka' },
            });
        });

        it('vráti 400 pri neplatnom ID', async () => {
            const res = await request(app).patch('/api/child/abc').send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid child ID');
        });
    });
});