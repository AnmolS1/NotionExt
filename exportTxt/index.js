import { Client } from '@notionhq/client';
import fs from 'fs';
import exec from 'child_process';

function replace_all (text, r, i) {
    while (text.includes(r)) {
        text = text.substring(0, r) + i + text.substring(r + 1);
    }
    return text;
}

const notion = new Client ({ auth: process.env.NOTION_KEY });
(async () => {
    const database_id = '9df1310243d147d7bb5faed409fc7352';
    const response = await notion.databases.query ({
        database_id: database_id,
        sorts: [
            {
                property: 'Created',
                direction: 'ascending'
            }
        ]
    });

    var poem_name = process.argv.slice(2).join(' ');
    poem_name = replace_all (poem_name, '\'', '’');
    const pages = response.results;

    for (var i = 0; i < pages.length; i++) {
        if (poem_name == pages[i].properties.Name.title[0].plain_text) {
            const poem_content = await notion.blocks.children.list ({
                block_id: pages[i].id
            });

            var content = poem_name + '\n\n';
            const file_name = poem_name + '.txt';
            const lines = poem_content.results;
            
            for (var j = 0; j < lines.length; j++) {
                content += lines[j].paragraph.rich_text[0].plain_text + (j != lines.length - 1 ? '\n' : '');
            }
            
            fs.writeFile (file_name, content, function (err) {
                if (err) return console.log (err);
            });

            exec.exec ('mv ' + file_name + ' ~/Desktop/other/art/poems/' + file_name, (error, stdout, stderr) => {
                if (error) {
                    console.log (`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log (`stderr: ${stderr}`);
                    return;
                }
            });

            break;
        }
    }
})();