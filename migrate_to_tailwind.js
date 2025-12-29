const fs = require('fs');
const path = require('path');
const glob = require('glob');

const directory = 'src/html/ajcc/';
const files = glob.sync(path.join(directory, '*.html'));

files.forEach(file => {
  if (file.endsWith('lung.html')) return; // Skip lung.html

  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove container-fluid and row wrappers (simplified approach: just remove the lines if they are standard)
  // But strictly removing lines is dangerous.
  // The structure is:
  // <body>
  //   <%= nav %>
  //   <div class="container-fluid"> <--- Remove
  //     <div class="row"> <--- Remove
  //       <%= sidebar %>
  //       <main ...>
  //         ...
  //       </main>
  //     </div> <--- Remove
  //   </div> <--- Remove
  //
  //   <%= partials %>
  // </body>

  // Replace standard opening tags
  content = content.replace(/<div class="container-fluid">\s*<div class="row">/g, '');
  
  // Replace standard closing tags (before AJCC Definitions Modal)
  // Usually </main> is followed by </div></div>.
  // We need to be careful.
  // Let's look for </main>\s*</div>\s*</div>
  content = content.replace(/<\/main>\s*<\/div>\s*<\/div>/g, '</main>');

  // 2. Update <main> tag
  // Old: <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
  // New: <main role="main" class="md:ml-48 lg:ml-56 pt-12 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
  // We add a wrapper div inside main to match lung.html's padding: <div class="p-6 max-w-7xl mx-auto">
  
  content = content.replace(
    /<main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">/g, 
    '<main role="main" class="md:ml-48 lg:ml-56 pt-12 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">\n<div class="p-6 max-w-7xl mx-auto">'
  );

  // Close the new wrapper div before </main>
  content = content.replace(/<\/main>/g, '</div>\n</main>');

  // 3. Update Header
  // <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
  content = content.replace(
    /<div\s+class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">/g,
    '<div class="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">'
  );

  // 4. Update h1
  // <h1 class="h3">Title <span class="badge ...">...</span></h1>
  content = content.replace(
    /<h1 class="h3">(.*?)<\/h1>/s, // Lazy match content
    (match, inner) => {
        return `<h1 class="text-2xl font-bold flex items-center gap-2">${inner}</h1>`;
    }
  );

  // 5. Update Badge
  content = content.replace(
    /class="badge badge-primary ml-2"/g,
    'class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 align-super ml-2"'
  );
  
  // Remove style="font-size: 50%; vertical-align: super;" as Tailwind classes handle it better or we adjust
  content = content.replace(/style="font-size: 50%; vertical-align: super;"/g, '');


  // 6. Section Headers (h2, h3, h4)
  // h2 class="h4" -> text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 border-l-4 border-blue-500 pl-2
  content = content.replace(/<h2 class="h4"(.*?)>/g, '<h2 class="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 border-l-4 border-blue-500 pl-2"$1>');
  
  // h3 class="h5" -> text-md font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300
  content = content.replace(/<h3 class="h5(.*?)"(.*?)>/g, '<h3 class="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300 $1"$2>');

  // 7. Update Body class
  // <body class="..."> or just <body>
  if (content.includes('<body class="')) {
      // Append classes
      content = content.replace('<body class="', '<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 ');
  } else {
      content = content.replace('<body>', '<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">');
  }

  // 8. Vendors css partial
  // It's likely already correct if it just requires the file, but we updated the file content.
  // However, ensure consistency.

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
