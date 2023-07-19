//import {green} from 'colors';
import {SymbolInformation, Range, SymbolKind, DocumentUri, Location, WorkspaceSymbol, DocumentSymbol, Position, FoldingRange, FoldingRangeKind} from 'vscode-languageserver';
import {SyntaxNode, Tree} from 'web-tree-sitter';
import {Analyzer} from './analyze';
import { LspDocument } from './document';
import {CommentRange, DocumentDefSymbol, toSymbolKind} from './symbols';
import { SymbolTree } from './symbolTree';
import {isBuiltin} from './utils/builtins';
import {findEnclosingVariableScope, findParentCommand, findParentFunction, isCommandName, isDefinition, isForLoop, isFunctionDefinition, isFunctionDefinitionName, isProgram, isScope, isStatement, isVariable, isVariableDefinition} from './utils/node-types';
import {nodeToDocumentSymbol, nodeToSymbolInformation, pathToRelativeFunctionName} from './utils/translation';
import {findEnclosingScope, findFirstParent, getChildNodes, getNodeAtRange, getParentNodes, getRange, getRangeWithPrecedingComments, positionToPoint} from './utils/tree-sitter';

export function getLocalDefs(uri: string, root: SyntaxNode, current: SyntaxNode) {
    const definition = SymbolTree(root, uri).findDef(current)
    if (!definition) return []
    return [Location.create(uri, definition.selectionRange)]
}

export function getLocalRefs(uri: string, root: SyntaxNode, current: SyntaxNode) {
    const refs = SymbolTree(root, uri).findRefs(current)
    if (!refs) return []
    return refs.map((ref: SyntaxNode) => Location.create(uri, getRange(ref)))
}

