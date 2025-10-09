// Translation index file
import { en } from './en';
import { tl } from './tl';
import { ceb } from './ceb';
import { ilo } from './ilo';

// Add more language imports as needed
// import { hil } from './hil';
// import { war } from './war';
// import { bik } from './bik';
// import { pam } from './pam';
// import { pag } from './pag';
// import { tgl } from './tgl';

export const translations = {
  en,
  tl,
  ceb,
  ilo,
  // hil,
  // war,
  // bik,
  // pam,
  // pag,
  // tgl
};

export const defaultLanguage = 'en';

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'ilo', name: 'Ilokano', nativeName: 'Ilokano' },
  // { code: 'hil', name: 'Hiligaynon', nativeName: 'Hiligaynon' },
  // { code: 'war', name: 'Waray', nativeName: 'Waray' },
  // { code: 'bik', name: 'Bikol', nativeName: 'Bikol' },
  // { code: 'pam', name: 'Kapampangan', nativeName: 'Kapampangan' },
  // { code: 'pag', name: 'Pangasinan', nativeName: 'Pangasinan' },
  // { code: 'tgl', name: 'Tausug', nativeName: 'Tausug' }
];
