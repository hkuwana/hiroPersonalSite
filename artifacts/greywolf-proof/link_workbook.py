"""Add native XLSX hyperlinks: Artifact Tool's HYPERLINK evaluator is unavailable.

The workbook, formulas and formatting are authored/exported with Artifact Tool.
This narrowly adds standard OOXML link relationships, preserving all cells.
"""
import sys,zipfile,os
from xml.etree import ElementTree as E
path,url=sys.argv[1:]
main='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
rels='http://schemas.openxmlformats.org/package/2006/relationships'
docrels='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
E.register_namespace('',main);E.register_namespace('r',docrels)
with zipfile.ZipFile(path) as z:files={i.filename:z.read(i.filename) for i in z.infolist()}
for n,refs in [(1,['E9','E10','E11']),(2,[f'F{r}' for r in range(6,12)])]:
    name=f'xl/worksheets/sheet{n}.xml'
    rn=f'xl/worksheets/_rels/sheet{n}.xml.rels'
    sheet=E.fromstring(files[name]);relationships=E.fromstring(files[rn]) if rn in files else E.Element(f'{{{rels}}}Relationships')
    links=sheet.find(f'{{{main}}}hyperlinks')
    if links is None:
        links=E.Element(f'{{{main}}}hyperlinks')
        # The exported sheet has no later drawing/page configuration needed here.
        children=list(sheet);following={'printOptions','pageMargins','pageSetup','headerFooter','drawing','legacyDrawing','extLst'}
        idx=next((i for i,c in enumerate(children) if c.tag.split('}')[-1] in following),len(children))
        sheet.insert(idx,links)
    for i,ref in enumerate(refs):
        rid=f'rIdOtterdSource{i+1}'
        E.SubElement(relationships,f'{{{rels}}}Relationship',{'Id':rid,'Type':docrels+'/hyperlink','Target':url,'TargetMode':'External'})
        E.SubElement(links,f'{{{main}}}hyperlink',{'ref':ref,f'{{{docrels}}}id':rid})
    files[name]=E.tostring(sheet,encoding='utf-8',xml_declaration=True)
    files[rn]=E.tostring(relationships,encoding='utf-8',xml_declaration=True)
with zipfile.ZipFile(path+'.tmp','w',zipfile.ZIP_DEFLATED) as z:
    for name,content in files.items():z.writestr(name,content)
os.replace(path+'.tmp',path)
print('Nine native source hyperlinks added; calculation cells unchanged.')