//export function DocumentSymbolTree(root: SyntaxNode) {
    /**
     * all caches the result of toClientTree(), so that it can be accessed in any other function.
     */
    //const all: DocumentSymbol[] = toClientTree(root);
    /**
     * Takes in a array of DocumentSymbol[], and returns the last definition for each
     * duplicate identifier seen (per scope). Used directly to display the hierarchical
     */
    //function getLastOccurrences(symbols: DocumentSymbol[]) {
        //const seenSymbols: Set<string> = new Set();
        //const result: DocumentSymbol[] = [];
        //for (const symbol of symbols) {
            //if (!seenSymbols.has(symbol.name)) {
                //seenSymbols.add(symbol.name);
                //result.push(symbol);
            //}
            //if (symbol.children) {
                //symbol.children = getLastOccurrences(symbol.children);
            //}
        //}
        //return result;
    //}
    /**
     * Flattens the array of DocumentSymbols, passed in (returns a new array). Is reffered
     * to as ClientTree, because ClientTree's have already removed duplicate identifiers
     * and can be used to display in the Client
     */
    //function flattendClientTree(symbols: DocumentSymbol[]) : DocumentSymbol[] {
        //const stack: DocumentSymbol[] = [...symbols];
        //const result: DocumentSymbol[] = [];
        //while (stack.length > 0) {
            //const symbol = stack.shift();
            //if (!symbol) continue;
            //result.push(symbol);
            //if (symbol.children) stack.unshift(...symbol.children);
        //}
        //return result;
    //}
    /**
     * creates the flat list of symbols, for the client to use as completions.
     */
    //function getNearbyCompletionSymbols( position: Position) {
        //const positionToRange: Range = Range.create(position.line, position.character, position.line, position.character + 1)
        //const nearby: DocumentSymbol[] = [];
        //const stack: DocumentSymbol[] = [...getLastOccurrences(all)];
        //while (stack.length) {
            //const symbol = stack.pop()!;
            //if (!containsRange(symbol.range, positionToRange)) continue;
            //nearby.push(symbol);
            //if (symbol.children) stack.push(...symbol.children)
        //}
        //// grab all enclosing nearby symbols, then pass in the all symbols
        //// to pass in definitions that are found in the same scope.
        //// Then we check for duplicates in the same scope, and lastly make sure that
        //// the resulting array does not have false positives.
        //return [...nearby, ...all]
            //.filter((item: DocumentSymbol, index: number, self: DocumentSymbol[]) =>
                //self.findIndex((otherItem) => item.name === otherItem.name) === index)
            //.filter((symbol) => {
                //if (symbol.kind === SymbolKind.Function) return true;
                //if (symbol.kind === SymbolKind.Variable) {
                    //if (symbol.selectionRange.start.line > position.line) return false;
                    //const parentNode = getNodeAtRange(root, symbol.range);
                    //if (parentNode && isForLoop(parentNode)
                        //&& !containsRange(symbol.range, positionToRange)) return false;
                //}
            //return true
        //})
    //}
    /**
     * returns an array of folding ranges, currently only for function
     * @returns {FoldingRange} - the folding ranges for any node that is a child of rootNode
     */
    //function getFolds(document: LspDocument): FoldingRange[] {
        //const folds: FoldingRange[] = [];
        //const flattendDocs = flattendClientTree(all).filter((symbol) => symbol.kind === SymbolKind.Function);
        //for (const symbol of flattendDocs) {
            //const node = getNodeAtRange(root, symbol.selectionRange);
            //if (!node) continue;
            //const range = getRangeWithPrecedingComments(node);
            //const startLine = range.start.line;
            //const endLine = range.end.line > 0 && document.getText(Range.create(
                //Position.create(range.end.line, range.end.character - 1),
                //range.end,
            //)) === 'end' ? Math.max(range.end.line + 1, range.start.line) : range.end.line;
            //const foldRange = CommentRange.create(node).toFoldRange()
            //folds.push({
                //startLine: foldRange.start.line,
                //endLine: foldRange.end.line,
                //collapsedText: symbol.name,
                //kind: FoldingRangeKind.Region
            //});
        //}
        //return folds;
    //}
    //function find(node?: SyntaxNode) {
        //if (!node) return null;
        //if (node.text === "argv" || node.text === "$argv") {
            //return flattendClientTree(all).filter(symbol => symbol.kind === SymbolKind.Function && containsRange(symbol.range, targetRange))[0] || null
        //}
        //const matchingDocSymbols = findAll(node);
        //if (matchingDocSymbols.length === 0) return null;
        //if (!isVariable(node)) return matchingDocSymbols[0] || null
        //const targetRange = getRange(node)
        //const topDownSymbols = [...matchingDocSymbols]
        //while (topDownSymbols.length) {
            //const docSymbol = topDownSymbols.pop();
            //if (docSymbol && precedesRange(docSymbol?.selectionRange, targetRange)) {
                //return docSymbol;
            //}
            //if (docSymbol?.selectionRange.start.line === targetRange.start.line && docSymbol?.selectionRange.start.character === targetRange.start.character) {
                //return docSymbol;
            //}
        //}
        //return matchingDocSymbols[0] || null;
    //}
    //function findAll(node?: SyntaxNode) {
        //if (!node) return [];
        //const flattenedDocs = flattendClientTree(all);
        //return flattenedDocs.filter((symbol) => symbol.name === node.text);
    //}
    //return {
        //all: () => all,
        //flat: () => flattendClientTree(all),
        //last: () => getLastOccurrences(all),
        //nearby: (position: Position) => getNearbyCompletionSymbols(position),
        //find: (node: SyntaxNode) => find(node),
        //findAll: (node: SyntaxNode) => findAll(node),
        //folds: (document: LspDocument) => getFolds(document),
        ////exports: () => @TODO
    //}
//}

/**
 * This is the recursive solution to building the document symbols (for definitions).
 *
 * @see createFunctionDocumentSymbol
 * @see createVariableDocumentSymbol
 *
 * @param {SyntaxNode} node - the node to start the recursive search from
 * @returns {DocumentSymbol[]} - the resulting DocumentSymbols, which is a TREE not a flat list
 */
export function collapseToSymbolsRecursive(node: SyntaxNode): DocumentSymbol[] {
    const symbols: DocumentSymbol[] = [];
    const docSymbol = DocumentDefSymbol();
    if (isFunctionDefinition(node)) {
        const symbol = docSymbol.createFunc(node);
        node.children.forEach((child) => {
            const childSymbols = collapseToSymbolsRecursive(child);
            if (!symbol.children) symbol.children = [];
            symbol.children.push(...childSymbols);
        })
        symbols.push(symbol);
    } else if (isVariableDefinition(node)) {
        const symbol = docSymbol.createVar(node);
        symbols.push(symbol);
    } else {
        node.children.forEach((child) => {
            symbols.push(...collapseToSymbolsRecursive(child));
        })
    }
    return symbols;
}

