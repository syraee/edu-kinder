const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");


router.get("/", async (req, res, next) => {
    // #swagger.tags = ['Children']
    // #swaggers.summary = 'Get all children in kindergarten
    try{
        const children = await prisma.child.findMany();
        res.json({
            success: true,
            data: children
        })
    }catch (err) {
        next(err);
    }
})

router.post("/", async (req, res, next) => {
    // #swagger.tags = ['Children']
    // #swagger.summary = 'Create  a new child.'
    // #swagger.description = 'Create a new child.'

    try{
        const { firstName, lastName, startDate } = req.body;

        if (!firstName || !lastName || !startDate) {
            return res.status(400).json({error: "Something is missing"});
        }

        const newChild = await prisma.child.create({
            data:{
                firstName,
                lastName,
                startDate
            }
        })

        res.status(201).json({newChild})
    }catch (err) {
        next(err);
    }
})

module.exports = router;