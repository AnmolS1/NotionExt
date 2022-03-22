// misc
import { Client } from '@notionhq/client';

const notion = new Client ({ auth: process.env.NOTION_KEY });

(async () => {
    var databaseId = process.env.MAIN_POEM_DB;
    var start_cursor = '';

    while (true) {
        var response = await notion.databases.query ({
			database_id: databaseId,
            sorts: [{ property: 'Created', direction: 'descending' }],
			start_cursor: start_cursor ? start_cursor : undefined
		});

        const pages = response.results;
        for (var i = 0; i < pages.length; i++) {
            const for_property = await notion.pages.retrieve ({ page_id: pages[i].id });
            const for_children = await notion.blocks.children.list ({ block_id: pages[i].id });
            const name = for_property.properties.Name;
            const preview = for_property.properties.Preview;
            const children = for_children.results;

            await notion.pages.update ({
                page_id: pages[i].id,
                archived: true
            });

            await notion.pages.create ({
                parent: { database_id: databaseId },
                properties: {
                    Name: name,
                    Preview: preview
                },
                children: children
            });
        }

        if (response.has_more) {
            start_cursor = response.next_cursor;
        } else {
            break;
        }
    }
})();