/**
 * gets all the symbols of a depth before the variableNode.
 *
 * `function func_a 
 *     set -l var_b; set -l var_c
 *  end
 *  set -l search_for
 *  echo $search_for `<-- starting here 
 *  would show a pruned tree of:
 *       - `func_a`
 *       - `search_for`
 *  `var_b`, and `var_c` are not reachable and have been pruned
 */
function pruneClientTree(rootNode: SyntaxNode, variableNode: SyntaxNode): DocumentSymbol[] {
    const symbols = collapseToSymbolsRecursive(rootNode);

    const prunedSymbols: DocumentSymbol[] = []
    let nextSymbols : DocumentSymbol[] = [...symbols]
    let currentNode: SyntaxNode | null = variableNode.parent;

    while (currentNode && currentNode?.type !== 'program') {
        currentNode = currentNode.parent;
        const currentLevel = [...nextSymbols.filter(n => n !== undefined)];
        prunedSymbols.push(...currentLevel);
        nextSymbols = [];
        currentLevel.forEach(symbol => {
            if (symbol.children) nextSymbols.push(...symbol.children)
        })
    }
    return prunedSymbols;
}

//export function findMostRecentDefinition(rootNode: SyntaxNode, searchNode: SyntaxNode): DocumentSymbol | undefined {
//    const prunedSymbols = pruneClientTree(rootNode, searchNode);
//    const recentDefinition = prunedSymbols.filter(symbol => symbol.name === searchNode.text);
//    for (const recentlyDefined of recentDefinition.reverse()) {
//        if (recentlyDefined.selectionRange.start.line < getRange(searchNode).start.line
//        ) {
//            return recentlyDefined
//        } else if ( recentlyDefined.selectionRange.start.line === getRange(searchNode).start.line
//            //&& recentlyDefined.selectionRange.start.character <= getRange(searchNode).start.character
//            //&& recentlyDefined.selectionRange.end.character <= getRange(searchNode).end.character
//        ) {
//            return recentlyDefined
//        }
//    }
//    return undefined
//}


export function getDefinitionSymbols(root: SyntaxNode) {
    let parentSymbol: DocumentSymbol | null = null;
    let currentSymbol: DocumentSymbol | null = null;
    let symbols: DocumentSymbol[] = [];
    let queue: SyntaxNode[] = [root];
    const docSymbol = DocumentDefSymbol();

    while (queue.length > 0) {
        const node = queue.shift()!;
        if (isVariableDefinition(node)) {
            currentSymbol = docSymbol.createVar(node);
            if (!currentSymbol) continue; // should never happen
            if (!parentSymbol) symbols.push(currentSymbol);
            if (parentSymbol && containsRange(parentSymbol.range, currentSymbol.range)) {
                if (!parentSymbol.children) {
                    parentSymbol.children = [];
                }
                parentSymbol.children.push(currentSymbol);
            }
        } else if (isFunctionDefinitionName(node)) {
            currentSymbol = docSymbol.createFunc(node);
            parentSymbol = currentSymbol;
        } else if (parentSymbol && !containsRange(parentSymbol.range, getRange(node))) {
            symbols.push(parentSymbol)
            parentSymbol = null;
        }
        queue.unshift(...node?.children)
    }
    return symbols;
}

export function getNodeFromRange(root: SyntaxNode, range: Range) {
    return root.descendantForPosition(
        positionToPoint(range.start),
        positionToPoint(range.end)
    ); 
}
export function getNodeFromSymbol(root: SyntaxNode, symbol: DocumentSymbol) {
    return getNodeFromRange(root, symbol.selectionRange)
}

function getMostRecentSymbols(symbols: DocumentSymbol[], range: Range) {
    const symbolMap: Map<string, DocumentSymbol> = new Map();
    for (const sym of symbols) {
        if (range.start.line <= sym.range.start.line) continue; // skip symbols on same line
        if (symbolMap.has(sym.name)) {                          // place duplicate symbols
            symbolMap.set(sym.name, sym);
            continue;
        } 
        symbolMap.set(sym.name, sym)                             // place initial symbols
    }
    return Array.from(symbolMap.values())
}

