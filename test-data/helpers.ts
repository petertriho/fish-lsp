import {readdirSync, readFileSync} from 'fs';
import { resolve } from 'path'
import {initializeParser} from '../src/parser';
import {Point, SyntaxNode} from 'web-tree-sitter'


export function nodeToString(node: SyntaxNode) : string {
    return `node: ${node.text}, type: ${node.type}, (${node.startPosition.row}, ${node.startPosition.column}) (${node.endPosition.row}, ${node.endPosition.column})`
}

export function resolveRelPath(dirname: string, fname: string): string {
    const file = readFileSync(resolve(dirname, fname), 'utf8');
    return file.toString();
}

export async function resolveAbsPath(fname: string): Promise<string[]> {
    //if ( fname.startsWith('/usr/share/fish/functions') ) {
        //const fstr = fname.replace('/usr/share/fish/functions/', '')
        //const file = readFileSync(resolve('/usr/share/fish/functions/', fstr), 'utf8');
        //return file.toString();
    //}
    const file = readFileSync(resolve(fname), 'utf8');
    return file.split('\n');
}


export function positionStr(pos: Point){
    return `(${pos.row.toString()}, ${pos.column.toString()})`
}


// @ts-ignore
export async function getRootNode(fname: string): Promise<SyntaxNode> {
    const file = await resolveAbsPath(fname)
    const parser = await initializeParser();
    const tree = parser.parse(file.join('\n'));
    return tree.rootNode;
}

export async function readShareDir(): Promise<string[]> {
    let files: string[] = []
    try {
        files = readdirSync('/usr/share/fish/functions/', {encoding:'utf8', withFileTypes: false})
        //files.forEach(file => {
        //    result.push('/usr/share/fish/functions/'+file)
        //})
    } catch (e) {
        console.log(e)
    }
    return files.map(file => '/usr/share/fish/functions/' + file.toString())
}

// determine a node to check for a file, to keep implementationo
// that is not in the lsp-server, test-cases just mainly check 
// for nodes in the beggining of a line
export function getRandomNodeType(): string {
    const choices = [
        'if',
        'else if',
        'set',
        'string', 
        'echo',
        'return',
        'case'
    ]
    return choices[Math.floor(Math.random() * choices.length)]
}

// handle other types of fish system files
export async function getRandomNodeMatches(fileStr: string, nodeStr: string): Promise<string[]> {
    const file = await resolveAbsPath(fileStr)
    return file
        .map(line => line.trimStart())
        .filter(line => line.startsWith(nodeStr))
}


