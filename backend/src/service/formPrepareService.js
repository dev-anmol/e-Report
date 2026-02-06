const Person = require("../model/person")
const Case = require("../model/case")
const Form = require("../model/form")
const PoliceStation = require("../model/policeStation")

async function prepareInterimBond125126Data(form, caseData) {
  const content = form.content.mr

  // 1. Fetch accused persons
  const accusedPersons = await Person.find({
    _id: { $in: content.accusedPersonIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })

  // 1.5 Fetch sureties if present
  const suretyIds = content.sureties?.map(s => s.personId).filter(Boolean) || []
  const suretyPersons = await Person.find({ _id: { $in: suretyIds } })

  if (!accusedPersons.length) {
    throw new Error("No valid defendants found for bond")
  }

  // 2. Build one page per accused
  return accusedPersons.map(accused => {
    // Find matching surety for this accused if any (assuming simple mapping for now)
    const suretyData = content.sureties?.find(s => s.accusedId === String(accused._id))
    const suretyPerson = suretyPersons.find(p => String(p._id) === suretyData?.personId)

    return {
      policeStationName: caseData.policeStationName || "—",
      caseNumber: caseData.branchCaseNumber,
      accused: {
        name: accused.name,
        address: accused.address,
        age: accused.age,
        signature: accused.files?.signature
      },
      amount: content.bond?.amount || "—",
      surety: suretyPerson ? {
        name: suretyPerson.name,
        address: suretyPerson.address,
        signature: suretyPerson.files?.signature
      } : null
    }
  })
}

async function prepareNotice130Data(form, caseData) {
  const content = form.content.mr

  // 1. Fetch persons by IDs
  const persons = await Person.find({
    _id: { $in: content.accusedPersonIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })

  if (!persons.length) {
    throw new Error("No valid defendants found")
  }

  // 2. Build one page per accused
  return persons.map(p => ({
    branchChapterCaseNo: caseData.branchCaseNumber,
    policeChapterCaseNo: caseData.policeStationCaseNumber,
    policeStationName: caseData.policeStationName,
    sections: caseData.sections?.join(", ") || "",
    hearingDate: content.hearing?.date || "—",
    accused: {
      name: p.name,
      address: p.address,
      signature: p.files?.signature
    }
  }))
}

async function prepareAccusedStatementData(form, caseData) {
  const content = form.content.mr

  if (!Array.isArray(content.accusedPersonIds) || !content.accusedPersonIds.length) {
    throw new Error("accusedPersonIds are required for STATEMENT_ACCUSED")
  }

  const accusedPersons = await Person.find({
    _id: { $in: content.accusedPersonIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })

  if (!accusedPersons.length) {
    throw new Error("No valid defendants found for statement")
  }

  return accusedPersons.map(accused => ({
    policeStationName: caseData.policeStationName,
    accused: {
      name: accused.name,
      age: accused.age,
      address: accused.address,
      occupation: accused.occupation || "—",
      signature: accused.files?.signature
    },
    answer1: content.answers?.q1 || "—",
    answer2: content.answers?.q2 || "—"
  }))
}

async function prepareAccusedBondTimeRequestData(form, caseData) {
  const content = form.content.mr

  if (!content.accusedPersonIds || !content.accusedPersonIds.length) {
    throw new Error("accusedPersonIds required for ACCUSED_BOND_TIME_REQUEST")
  }

  const accusedPersons = await Person.find({
    _id: { $in: content.accusedPersonIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })

  if (!accusedPersons.length) {
    throw new Error("No valid accused found for bond time request")
  }

  return accusedPersons.map(accused => ({
    policeStationName: caseData.policeStationName,
    caseNumber: caseData.branchCaseNumber,
    accused: {
      name: accused.name,
      address: accused.address,
      signature: accused.files?.signature
    },
    requestedDays: content.requestedDays || "—"
  }))
}

async function generateCaseRoznamaPage(caseId) {
  if (!caseId) throw new Error("caseId is required")

  // 1️⃣ Fetch case
  const caseData = await Case.findById(caseId)
  if (!caseData) throw new Error("Case not found")

  // 2️⃣ Fetch police station
  const policeStation = await PoliceStation.findById(
    caseData.policeStationId
  )
  if (!policeStation) throw new Error("Police station not found")

  // 3️⃣ Fetch roznama form (must exist)
  const roznamaForm = await Form.findOne({
    caseId,
    formType: "CASE_ROZNAMA",
    status: { $in: ["DRAFT", "APPROVED"] }
  })
  if (!roznamaForm) {
    throw new Error("CASE_ROZNAMA form not found")
  }

  // 4️⃣ Fetch persons
  const persons = await Person.find({ caseId })

  const complainant = persons.find(p => p.role === "APPLICANT")
  const allDefendants = persons.filter(p => p.role === "DEFENDANT")

  // 5️⃣ Build entries with resolved present accused
  const entries = roznamaForm.content.mr.entries.map(entry => {
    const presentAccused = allDefendants.filter(d =>
      entry.presentAccusedPersonIds.includes(String(d._id))
    )

    return {
      date: new Date(entry.date).toLocaleDateString("mr-IN"),
      proceedings: entry.proceedings,
      nextDate: entry.nextDate
        ? new Date(entry.nextDate).toLocaleDateString("mr-IN")
        : "-",
      presentAccused: presentAccused.map(p => ({
        name: p.name,
        signature: p.files?.signature
      }))
    }
  })

  // 6️⃣ FINAL PAGE DATA (what layout.hbs expects)
  return {
    header: {
      branchChapterCaseNo: caseData.branchCaseNumber,
      policeChapterCaseNo: caseData.policeStationCaseNumber,
      policeStationName: policeStation.name,
      sections: caseData.sections?.join(", "),
      applicant: complainant?.name || "—",
      defendants: allDefendants.map(d => d.name).join(", ")
    },
    entries
  }
}

async function prepareSuretyBond126Data(form, caseData) {
  const content = form.content.mr
  const suretyIds = content.suretyPersonIds || []
  const sureties = await Person.find({ _id: { $in: suretyIds } })

  return sureties.map(surety => ({
    policeStationName: caseData.policeStationName,
    caseNumber: caseData.branchCaseNumber,
    surety: {
      name: surety.name,
      address: surety.address,
      signature: surety.files?.signature
    },
    amount: content.amount || "—",
    accusedName: content.accusedName || "—"
  }))
}

async function prepareStatementWitnessData(form, caseData) {
  const content = form.content.mr
  const witnessIds = content.witnessPersonIds || []
  const witnesses = await Person.find({ _id: { $in: witnessIds } })

  return witnesses.map(witness => ({
    policeStationName: caseData.policeStationName,
    witness: {
      name: witness.name,
      age: witness.age,
      address: witness.address,
      occupation: witness.occupation || "—",
      signature: witness.files?.signature
    },
    statement: content.statement || "—"
  }))
}

async function prepareFinalOrderData(form, caseData) {
  const content = form.content.mr
  return [{
    policeStationName: caseData.policeStationName,
    caseNumber: caseData.branchCaseNumber,
    sections: caseData.sections?.join(", "),
    orderDate: content.orderDate || new Date().toLocaleDateString("mr-IN"),
    orderText: content.orderText || "—"
  }]
}

module.exports = {
  generateCaseRoznamaPage,
  prepareInterimBond125126Data,
  prepareNotice130Data,
  prepareAccusedStatementData,
  prepareAccusedBondTimeRequestData,
  prepareSuretyBond126Data,
  prepareStatementWitnessData,
  prepareFinalOrderData
}