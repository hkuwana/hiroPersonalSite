"""Extract a small, explicit table from Apple's public FY25 Q3 10-Q.

This is a deterministic demonstration for this filing, not a general PDF model.
The 9-month Services selection is deliberately seeded for the period test.
"""
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
from xml.etree import ElementTree as ET
import hashlib
import json
import re

ROOT=Path(__file__).resolve().parent
pdf=ROOT/'source/apple-2025-q3-10q.pdf'
text=PdfReader(pdf).pages[3].extract_text()
assert 'Three Months Ended' in text and 'Nine Months Ended' in text
assert '(In millions,' in text and 'June 28,' in text and '2025' in text
block=text.split('Net sales:',1)[1].split('Cost of sales:',1)[0]
rows={}
for line in block.splitlines():
    label=next((x for x in ['Total net sales','Products','Services'] if line.strip().startswith(x)),None)
    if label:
        vals=[int(v.replace(',','')) for v in re.findall(r'\d[\d,]*',line)]
        assert len(vals)==4,(label,vals)
        rows[label]=vals
assert len(rows)==3
words=[w for w in ET.parse(ROOT/'source/statement-words.html').iter() if w.tag.endswith('word')]
crop=(42,132,570,239)  # PDF points; printed statement p.1, PDF page 4.
def bounds(value):
    w=next(w for w in words if w.text==f'{value:,}')
    return [(float(w.attrib[a])-crop[i%2]) for i,a in enumerate(['xMin','yMin','xMax','yMax'])]
facts=[]
for label,vals in rows.items():
    for col,months in [(0,3),(2,9)]:
        value=vals[col]
        facts.append({'id':f'{label.lower().replace(" ","-")}-{months}m','label':label,
                      'value':value,'months':months,'periodEnd':'2025-06-28',
                      'unit':'USD millions','pdfPage':4,'printedPage':1,
                      'bbox':bounds(value)})
data={'company':'Apple Inc.','filing':'FY25 Q3 Form 10-Q','periodEnd':'2025-06-28',
      'targetMonths':3,'unit':'USD millions','pdfPage':4,'printedPage':1,
      'sourceUrl':'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q3/filing/10Q-Q3-2025-as-filed.pdf#page=4',
      'secUrl':'https://www.sec.gov/Archives/edgar/data/320193/000032019325000073/aapl-20250628.htm',
      'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'facts':facts,
      'cropSize':[crop[2]-crop[0],crop[3]-crop[1]],
      'scope':'Public-source example. The wrong-period selection is an intentionally seeded test. Not Greywolf client work.'}
(ROOT/'proof-data.json').write_text(json.dumps(data,indent=2)+'\n')
img=Image.open(ROOT/'source/statement-page.png')
s=145/72
img.crop(tuple(round(x*s) for x in crop)).save(ROOT/'source/statement-excerpt.png')
print('Extracted six source facts; periods, units, page references and source hash retained.')
