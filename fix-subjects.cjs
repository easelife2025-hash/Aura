const fs = require('fs');

let content = fs.readFileSync('src/components/MotivationalReminder.tsx', 'utf8');
content = content.replace(
  /`Subject: Aura: \$\{isUrgent \? "Action Required ⚡" : "Goal Reminder 🎯"}`,\n/g,
  "const subjectText = `Aura: ${isUrgent ? \"Action Required ⚡\" : \"Goal Reminder 🎯\"}`;\n                    const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));\n                    `Subject: =?utf-8?B?${subjectBase64}?=`,\n"
);
fs.writeFileSync('src/components/MotivationalReminder.tsx', content);

let content2 = fs.readFileSync('src/components/dashboard/CommandCenter.tsx', 'utf8');
content2 = content2.replace(
  /`Subject: Aura: Core Routine Update 🔁`,\n/g,
  "const subjectText = `Aura: Core Routine Update 🔁`;\n              const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));\n              `Subject: =?utf-8?B?${subjectBase64}?=`,\n"
);
content2 = content2.replace(
  /`Subject: Aura: Your Daily AI Strategy`,\n/g,
  "const subjectText = `Aura: Your Daily AI Strategy`;\n                 const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));\n                 `Subject: =?utf-8?B?${subjectBase64}?=`,\n"
);
fs.writeFileSync('src/components/dashboard/CommandCenter.tsx', content2);
console.log('Done!');
