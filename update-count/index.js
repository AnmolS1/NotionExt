// updateCount
import { Client } from '@notionhq/client';

const notion = new Client ({ auth: process.env.NOTION_KEY });

function replace (text, r, i) {
	while (text.includes(r))
		text = text.substring(0, text.indexOf(r)) + i + text.substring(text.indexOf(r) + 1);
	return text;
}

(async () => {
	const page_id = process.env.MAH_POEMS_PAGE;
	const page_children = await notion.blocks.children.list ({ block_id: page_id });
	
	const blocks = page_children.results;
	var total_poems = 0;
	for (var i = 4; i < blocks.length - 2; i++) {
		var database_id = blocks[i].id, start_cursor = '';
		
		while (true) {
			var response = await notion.databases.query ({
				database_id: database_id,
				start_cursor: start_cursor ? start_cursor : undefined
			});
			
			total_poems += response.results.length;
			
			if (response.has_more) {
				start_cursor = response.next_cursor;
			} else {
				break;
			}
		}
	}
	
	await notion.blocks.delete ({
		block_id: blocks[blocks.length - 1].id
	});
	
	await notion.blocks.children.append ({
		block_id: page_id,
		children: [{
			object: 'block',
			type: 'quote',
			quote: {
				rich_text: [{
					type: 'text',
					text: { content: total_poems + ' poems', link: null },
					annotations: {
						bold: false,
						italic: false,
						strikethrough: false,
						underline: false,
						code: false,
						color: 'default'
					},
					plain_text: total_poems + ' poems',
					href: null
				}]
			}
		}]
	});
})();