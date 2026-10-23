export function selectFacts(data, mode = 'quarter') {
  return ['Products','Services','Total net sales'].map(label => {
    const months = mode === 'seeded' && label === 'Services' ? 9 : 3;
    return structuredClone(data.facts.find(f => f.label === label && f.months === months));
  });
}

export function validate(data, selected) {
  const expected=['Products','Services','Total net sales'];
  const issues=[];
  for (const label of expected) {
    const matches=selected.filter(f=>f?.label===label);
    if(matches.length!==1){issues.push({kind:'coverage',label,message:`${label}: exactly one source value required`});continue;}
    const f=matches[0];
    if(!Number.isFinite(f.value))issues.push({kind:'missing',label,message:`${label}: numeric value required`});
    if(f.months!==data.targetMonths)issues.push({kind:'period',label,message:`${label}: ${f.months} months selected; ${data.targetMonths} months required`});
    if(f.periodEnd!==data.periodEnd)issues.push({kind:'date',label,message:`${label}: reporting date differs`});
    if(f.unit!==data.unit)issues.push({kind:'unit',label,message:`${label}: units differ`});
    const source=data.facts.find(s=>s.id===f.id);
    if(!source||source.value!==f.value||source.months!==f.months||source.periodEnd!==f.periodEnd||source.unit!==f.unit)
      issues.push({kind:'source',label,message:`${label}: selected value does not match its source record`});
  }
  const get=label=>selected.find(f=>f?.label===label)?.value;
  const values=expected.map(get);
  const numeric=values.every(Number.isFinite);
  const total=numeric?values[0]+values[1]:null;
  const difference=numeric?total-values[2]:null;
  if(numeric&&difference!==0)issues.push({kind:'reconciliation',label:'Total',message:`Components differ from reported total by ${difference.toLocaleString('en-US')} million`});
  return {ok:issues.length===0,total,reportedTotal:get('Total net sales')??null,difference,issues};
}
