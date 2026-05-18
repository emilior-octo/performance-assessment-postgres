# Fix Word upload + PDF garbage
# Esegui dalla root progetto: C:\Users\emili\performance-assessment-postgres

$ErrorActionPreference = "Stop"

$path = ".\server.js"

if (!(Test-Path $path)) {
  throw "server.js non trovato. Esegui questo script dalla root del progetto."
}

$text = Get-Content $path -Raw

# 1) Prisma schema richiede mimeType, non contentType.
$text = $text.Replace(
'        contentType: file.contentType || "application/octet-stream",',
'        mimeType: file.contentType || "application/octet-stream",'
)

# 2) Evita che un .doc binario venga letto come testo e distrugga il PDF.
# Prima il codice faceva return utf8Text.trim(); e quindi stampava bytes binari nel PDF.
$text = $text.Replace(
'    return utf8Text.trim();',
'    return "";'
)

# 3) Blocca upload .doc binari: accetta .docx oppure .doc HTML esportato dalla piattaforma.
$oldUploadCheck = @'
    const fileName = String(file.originalFileName || "").toLowerCase();
    if (!fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
      return res.status(400).send("Carica un file .doc o .docx.");
    }
'@

$newUploadCheck = @'
    const fileName = String(file.originalFileName || "").toLowerCase();
    if (!fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
      return res.status(400).send("Carica un file .docx oppure un .doc esportato dalla piattaforma.");
    }

    const uploadPreview = file.buffer.toString("utf8", 0, Math.min(file.buffer.length, 3000));
    const looksLikeHtmlWord = /<html|<body|<p|<h1|<h2|mso-|urn:schemas-microsoft-com:office/i.test(uploadPreview);
    const looksLikeDocx = fileName.endsWith(".docx") || file.buffer.slice(0, 2).toString("utf8") === "PK";

    if (fileName.endsWith(".doc") && !looksLikeHtmlWord) {
      return res.status(400).send("File .doc binario non supportato. Aprilo in Word e salvalo come .docx, poi ricaricalo.");
    }

    if (!looksLikeDocx && !looksLikeHtmlWord) {
      return res.status(400).send("Formato Word non leggibile. Carica un file .docx.");
    }
'@

if ($text.Contains($oldUploadCheck)) {
  $text = $text.Replace($oldUploadCheck, $newUploadCheck)
} elseif ($text -notmatch 'File \.doc binario non supportato') {
  Write-Warning "Blocco upload check non trovato. Ho applicato solo mimeType + blocco PDF garbage."
}

# 4) In detail, se esiste una revisione binaria vecchia già caricata, validatedReportText diventerà vuoto.
# Il PDF quindi torna alla relazione AI invece di stampare caratteri corrotti.

Set-Content $path $text -Encoding UTF8

Write-Host "Patch applicata."
Write-Host "Ora esegui:"
Write-Host "node --check server.js"
Write-Host "git diff -- server.js"
