const fs = require('fs');
const path = require('path');
const glob = require('glob');

const directory = 'src/js/';
const files = glob.sync(path.join(directory, '*.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace jQuery modal show with native dialog showModal
  if (content.includes("$('#reportModalLong').modal('show')")) {
    content = content.replace(
      /\$\('#reportModalLong'\)\.modal\('show'\);/g,
      "document.getElementById('reportModalLong').showModal();"
    );
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
