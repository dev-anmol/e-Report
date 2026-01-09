const supabase = require("../config/supabase")

const BUCKET = "ereport-files"

async function uploadFile({ buffer, path, contentType }) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true
    })

  if (error) {
    throw new Error(error.message)
  }

  return path
}

module.exports = {
  uploadFile
}