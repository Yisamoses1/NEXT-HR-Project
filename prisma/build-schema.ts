import * as fs from 'fs'
import * as path from 'path'

const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
const schemaDir = path.join(baseDir, 'schema')
const outFile = path.join(baseDir, 'schema.prisma')

if (!fs.existsSync(schemaDir)) {
  console.error(`Schema directory not found: ${schemaDir}`)
  process.exit(1)
}

const schemaFiles = fs
  .readdirSync(schemaDir)
  .filter((f) => f.endsWith('.prisma'))
  .sort()

let header = ''
if (fs.existsSync(outFile)) {
  const existing = fs.readFileSync(outFile, 'utf-8')
  const hasModel = /(^|\n)\s*model\s+/.test(existing)
  if (!hasModel && /generator|datasource/.test(existing)) {
    header = existing.trim() + '\n\n'
  }
}

let finalSchema = header

for (const file of schemaFiles) {
  const content = fs.readFileSync(path.join(schemaDir, file), 'utf-8').trim()
  finalSchema += content + '\n\n'
}

fs.writeFileSync(outFile, finalSchema.trim() + '\n')
console.log(`Merged schema.prisma generated at ${outFile}`)