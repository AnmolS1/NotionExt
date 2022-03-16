import { Client } from '@notionhq/client';

function format_string (text) {
	if (text.length < 40) {
		text = text + ' '.repeat(40 - text.length);
	}
	return text;
}

function sleep (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function replace (text, r, i) {
	while (text.includes(r))
		text = text.substring(0, text.indexOf(r)) + i + text.substring(text.indexOf(r) + 1);
	return text;
}

function fix_text (text) {
	text = replace (text, 'ß', 'fl');
	text = replace (text, 'Þ', 'fi');
	
	return text;
}

const notion = new Client ({ auth: process.env.NOTION_KEY });

(async () => {
	var databaseId = '9df1310243d147d7bb5faed409fc7352';
	var start_cursor = '', total_count = 0;
	
	while (true) {
		var response = await notion.databases.query ({
			database_id: databaseId,
			start_cursor: start_cursor ? start_cursor : undefined
		});
		
		sleep (1000);
		
		const pages = response.results;
		for (var i = 0; i < pages.length; i++) {
			total_count++;
			
			const page = await notion.blocks.children.list ({ block_id: pages[i].id });
			const page_content = await notion.pages.retrieve ({ page_id: pages[i].id });
			
			const blocks = page.results;
			
			var title = page_content.properties.Name;
			var preview = "";
			var new_children = [];
			
			for (var j = 0; j < blocks.length; j++) {
				const block = await notion.blocks.retrieve ({ block_id: blocks[j].id });
				var to_update = fix_text(block[block.type].rich_text[0].plain_text);
				preview += to_update + ' ';
				
				new_children.push({
					object: 'block',
					type: 'paragraph',
					paragraph: {
						rich_text: [{
							type: 'text',
							text: {
								content: to_update
							}
						}]
					}
				});
			}
			preview = ((preview.length < 68) ? preview.trim() : preview.trim().substring(0, 67)) + '...';
			
			sleep (1000);
			
			await notion.pages.update ({
				page_id: pages[i].id,
				archived: true
			});
			
			await notion.pages.create ({
				parent: {
					database_id: databaseId
				},
				properties: {
					Name: title,
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
				},
				children: new_children
			});
			
			console.log (format_string(title.title[0].plain_text) + total_count);
			sleep (1000);
		}
		
		if (response.has_more) {
			start_cursor = response.next_cursor;
		} else {
			break;
		}
	}
})();