export function getNearbySymbols(root: SyntaxNode, range: Range) {
    const symbols: DocumentSymbol[] = getDefinitionSymbols(root);
    const flatSymbols : DocumentSymbol[] = flattenSymbols(symbols);
    const funcs = symbols.filter((sym) => sym.kind === SymbolKind.Function);
    const scopeSymbol = funcs.find((funcSym) => containsRange(funcSym.range, range))
    if (!scopeSymbol) {                                          // symbols outside of any local scope
        return [...getMostRecentSymbols(symbols, range), ...funcs].filter(
        (item: DocumentSymbol, index: number, self: DocumentSymbol[]) =>
            self.findIndex((otherItem) => item.name === otherItem.name) === index ) // remove duplicate function symbols
    }
    return [...getMostRecentSymbols(flatSymbols, range), ...funcs].filter(
        (item: DocumentSymbol, index: number, self: DocumentSymbol[]) =>
            self.findIndex((otherItem) => item.name === otherItem.name) === index 
    ) // remove duplicate function symbols
}

function flattenSymbols(symbols: DocumentSymbol[]) {
    const queue = [...symbols];
    const result: DocumentSymbol[] = [];
    while (queue.length > 0) {
        const symbol = queue.shift();
        if (symbol) result.push(symbol);
        if (symbol && symbol.children) queue.unshift(...symbol.children);
    }
    return result;
}

export function containsRange(range: Range, otherRange: Range): boolean {
  if (otherRange.start.line < range.start.line || otherRange.end.line < range.start.line) {
    return false
  }
  if (otherRange.start.line > range.end.line || otherRange.end.line > range.end.line) {
    return false
  }
  if (otherRange.start.line === range.start.line && otherRange.start.character < range.start.character) {
    return false
  }
  if (otherRange.end.line === range.end.line && otherRange.end.character > range.end.character) {
    return false
  }
  return true
}

export function precedesRange(before: Range, after: Range): boolean {
  if (before.start.line < after.start.line) {
    return true
  } 
  if (before.start.line === after.start.line && before.start.character < after.start.character) {
    return true
  }
  return false
}

/* Either we need to open a new doc or we have a definition in our current document
 * Or there is no definition (i.e. a builtin)
 */
export enum DefinitionKind {
    LOCAL,
    FILE,
    NONE
}
export function getDefinitionKind(uri: string, root: SyntaxNode, current: SyntaxNode, localDefintions: Location[]): DefinitionKind {
    if (isBuiltin(current.text)) return DefinitionKind.NONE;
    localDefintions.push(...getLocalDefs(uri, root, current))
    if (localDefintions.length > 0) {
        return DefinitionKind.LOCAL;
    }
    if (isCommandName(current)) return DefinitionKind.FILE;
    return DefinitionKind.NONE;
}


//
// @TODO: REMOVE THIS ONCE COMPLETE PORTING NEW FUNCS
//
// OLD CODE Pre -> DocumentDefSymbol()
//
//export function getReferences(uri: string, root: SyntaxNode, current: SyntaxNode) : Location[]{
//    return getChildNodes(root)
//        .filter((n) => n.text === current.text)
//        .filter((n) => isVariable(n) || isFunctionDefinitionName(n) || isCommandName(n))
//        .filter((n) => containsRange(getRange(findEnclosingScope(n)), getRange(current)))
//        .map((n) => Location.create(uri, getRange(n))) || []
//}
// 
// export function getMostRecentReference(uri: string, root: SyntaxNode, current: SyntaxNode) {
//     const definitions : SyntaxNode[] = current.text === "argv"
//         ? [findEnclosingScope(current)]
//         : getChildNodes(root)
//         .filter((n) => n.text === current.text)
//         .filter((n) => isDefinition(n))
// 
//     let mostRecent = definitions.find(n => n && isDefinition(n))
//     definitions.forEach(defNode => {
//         if (isVariable(current) && precedesRange(getRange(defNode), getRange(current))) {
//             mostRecent = defNode
//         }
//     })
//     return mostRecent
// }