// Anki note type model definitions
// These match the schemas in Basic Example.apkg
// Model IDs are kept stable so Anki reuses existing note types on import

export const MODEL_BASIC = {
  id: 1483786767214,
  name: 'Basic',
  type: 0,
  mod: 0,
  usn: 0,
  sortf: 0,
  did: null,
  tmpls: [
    {
      name: 'Card 1',
      ord: 0,
      qfmt: '{{Front}}',
      afmt: '{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}',
      did: null,
      bqfmt: '',
      bafmt: '',
    },
  ],
  flds: [
    { name: 'Front', ord: 0, sticky: false, rtl: false, font: 'Arial', size: 20 },
    { name: 'Back', ord: 1, sticky: false, rtl: false, font: 'Arial', size: 20 },
  ],
  css: `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}`,
  latexPre: '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
  latexPost: '\\end{document}',
  latexsvg: false,
  req: [[0, 'any', [0]]],
  vers: [],
  tags: [],
}

export const MODEL_CLOZE_PLUS = {
  id: 1577239191269,
  name: 'Cloze+',
  type: 1,
  mod: 0,
  usn: 0,
  sortf: 0,
  did: null,
  tmpls: [
    {
      name: 'Cloze',
      ord: 0,
      qfmt: '{{cloze:Text}}',
      afmt: '{{cloze:Text}}<br>\n{{Extra}}',
      did: null,
      bqfmt: '',
      bafmt: '',
    },
  ],
  flds: [
    { name: 'Text', ord: 0, sticky: false, rtl: false, font: 'Arial', size: 20 },
    { name: 'Extra', ord: 1, sticky: false, rtl: false, font: 'Arial', size: 20 },
  ],
  css: `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}

.cloze {
  font-weight: bold;
  color: blue;
}

.nightMode .cloze {
  color: lightblue;
}`,
  latexPre: '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
  latexPost: '\\end{document}',
  latexsvg: false,
  req: [[0, 'any', [0]]],
  vers: [],
  tags: [],
}

export const MODEL_CLOZE_PLUS_PLUS = {
  ...MODEL_CLOZE_PLUS,
  id: 1592564833919,
  name: 'Cloze++',
}

export function getModel(noteType: 'Basic' | 'Cloze+' | 'Cloze++') {
  if (noteType === 'Basic') return MODEL_BASIC
  if (noteType === 'Cloze+') return MODEL_CLOZE_PLUS
  return MODEL_CLOZE_PLUS_PLUS
}
