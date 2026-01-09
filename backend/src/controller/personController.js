// src/controller/personController.js
const Person = require("../model/person") 
const Case = require("../model/case")     

async function createPerson(req, res, next) {
  try {
    const { caseId } = req.params
    const { name, role, address, age, gender, mobile } = req.body

    const existingCase = await Case.findById(caseId)
    if (!existingCase) return res.status(404).json({ message: "Case not found" })

    const person = await Person.create({
      caseId,
      name,
      role,
      address,
      age,
      gender,
      mobile
    })

    res.status(201).json({ personId: person._id })
  } catch (err) {
    next(err)
  }
}

module.exports = { createPerson }
