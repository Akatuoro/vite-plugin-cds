import path from 'path'
import { fileURLToPath } from 'url'

export default function cwd(url) {
  const __filename = fileURLToPath(url)
  const __dirname = path.dirname(__filename)
  return { __filename, __dirname }
}
