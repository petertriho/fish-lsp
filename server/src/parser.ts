import Parser from 'web-tree-sitter'
import * as path from 'path'

export async function initializeParser(): Promise<Parser> {
  await Parser.init()

  const parser = new Parser()
  const treeSitterWasmPath = path.resolve(
    require.resolve('tree-sitter-fish'),
    '..',
    '..',
    '..',
    'tree-sitter-fish.wasm',
  )
  const lang = await Parser.Language.load(treeSitterWasmPath)

  parser.setLanguage(lang)

  return parser
}
