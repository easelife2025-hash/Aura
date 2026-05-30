const fs = require('fs');

let text = fs.readFileSync('src/components/dashboard/CommandCenter.tsx', 'utf8');

const t2 = text.replace(/const emailBody = \[\n([ \t]+)`To: \$\{user\.email\}`,\n([ \t]+)const subjectText = `([^`]+)`;\n([ \t]+)const subjectBase64 = btoa\(unescape\(encodeURIComponent\(subjectText\)\)\);\n([ \t]+)`Subject: =\?utf-8\?B\?\$\{subjectBase64\}\?=`/g, 
  "const subjectText = `$3`;\n$1const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));\n$1const emailBody = [\n$1  `To: ${user.email}`,\n$1  `Subject: =?utf-8?B?${subjectBase64}?=`");

fs.writeFileSync('src/components/dashboard/CommandCenter.tsx', t2);

let text2 = fs.readFileSync('src/components/MotivationalReminder.tsx', 'utf8');
const m2 = text2.replace(/const emailBody = \[\n([ \t]+)`To: \$\{user\.email\}`,\n([ \t]+)const subjectText = `([^`]+)`;\n([ \t]+)const subjectBase64 = btoa\(unescape\(encodeURIComponent\(subjectText\)\)\);\n([ \t]+)`Subject: =\?utf-8\?B\?\$\{subjectBase64\}\?=`/g,
  "const subjectText = `$3`;\n$1const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));\n$1const emailBody = [\n$1  `To: ${user.email}`,\n$1  `Subject: =?utf-8?B?${subjectBase64}?=`");
fs.writeFileSync('src/components/MotivationalReminder.tsx', m2);

console.log('done regexing arrays!');
