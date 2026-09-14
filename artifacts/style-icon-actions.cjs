const ts = require('typescript');
const fs = require('fs');
for (const name of ['ArtistsTable', 'DealsTable', 'ArtistDrawer', 'ArtistModal', 'DealModal', 'SettingsModal', 'ConfirmModal', 'ImportExportModal', 'ParserView']) {
  const path = `src/components/${name}.tsx`;
  let s = fs.readFileSync(path, 'utf8');
  const tree = ts.createSourceFile(path, s, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  function visit(n) {
    if (ts.isJsxElement(n) && n.openingElement.tagName.getText(tree) === 'button') {
      const children = n.children.filter(c => !ts.isJsxText(c) || c.text.trim());
      if (children.length === 1 && ts.isJsxSelfClosingElement(children[0])) {
        const icon = children[0].tagName.getText(tree);
        if (['Trash2','Edit2','X'].includes(icon)) {
          const attr = n.openingElement.attributes.properties.find(a => a.name?.getText(tree) === 'className');
          if (attr?.initializer) {
            const raw = attr.initializer.getText(tree);
            const offset = raw.startsWith('"') ? 1 : raw.startsWith('{`') ? 2 : -1;
            if (offset >= 0) edits.push({ at: attr.initializer.getStart(tree)+offset, text: `ios-icon-action ${icon === 'Trash2' ? 'is-destructive ' : ''}` });
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(tree);
  for (const e of edits.sort((a,b)=>b.at-a.at)) s = s.slice(0,e.at)+e.text+s.slice(e.at);
  fs.writeFileSync(path,s);
}
