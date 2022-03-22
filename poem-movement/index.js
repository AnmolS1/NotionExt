// poem-movement
import { Client } from '@notionhq/client';
import fs from 'fs';

function replaceNewLines (preview) {
	while (preview.indexOf('\n') != -1) {
		var newLine = preview.indexOf('\n');
		preview = preview.substring(0, newLine) + ' ' + preview.substring(newLine + 1);
	}
	return preview;
}

function getTitle (poem) {
	return poem.substring(0, poem.indexOf('\n\n'));
}

function getPreview (poem) {
	var preview = poem.substring(poem.indexOf('\n\n') + 2);
	if (preview.length < 68)
		preview += '...';
	else
		preview = preview.trim().substring(0, 67) + '...';
	
	return replaceNewLines (preview);
}

function getContent (poem) {
	var c = poem.substring(poem.indexOf('\n\n') + 2);
	
	
	var returner = [];
	var lines = poem.substring(poem.indexOf('\n\n') + 2).split('\n');
	
	for (var i = 0; i < lines.length; i++) {
		returner.push({
			object: 'block',
			type: 'paragraph',
			paragraph: {
				rich_text: [{
					type: 'text',
					text: {
						content: lines[i]
					}
				}]
			}
		});
	}
	
	return returner;
}

const directoryPath = '/Users/anmolu/notion-api/poem_extraction';
const notion = new Client ({ auth: process.env.NOTION_KEY });

(async () => {
	fs.readdir(directoryPath, (err, files) => {
		files.forEach (file => {
			if (!file.endsWith('.txt')) {
				return;
			}
			
			fs.readFile ('poem_extraction/' + file, 'utf8', (err, data) => {
				var title = getTitle (data);
				var preview = getPreview (data);
				var content = getContent (data);
				
				const response = notion.pages.create ({
					parent: {
						database_id: process.env.MAIN_POEM_DB
					},
					properties: {
						Name: {
							title: [{
								text: {
									content: title
								}
							}]
						},
						Preview: {
							rich_text: [{
								text: {
									content: preview,
								},
								annotations: {
									code: true,
									color: 'default'
								},
							}]
						}
					},
					children: content
				});
			});
		});
	});
})();