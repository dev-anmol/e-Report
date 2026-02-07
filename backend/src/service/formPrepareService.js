const Person = require("../model/person")
const Case = require("../model/case")
const Form = require("../model/form")
const PoliceStation = require("../model/policeStation")
const { getSignedUrl } = require("./fileUploadService")

async function resolvePoliceStationName(caseData) {
  if (caseData?.policeStationName) return caseData.policeStationName
  if (!caseData?.policeStationId) return "—"
  const station = await PoliceStation.findById(caseData.policeStationId)
  return station?.name || "—"
}

async function resolveFileUrl(filePath) {
  if (!filePath) return null
  if (/^https?:\/\//.test(filePath) || filePath.startsWith("data:")) {
    return filePath
  }
  try {
    return await getSignedUrl(filePath, 300)
  } catch (err) {
    return null
  }
}

async function enrichSignature(person) {
  if (!person) return person
  const signatureUrl = await resolveFileUrl(person.files?.signature)
  return {
    ...person,
    files: {
      ...person.files,
      signature: signatureUrl || null
    }
  }
}

async function prepareInterimBond125126Data(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  // 1. Fetch accused persons
  const accusedIds = content.accusedPersonIds || content.personIds || []
  let accusedPersons
  if (content.personId) {
    accusedPersons = await Person.find({
      _id: { $in: accusedIds },
      caseId: form.caseId
    })
  } else {
    accusedPersons = await Person.find({
      _id: { $in: accusedIds },
      caseId: form.caseId,
      role: "DEFENDANT"
    })
  }
  accusedPersons = await Promise.all(accusedPersons.map(enrichSignature))

  // 1.5 Fetch sureties if present
  const suretyIds = content.sureties?.map(s => s.personId).filter(Boolean) || []
  let suretyPersons = await Person.find({ _id: { $in: suretyIds } })
  suretyPersons = await Promise.all(suretyPersons.map(enrichSignature))

  if (!accusedPersons.length) {
    throw new Error("No valid defendants found for bond")
  }

  // 2. Build one page per accused
  return accusedPersons.map(accused => {
    // Find matching surety for this accused if any (assuming simple mapping for now)
    const suretyData = content.sureties?.find(s => s.accusedId === String(accused._id))
    const suretyPerson = suretyPersons.find(p => String(p._id) === suretyData?.personId)

    return {
      policeStationName,
      caseNumber: caseData.branchCaseNumber,
      accused: {
        name: accused.name,
        address: accused.address,
        age: accused.age,
        signature: accused.files?.signature
      },
      amount: content.bond?.amount || content.amount || content.bondAmount || "—",
      surety: suretyPerson ? {
        name: suretyPerson.name,
        address: suretyPerson.address,
        signature: suretyPerson.files?.signature
      } : null
    }
  })
}

