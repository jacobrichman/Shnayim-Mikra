import {createHash} from 'node:crypto';
// Source punctuation errors, not permission to alter stored text or split commentary.
// Numbers 19:2 lacks ] after its 17-word introductory note. Safe cuts follow complete clauses.
// Numbers 28:10 has a redundant [ before its quotation inside a complete parenthetic note.
export const exceptions={"Numbers 19:2":{"sha256":"1813d8832b5c6e3801212be1a81961cf5cadefd51e5bc47c15713a9e7ad60e44","ends":[41,83]},"Numbers 28:10":{"sha256":"7e0ce126c7608ba13a046a2a4e0f9ca789ea3387809f1bfecebb10115666b2f5","ends":[26]}};
export function allowedBracketBoundary(book,verse,english,end){const e=exceptions[`${book} ${verse}`];return !!e&&e.sha256===createHash('sha256').update(english).digest('hex')&&e.ends.includes(end);}
