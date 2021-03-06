// exportTXT
import { Client } from '@notionhq/client';
import fs from 'fs';
import exec from 'child_process';

function replace_all (text, r, i) {
    while (text.includes(r)) {
        var r_in = text.indexOf(r);
        text = text.substring(0, r_in) + i + text.substring(r_in + 1);
    }
    return text;
}

const notion = new Client ({ auth: process.env.NOTION_KEY });
(async () => {
    const database_id = process.env.MAIN_POEM_DB;
    const response = await notion.databases.query ({
        database_id: database_id,
        sorts: [
            {
                property: 'Created',
                direction: 'descending'
            }
        ]
    });

    var file_name = process.argv.slice(2).join(' ');
    var poem_name = replace_all (file_name, '\'', '’');
    const pages = response.results;
    
    for (var i = 0; i < pages.length; i++) {
        if (poem_name == pages[i].properties.Name.title[0].plain_text) {
            const poem_content = await notion.blocks.children.list ({
                block_id: pages[i].id
            });

            var content = poem_name + '\n\n';
            file_name = file_name + '.txt';
            const lines = poem_content.results;
            
            for (var j = 0; j < lines.length; j++)
				if (lines[j].paragraph.rich_text.length > 0)
                	content += lines[j].paragraph.rich_text[0].plain_text + (j != lines.length - 1 ? '\n' : '');
            
            fs.writeFile (file_name, content, function (err) {
                if (err) return console.log (err);
            });

            process.stdout.write (file_name);
            break;
        }
    }
})();