async function prepareNotice130Data(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  // 1. Fetch persons by IDs
  const accusedIds = content.accusedPersonIds || content.personIds || []
  let persons = await Person.find({
    _id: { $in: accusedIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })
  persons = await Promise.all(persons.map(enrichSignature))

  if (!persons.length) {
    throw new Error("No valid defendants found")
  }

  // 2. Build one page per accused
  return persons.map(p => ({
    branchChapterCaseNo: caseData.branchCaseNumber,
    policeChapterCaseNo: caseData.policeStationCaseNumber,
    policeStationName,
    sections: caseData.sections?.join(", ") || "",
    hearingDate: content.hearing?.date || content.hearingDate || "—",
    accused: {
      name: p.name,
      address: p.address,
      signature: p.files?.signature
    }
  }))
}

async function prepareAccusedStatementData(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  const accusedIds = Array.isArray(content.accusedPersonIds)
    ? content.accusedPersonIds
    : content.personId
      ? [content.personId]
      : []

  if (!accusedIds.length) {
    throw new Error("accusedPersonIds or personId is required for STATEMENT_ACCUSED")
  }

  let accusedPersons = await Person.find({
    _id: { $in: accusedIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })
  accusedPersons = await Promise.all(accusedPersons.map(enrichSignature))

  if (!accusedPersons.length) {
    throw new Error("No valid person found for statement")
  }

  return accusedPersons.map(accused => ({
    policeStationName,
    accused: {
      name: accused.name,
      age: accused.age,
      address: accused.address,
      occupation: accused.occupation || "—",
      signature: accused.files?.signature
    },
    answer1: content.answers?.q1 || content.statement || "—",
    answer2: content.answers?.q2 || "—"
  }))
}

async function prepareAccusedBondTimeRequestData(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  const accusedIds = content.accusedPersonIds || content.personIds || []
  if (!accusedIds.length) {
    throw new Error("accusedPersonIds or personIds required for ACCUSED_BOND_TIME_REQUEST")
  }

  let accusedPersons = await Person.find({
    _id: { $in: accusedIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })
  accusedPersons = await Promise.all(accusedPersons.map(enrichSignature))

  if (!accusedPersons.length) {
    throw new Error("No valid accused found for bond time request")
  }

  return accusedPersons.map(accused => ({
    policeStationName,
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
  let persons = await Person.find({ caseId })
  persons = await Promise.all(persons.map(enrichSignature))

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

async function preparePersonalBond125Data(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)
  const accusedIds = content.accusedPersonIds || content.personIds || []

  let accusedPersons = await Person.find({
    _id: { $in: accusedIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })
  accusedPersons = await Promise.all(accusedPersons.map(enrichSignature))

  if (!accusedPersons.length) {
    throw new Error("No valid defendants found for PERSONAL_BOND_125")
  }

  return accusedPersons.map(accused => ({
    policeStationName,
    caseNumber: caseData.branchCaseNumber,
    accused: {
      name: accused.name,
      address: accused.address,
      age: accused.age,
      signature: accused.files?.signature
    },
    amount: content.bond?.amount || content.amount || content.bondAmount || "—",
    durationMonths: content.bond?.durationMonths || content.durationMonths || "—"
  }))
}

async function prepareSuretyBond126Data(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  const accusedIds = content.accusedPersonIds || content.personIds || []
  let accusedPersons = await Person.find({
    _id: { $in: accusedIds },
    caseId: form.caseId,
    role: "DEFENDANT"
  })
  accusedPersons = await Promise.all(accusedPersons.map(enrichSignature))

  if (!accusedPersons.length) {
    throw new Error("No valid defendants found for SURETY_BOND_126")
  }

  return accusedPersons.map(accused => ({
    policeStationName,
    caseNumber: caseData.branchCaseNumber,
    accused: {
      name: accused.name,
      address: accused.address,
      signature: accused.files?.signature
    },
    amount: content.bond?.amount || content.amount || content.bondAmount || "—",
    durationMonths: content.bond?.durationMonths || content.durationMonths || "—",
    suretyCount: content.bond?.suretyCount || content.suretyCount || "—"
  }))
}

async function prepareStatementWitnessData(form, caseData) {
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)

  const witnessIds = content.witnessPersonIds || (content.personId ? [content.personId] : [])
  let witnesses = await Person.find({ _id: { $in: witnessIds } })
  witnesses = await Promise.all(witnesses.map(enrichSignature))

  return witnesses.map(witness => ({
    policeStationName,
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
  const content = form.content.mr || {}
  const policeStationName = await resolvePoliceStationName(caseData)
  return [{
    policeStationName,
    caseNumber: caseData.branchCaseNumber,
    sections: caseData.sections?.join(", "),
    hearingDate: content.hearingDate || new Date().toLocaleDateString("mr-IN"),
    outcomeType: content.outcomeType || "—",
    outcome: content.outcome || {},
    remarks: content.remarks || "—"
  }]
}

module.exports = {
  generateCaseRoznamaPage,
  prepareInterimBond125126Data,
  prepareNotice130Data,
  prepareAccusedStatementData,
  prepareAccusedBondTimeRequestData,
  preparePersonalBond125Data,
  prepareSuretyBond126Data,
  prepareStatementWitnessData,
  prepareFinalOrderData
}
