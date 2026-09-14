const ts = require('typescript');
const fs = require('fs');
const targets = {
  ArtistModal: 'isNewArtistModalOpen', DealModal: 'isOpen', SettingsModal: 'isSettingsOpen',
  ImportExportModal: 'isImportExportOpen', ConfirmModal: 'isOpen', ParserAccountModal: 'isOpen', ParserSettingsModal: 'isOpen', ImportFromParserModal: 'isOpen',
};
for (const [name, open] of Object.entries(targets)) {
  const path = `src/components/${name}.tsx`;
  let source = fs.readFileSync(path, 'utf8');
  const guard = `if (!${open}) return null;`;
  if (!source.includes(guard)) throw new Error(`${name}: missing guard`);
  source = source.replace(guard, '');
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  let outer;
  function visit(node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'div') {
      const cls = node.openingElement.attributes.properties.find(a => a.name?.getText(tree) === 'className');
      if (!outer && cls && /["'`]fixed inset-0/.test(cls.getText(tree))) outer = node;
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!outer) throw new Error(`${name}: missing overlay`);
  const panel = outer.children.find(ts.isJsxElement);
  function rename(node, tag) {
    for (const el of [node.openingElement, node.closingElement]) edits.push({ start: el.tagName.getStart(tree), end: el.tagName.end, text: tag });
  }
  rename(outer, 'NativeBackdrop');
  rename(panel, 'NativePanel');
  // The exported component's final return contains the complete modal, including nested confirmations.
  const statement = tree.statements.find(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => d.name.getText(tree) === name));
  const fn = statement.declarationList.declarations[0].initializer;
  const ret = fn.body.statements.filter(ts.isReturnStatement).at(-1);
  edits.push({ start: ret.expression.getStart(tree), end: ret.expression.getStart(tree), text: `<AnimatePresence>{${open} && ` });
  edits.push({ start: ret.expression.end, end: ret.expression.end, text: '}</AnimatePresence>' });
  for (const e of edits.sort((a,b) => b.start-a.start)) source = source.slice(0,e.start)+e.text+source.slice(e.end);
  source = `import { AnimatePresence } from 'motion/react';\nimport { NativeBackdrop, NativePanel } from './NativeMotion';\n` + source;
  fs.writeFileSync(path, source);
}
