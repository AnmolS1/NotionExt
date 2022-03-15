import PyPDF2 as pdf
import os

poems = list(filter(lambda f: os.path.isfile(f) and f.lower().endswith('.pdf'), os.listdir('.')))

for poem in poems:
	pdfFileObj = open (poem, 'rb')
	pdfreader = pdf.PdfFileReader (pdfFileObj)
	
	str = ''
	for page in range(pdfreader.numPages):
		pageObj = pdfreader.getPage(page)
		str = str + pageObj.extractText()
	
	with open(poem.replace('pdf', 'txt'), 'w') as f:
		
		title = str.index('\n')
		str = str[:title] + '\n' + str[title:]
		str = str.strip()
		str = str.replace('Õ', '\'')
		str = str.replace('Ó', '\"')
		str = str.replace('Ò', '\"')
		str = str.replace('Þ', 'fi')
		
		f.write(str)
		f.close()
	
	pdfFileObj.close()
	os.remove(poem)