// misc
import { Client } from '@notionhq/client';

const notion = new Client ({ auth: process.env.NOTION_KEY });

function create_prev (res) {
	var total = '';
	
	for (var i = 0; i < res.length; i++)
		if (res[i].paragraph.rich_text.length > 0)
			total += res[i].paragraph.rich_text[0].plain_text + ' ';
	
	return (total.length < 68) ? total.trim() : total.trim().substring(0, 67) + '...';
}

(async () => {
    var databaseId = process.env.MAIN_POEM_DB;
    var start_cursor = '';
	var counter = 0;
    while (true) {
        var response = await notion.databases.query ({
			database_id: databaseId,
            start_cursor: start_cursor ? start_cursor : undefined
		});

        const pages = response.results;
        for (var i = 0; i < pages.length; i++) {
            const page_content = await notion.pages.retrieve ({ page_id: pages[i].id });
            
            var current_preview = page_content.properties.Preview.rich_text;
            const name = page_content.properties.Name;
            
            // console.log (String(++counter).padStart(3, ' ') + " | " + name.title[0].text.content);
            
            if (current_preview.length == 1) {
            	continue;
            }
            
            const page = await notion.blocks.children.list ({ block_id: pages[i].id });
            var preview = create_prev(page.results);
            
            const updated = await notion.pages.update ({
            	page_id: pages[i].id,
            	properties: {
            		Name: name,
            		Preview: {
            			rich_text: [{
            				text: {
            					content: preview
            				},
            				annotations: {
            					code: true,
            					color: 'default'
            				}
            			}]
            		}
            	}
            });
        }
        
        if (response.has_more) {
            start_cursor = response.next_cursor;
        } else {
            break;
        }
    }
})();