export const ADMIN=[
{id:'INV-101',amount:120000,currency:'USD',date:'2026-10-20'},
{id:'INV-102',amount:48000,currency:'USD',date:'2026-10-20'},
{id:'INV-103',amount:87500,currency:'USD',date:'2026-10-20'},
{id:'INV-104',amount:36000,currency:'USD',date:'2026-10-20'}];
export const BROKER=[
{id:'INV-101',amount:120000,currency:'USD',date:'2026-10-20'},
{id:'INV-102',amount:48000,currency:'USD',date:'2026-10-20'},
{id:'INV-103',amount:85000,currency:'USD',date:'2026-10-20'},
{id:'INV-104',amount:36000,currency:'USD',date:'2026-10-20'},
{id:'INV-102',amount:48000,currency:'USD',date:'2026-10-20'}];
export function reconcile(left,right){
 const ids=[...new Set([...left,...right].map(x=>x.id))];
 return ids.map(id=>{const a=left.filter(x=>x.id===id),b=right.filter(x=>x.id===id);const result={id,left:a,right:b};
 if(a.length>1||b.length>1)return {...result,status:'duplicate',label:'Duplicate reference'};
 if(!a.length||!b.length)return {...result,status:'missing',label:'Missing counterpart'};
 if(!Number.isInteger(a[0].amount)||!Number.isInteger(b[0].amount))return {...result,status:'invalid',label:'Invalid amount'};
 if(a[0].currency!==b[0].currency||a[0].date!==b[0].date)return {...result,status:'context',label:'Currency or date differs'};
 const difference=a[0].amount-b[0].amount;
 return {...result,difference,status:difference?'difference':'matched',label:difference?'Amount differs':'Matched'};
 });
}
export const POLICIES=[
{id:'P-01',title:'Access approval',section:'§ 2.1',topic:'access_approval',approved:true,text:'All access changes require documented owner approval.'},
{id:'P-02',title:'Access review',section:'§ 2.2',topic:'access_review',approved:true,text:'Access permissions are reviewed every quarter.'}
];
export const QUESTIONS=[
{id:'Q1',text:'Who approves system access?',topic:'access_approval'},
{id:'Q2',text:'How often are access rights reviewed?',topic:'access_review'},
{id:'Q3',text:'How quickly are internal incidents escalated?',topic:'incident_escalation'}
];
export function draftAnswers(questions,policies){return questions.map(q=>{const p=policies.filter(x=>x.approved&&x.topic===q.topic);return {...q,status:p.length===1?'draft':'needs_review',answer:p.length===1?p[0].text:null,source:p.length===1?p[0]:null}})}
