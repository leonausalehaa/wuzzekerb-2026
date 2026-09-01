const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const API='/api'; let deferredPrompt=null, adminPin=sessionStorage.getItem('aakcPin')||'';
const events=[
['2026-09-11','18:00','Öffnung des Kerbeplatzes','Start in das Jubiläumswochenende'],['2026-09-11','19:00','Kerbe-Disco mit DJ Buzzin Lights','Happy Hour 18:30–19:30 Uhr'],['2026-09-11','20:00','Einlauf & Vereidigung','Kerbeborsch & Wuzzemädels'],['2026-09-11','21:30','Kerbeshow','Freitagabend im Festzelt'],
['2026-09-12','12:00','Kinderfest auf dem Kerbeplatz','mit Grillgut, Kaffee & Kuchen'],['2026-09-12','14:00','Schubkarrenrennen an den Gräben','Traditioneller Samstagnachmittag'],['2026-09-12','16:00','3. Altenhainer Bierpongturnier','Turnier auf dem Kerbeplatz'],['2026-09-12','18:00','Zelteinlass','Happy Hour 18:30–19:30 Uhr'],['2026-09-12','19:30','Jubiläumseinlauf aller Kerbeborsch seit 1976','Danach Party mit Partyfritteuse'],
['2026-09-13','11:00','Gottesdienst','Katholische Kirche Maria Geburt'],['2026-09-13','14:00','Festumzug durch Altenhain','Danach After-Umzugsparty'],['2026-09-13','17:00','Tombola','Kerbesonntag'],['2026-09-13','18:00','Beerdigung','Traditioneller Abschluss']
].map((e,i)=>({id:'e'+i,day:e[0],time:e[1],title:e[2],detail:e[3],start:new Date(`${e[0]}T${e[1]}:00+02:00`)}));
const internalCalendarEvents=[
  {id:'i1',day:'2026-09-05',time:'07:30',title:'Zeltaufbau',detail:'Interner Aufbau für die Wuzzekerb 2026',start:new Date('2026-09-05T07:30:00+02:00')},
  {id:'i2',day:'2026-09-06',time:'07:30',title:'Zeltaufbau',detail:'Interner Aufbau für die Wuzzekerb 2026',start:new Date('2026-09-06T07:30:00+02:00')},
  {id:'i3',day:'2026-09-09',time:'18:00',title:'Baum holen',detail:'Interner Termin vor der Wuzzekerb',start:new Date('2026-09-09T18:00:00+02:00')},
  {id:'i4',day:'2026-09-14',time:'07:30',title:'Zeltabbau',detail:'Interner Abbau nach der Wuzzekerb 2026',start:new Date('2026-09-14T07:30:00+02:00')}
];

const dayNames={'2026-09-11':'Freitag, 11. September','2026-09-12':'Samstag, 12. September','2026-09-13':'Sonntag, 13. September'};
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el.t);el.t=setTimeout(()=>el.classList.remove('show'),3000)}
function switchView(v){$$('.view').forEach(x=>x.classList.toggle('active',x.id===v));$$('.bottomnav button').forEach(x=>x.classList.toggle('active',x.dataset.view===v));location.hash=v==='start'?'':v;scrollTo(0,0);if(v==='fotos')loadGallery();if(v==='team'&&sessionStorage.getItem('teamPin'))loadTeamTasks()}
$$('.bottomnav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));

document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.go)));

if(location.hash) switchView(location.hash.slice(1));
function nextEvent(){return events.find(e=>e.start>Date.now())}
const cleanupStart=new Date('2026-09-13T18:00:00+02:00');
const cleanupEnd=new Date('2026-09-13T20:00:00+02:00');

function setCountdown(ms){
  const safe=Math.max(0,ms);
  const vals=[
    Math.floor(safe/86400000),
    Math.floor(safe%86400000/3600000),
    Math.floor(safe%3600000/60000),
    Math.floor(safe%60000/1000)
  ];
  ['#cdD','#cdH','#cdM','#cdS'].forEach((s,i)=>{
    const el=$(s);
    if(el) el.textContent=String(vals[i]).padStart(2,'0');
  });
}

function tick(){
  const now=Date.now();
  const e=nextEvent();

  if(e){
    if($('#nextTitle')) $('#nextTitle').textContent=e.title;
    if($('#nextMeta')) $('#nextMeta').textContent=`${dayNames[e.day]} · ${e.time} Uhr · ${e.detail}`;
    setCountdown(e.start-now);
    return;
  }

  if(now>=cleanupStart.getTime() && now<cleanupEnd.getTime()){
    if($('#nextTitle')) $('#nextTitle').textContent='Gemeinsames Aufräumen';
    if($('#nextMeta')) $('#nextMeta').textContent='Sonntag, 13. September · Aufräumen bis 20:00 Uhr';
    setCountdown(cleanupEnd.getTime()-now);
    return;
  }

  if(now>=cleanupEnd.getTime()){
    if($('#nextTitle')) $('#nextTitle').textContent='Kollektives Kerbe-Besäufnis 🍻';
    if($('#nextMeta')) $('#nextMeta').textContent='Aufräumen geschafft – jetzt wird gemeinsam auf die Kerb angestoßen.';
    setCountdown(0);
    return;
  }
}
function renderToday(){ return; }
function renderSchedule(filter='all'){const now=Date.now(),next=nextEvent();const days=[...new Set(events.map(e=>e.day))].filter(d=>filter==='all'||filter===d);const scheduleEl=$('#schedule');if(!scheduleEl)return;scheduleEl.innerHTML=days.map(d=>`<div class="day"><h3>${dayNames[d]}</h3>${events.filter(e=>e.day===d).map(e=>`<div class="event ${e.id===next?.id?'next':''} ${e.start<now?'past':''}"><div class="etime">${e.time}</div><div><b>${e.title}</b><br><small>${e.detail}</small></div><button onclick="downloadIcs('${e.id}')">📅</button></div>`).join('')}</div>`).join('')}
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSchedule(b.dataset.day)});
function icsDate(d){return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
function makeIcs(items){return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AAKC//Wuzzekerb 2026//DE\r\n${items.map(e=>`BEGIN:VEVENT\r\nUID:${e.id}@wuzzekerb2026\r\nDTSTART:${icsDate(e.start)}\r\nSUMMARY:${e.title}\r\nDESCRIPTION:${e.detail}\r\nBEGIN:VALARM\r\nTRIGGER:-PT30M\r\nACTION:DISPLAY\r\nDESCRIPTION:In 30 Minuten: ${e.title}\r\nEND:VALARM\r\nEND:VEVENT`).join('\r\n')}\r\nEND:VCALENDAR`}
function dl(text,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/calendar'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
window.downloadIcs=id=>{const e=events.find(x=>x.id===id);dl(makeIcs([e]),`wuzzekerb-${id}.ics`)}; $('#allIcs').onclick=()=>dl(makeIcs([...internalCalendarEvents,...events]),'wuzzekerb-2026-kalender.ics'); $('#nextIcs').onclick=()=>{const e=nextEvent();if(e)downloadIcs(e.id)};
async function api(path,opt={}){const r=await fetch(API+path,opt);if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||`Fehler ${r.status}`);return r.json()}
async function loadNews(){try{const d=await api('/news');$('#newsList').innerHTML=d.items?.length?d.items.map(n=>`<div class="newsitem"><div>🔔</div><div><b>${n.title}</b><div>${n.body}</div><small class="muted">${new Date(n.createdAt).toLocaleString('de-DE')}</small></div></div>`).join(''):'<p class="muted">Noch keine Meldungen.</p>'}catch{}}
async function loadGallery(){try{const d=await api('/gallery');$('#gallery').innerHTML=d.items?.length?d.items.map(p=>`<div class="photo"><img loading="lazy" src="${p.url}" alt="Kerbefoto"><p>${p.caption||''}${p.name?`<br><b>📷 ${p.name}</b>`:''}</p></div>`).join(''):'<p class="muted">Noch keine freigegebenen Fotos.</p>'}catch{}}
$('#openUpload').onclick=()=>$('#uploadModal').classList.remove('hidden');$('#closeUpload').onclick=()=>$('#uploadModal').classList.add('hidden');
$('#uploadForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),file=fd.get('photo');if(file.size>5*1024*1024){$('#uploadStatus').textContent='Bitte maximal 5 MB.';return}$('#uploadStatus').textContent='Wird hochgeladen …';try{const r=await fetch(API+'/upload',{method:'POST',body:fd});if(!r.ok)throw new Error();e.target.reset();$('#uploadStatus').textContent='Danke! Das Foto wartet jetzt auf Freigabe.';toast('Foto eingereicht 📸')}catch{$('#uploadStatus').textContent='Upload fehlgeschlagen.'}}
async function enablePush(){if(!('serviceWorker'in navigator)||!('PushManager'in window)){toast('Push wird von diesem Browser nicht unterstützt.');return}const reg=await navigator.serviceWorker.ready;const key=await api('/push-public-key');if(!key.publicKey){toast('Push muss im Netlify-Admin noch eingerichtet werden.');return}const perm=await Notification.requestPermission();if(perm!=='granted')return;const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(key.publicKey)});await api('/push-subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(sub)});toast('Push-News aktiviert 🔔')}
function urlBase64ToUint8Array(s){const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(b);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))} $('#pushBtn').onclick=enablePush;
$('#adminLoginBtn').onclick=async()=>{adminPin=$('#adminPin').value;try{await api('/admin-check',{headers:{'x-admin-pin':adminPin}});sessionStorage.setItem('aakcPin',adminPin);$('#adminLogin').classList.add('hidden');$('#adminArea').classList.remove('hidden');loadAdmin()}catch{toast('PIN falsch')}};
async function loadAdmin(){const p=await api('/gallery-admin',{headers:{'x-admin-pin':adminPin}});$('#pendingPhotos').innerHTML=p.items?.length?p.items.map(x=>`<div class="pending"><img src="${x.url}"><div><b>${x.name||'Anonym'}</b><p>${x.caption||''}</p><button class="pink" onclick="moderate('${x.id}','approve')">Freigeben</button> <button onclick="moderate('${x.id}','delete')">Löschen</button></div></div>`).join(''):'<p class="muted">Keine offenen Fotos.</p>'}
$('#sendNews').onclick=async()=>{await api('/push-send',{method:'POST',headers:{'content-type':'application/json','x-admin-pin':adminPin},body:JSON.stringify({title:$('#newsTitle').value,body:$('#newsBody').value})});toast('Push-News gesendet');$('#newsTitle').value='';$('#newsBody').value='';loadNews()};
window.moderate=async(id,action)=>{await api('/gallery-admin',{method:'POST',headers:{'content-type':'application/json','x-admin-pin':adminPin},body:JSON.stringify({id,action})});toast(action==='approve'?'Foto freigegeben':'Foto gelöscht');loadAdmin();loadGallery()};
if(adminPin){$('#adminLogin').classList.add('hidden');$('#adminArea').classList.remove('hidden');loadAdmin().catch(()=>{})}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$('#installBtn').classList.add('hidden')}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');
renderSchedule();tick();setInterval(tick,1000);loadNews();loadGallery();

let teamTasks=[],teamStatuses={},customTasks=[],internalDatesLive=[],teamShifts=[],teamName=localStorage.getItem('teamName')||'',teamPinVal=sessionStorage.getItem('teamPin')||'';
async function teamApi(path,opt={}){opt.headers={...(opt.headers||{}),'x-team-pin':teamPinVal};return api(path,opt)}
async function loadTeamTasks(){
  if(!teamTasks.length)teamTasks=await fetch('/team-tasks.json?v=2').then(r=>r.json());
  const [d,c,di,sh]=await Promise.all([
    teamApi('/team-status').catch(()=>({statuses:{}})),
    teamApi('/team-tasks-live').catch(()=>({tasks:[]})),
    teamApi('/team-dates-live').catch(()=>({dates:[]})),
    teamApi('/team-shifts-live').catch(()=>({shifts:[]}))
  ]);
  teamStatuses=d.statuses||{};customTasks=c.tasks||[];internalDatesLive=di.dates||[];teamShifts=sh.shifts||[];
  populateTeamFilters();renderTeam();renderInternalDates();renderCustomTasks();renderShifts();renderOverview();
}
function st(id){return teamStatuses[id]?.status||'open'}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function populateTeamFilters(){
  const days=[...new Map(teamTasks.map(t=>[t.date,t.day+' · '+t.date.split('-').reverse().join('.')])).entries()];
  $('#dayFilter').innerHTML='<option value="all">Alle Tage</option>'+days.map(([d,l])=>`<option value="${d}">${l}</option>`).join('');
  const owners=[...new Set([...teamTasks.map(t=>t.owner||''),...customTasks.map(t=>t.owner||''),...internalDatesLive.map(t=>t.owner||''),...teamShifts.map(t=>t.owner||'')].flatMap(x=>x.split(/ und | \/ |, \/|, /)).map(x=>x.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  $('#personFilter').innerHTML='<option value="">Name auswählen</option>'+owners.map(o=>`<option>${esc(o)}</option>`).join('');if(teamName)$('#personFilter').value=teamName
}
function card(t){const s=st(t.id);return `<div class="team-task ${s}"><div class="task-time">${esc(t.time||'—')}</div><div class="task-title">${esc(t.activity)}</div><div class="task-meta">${t.owner?`<span>Verantwortlich: ${esc(t.owner)}</span>`:''}${t.clothes?`<span>Kleidung: ${esc(t.clothes)}</span>`:''}${t.location?`<span>Ort: ${esc(t.location)}</span>`:''}${t.note?`<span>Notiz: ${esc(t.note)}</span>`:''}</div><div class="task-actions"><button onclick="setTeamStatus('${t.id}','open')">○ Offen</button><button class="${s==='doing'?'doing':''}" onclick="setTeamStatus('${t.id}','doing')">◐ Läuft</button><button class="${s==='done'?'done':''}" onclick="setTeamStatus('${t.id}','done')">✓ Erledigt</button></div></div>`}
function customCard(t){const s=t.status||'open';return `<div class="team-task ${s}"><div class="task-time">${t.date?new Date(t.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}):'Ohne Termin'}${t.time?' · '+esc(t.time)+' Uhr':''}</div><div class="task-title">${esc(t.title)}</div><div class="task-meta">${t.owner?`<span>Verantwortlich: ${esc(t.owner)}</span>`:''}${t.note?`<span>Notiz: ${esc(t.note)}</span>`:''}${t.createdBy?`<span>Erstellt von: ${esc(t.createdBy)}</span>`:''}</div><div class="task-actions"><button onclick="setCustomTaskStatus('${t.id}','open')">○ Offen</button><button class="${s==='doing'?'doing':''}" onclick="setCustomTaskStatus('${t.id}','doing')">◐ Läuft</button><button class="${s==='done'?'done':''}" onclick="setCustomTaskStatus('${t.id}','done')">✓ Erledigt</button></div></div>`}
function renderTeam(){const ph=$('#phaseFilter').value,day=$('#dayFilter').value;const f=teamTasks.filter(t=>(ph==='all'||t.phase===ph)&&(day==='all'||t.date===day)),g={};f.forEach(t=>(g[t.date]??=[]).push(t));$('#teamTaskList').innerHTML=Object.entries(g).map(([d,l])=>`<div class="team-day"><h3>${l[0].phase} · ${l[0].day}, ${d.split('-').reverse().join('.')}</h3>${l.map(card).join('')}</div>`).join('')||'<p class="muted">Keine Aufgaben.</p>';renderProgress();renderMine()}
function renderProgress(){const n=teamTasks.length,d=teamTasks.filter(t=>st(t.id)==='done').length,w=teamTasks.filter(t=>st(t.id)==='doing').length,o=n-d-w,p=n?Math.round(d/n*100):0;$('#teamProgressText').textContent=p+' %';$('#teamProgressBar').style.width=p+'%';$('#teamProgressTextBuild').textContent=p+' %';$('#teamProgressBarBuild').style.width=p+'%';$('#statDone').textContent=d+' erledigt';$('#statDoing').textContent=w+' läuft';$('#statOpen').textContent=o+' offen'}
function internalEvents(){return internalDatesLive.map(t=>({...t,activity:t.title})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}
function eventCard(t){return `<div class="internal-event"><div class="internal-date"><b>${new Date(t.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})}</b><span>${esc(t.time)} Uhr</span></div><div><b>${esc(t.title||t.activity)}</b>${t.owner?`<span>Für: ${esc(t.owner)}</span>`:''}${t.location?`<span>Ort: ${esc(t.location)}</span>`:''}${t.note?`<span>${esc(t.note)}</span>`:''}</div></div>`}
function renderInternalDates(){const f=$('#internalDayFilter')?.value||'all';const ev=internalEvents().filter(t=>f==='all'||t.date===f);$('#internalDates').innerHTML=ev.map(eventCard).join('')||'<p class="muted">Keine internen Termine.</p>'}
function renderOverview(){const now=new Date(),ev=internalEvents(),next=ev.find(t=>new Date(`${t.date}T${t.time}:00`)>=now)||ev[0];if(next){$('#internalNext').textContent=next.title;$('#internalNextMeta').textContent=`${new Date(next.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'})} · ${next.time} Uhr`}else{$('#internalNext').textContent='Keine Termine';$('#internalNextMeta').textContent=''}const upcoming=ev.filter(t=>new Date(`${t.date}T${t.time}:00`)>=now).slice(0,3);$('#overviewUpcoming').innerHTML=(upcoming.length?upcoming:ev.slice(0,3)).map(eventCard).join('')}
function renderCustomTasks(){const sorted=[...customTasks].sort((a,b)=>(a.status==='done')-(b.status==='done')||((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||'')));$('#customTaskList').innerHTML=sorted.length?sorted.map(customCard).join(''):'<p class="muted">Noch keine zusätzlichen Aufgaben.</p>';const open=customTasks.filter(t=>t.status!=='done').length;$('#customOpenCount').textContent=open}

function shiftCard(s){
  const end=s.end?'–'+esc(s.end):'';
  return `<div class="shift-card"><div class="shift-time">${esc(s.start)}${end}<span>${new Date(s.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'})}</span></div><div class="shift-info"><b>${esc(s.title)}</b>${s.owner?`<span>👤 ${esc(s.owner)}</span>`:''}${s.location?`<span>📍 ${esc(s.location)}</span>`:''}${s.note?`<span>📝 ${esc(s.note)}</span>`:''}</div></div>`;
}
function renderShifts(){
  const sorted=[...teamShifts].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  const grouped={};sorted.forEach(s=>(grouped[s.date]??=[]).push(s));
  $('#shiftList').innerHTML=Object.entries(grouped).map(([d,l])=>`<div class="team-day"><h3>${new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'})}</h3>${l.map(shiftCard).join('')}</div>`).join('')||'<p class="muted">Noch keine Dienste eingetragen.</p>';
}
function personMatches(owner,p){
  if(!owner)return false;
  const o=owner.toLowerCase(),q=p.toLowerCase();
  return o.includes(q)||o.includes('alle')||o.includes('aktive')||o.includes('kerbeborsch & wuzzemädels');
}
function timeSort(t){
  const x=String(t||'');
  return /^\d\d:\d\d$/.test(x)?x:'99:99';
}
function timelineCard(x){
  let meta=[];
  if(x.location)meta.push('📍 '+esc(x.location));
  if(x.clothes)meta.push('👕 '+esc(x.clothes));
  if(x.note)meta.push('📝 '+esc(x.note));
  if(x.end)meta.push('bis '+esc(x.end)+' Uhr');
  return `<div class="timeline-item"><div class="timeline-time">${esc(x.time||x.start||'—')}</div><div class="timeline-dot"></div><div class="timeline-content"><b>${esc(x.title||x.activity)}</b>${meta.length?`<small>${meta.join(' · ')}</small>`:''}<small class="timeline-badge">${esc(x.kind)}</small></div></div>`;
}
function buildPersonalItems(p){
  const q=p.toLowerCase(),out=[];
  internalEvents().filter(t=>personMatches(t.owner,p)).forEach(t=>out.push({...t,kind:'Termin'}));
  teamShifts.filter(t=>personMatches(t.owner,p)).forEach(t=>out.push({...t,time:t.start,kind:'Dienst'}));
  teamTasks.filter(t=>personMatches(t.owner,p)).forEach(t=>out.push({...t,title:t.activity,kind:t.phase}));
  customTasks.filter(t=>personMatches(t.owner,p)).forEach(t=>out.push({...t,activity:t.title,kind:'Aufgabe'}));
  return out.sort((a,b)=>(a.date+timeSort(a.time||a.start)).localeCompare(b.date+timeSort(b.time||b.start)));
}
function renderPersonalTimeline(p){
  const items=buildPersonalItems(p);
  const grouped={};items.forEach(x=>(grouped[x.date||'ohne']??=[]).push(x));
  const now=Date.now();
  const next=items.find(x=>x.date&&/^\d\d:\d\d$/.test(x.time||x.start||'')&&new Date(`${x.date}T${x.time||x.start}:00+02:00`).getTime()>=now);
  if(next){
    $('#myNextCard').classList.remove('hidden');
    $('#myNextCard').innerHTML=`<small>ALS NÄCHSTES FÜR DICH</small><b>${esc(next.title||next.activity)}</b><span>${new Date(next.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'})} · ${esc(next.time||next.start)} Uhr${next.location?' · '+esc(next.location):''}</span>`;
  }else $('#myNextCard').classList.add('hidden');
  $('#myTasks').innerHTML=items.length?Object.entries(grouped).map(([d,l])=>`<div class="timeline-day"><h3>${d==='ohne'?'Ohne Termin':new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'})}</h3>${l.map(timelineCard).join('')}</div>`).join(''):'<p class="muted">Aktuell nichts direkt zugeordnet.</p>';
}
function renderMine(){const p=$('#personFilter').value;if(!p){$('#myNextCard')?.classList.add('hidden');$('#myTasks').innerHTML='<p class="muted">Wähle deinen Namen aus. Danach bekommst du deinen persönlichen Ablauf chronologisch angezeigt.</p>';return}teamName=p;localStorage.setItem('teamName',p);renderPersonalTimeline(p)}
window.setTeamStatus=async(id,status)=>{const d=await teamApi('/team-status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,status,by:teamName||'Team'})});teamStatuses=d.statuses||{};renderTeam();renderOverview()}
window.setCustomTaskStatus=async(id,status)=>{const d=await teamApi('/team-tasks-live',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id,status,by:teamName||'Team'})});customTasks=d.tasks||[];renderCustomTasks();populateTeamFilters();renderMine();renderOverview()}
$('#teamLoginBtn').onclick=async()=>{teamPinVal=$('#teamPin').value;try{await teamApi('/team-check');sessionStorage.setItem('teamPin',teamPinVal);$('#teamGate').classList.add('hidden');$('#teamArea').classList.remove('hidden');loadTeamTasks()}catch{toast('Team-PIN falsch')}};
if(teamPinVal){teamApi('/team-check').then(()=>{$('#teamGate').classList.add('hidden');$('#teamArea').classList.remove('hidden');loadTeamTasks()}).catch(()=>sessionStorage.removeItem('teamPin'))}
$$('.team-tabs button').forEach(b=>b.onclick=()=>{$$('.team-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.team-subview').forEach(x=>x.classList.add('hidden'));const map={overview:'#teamOverviewView',dates:'#teamDatesView',shifts:'#teamShiftsView',tasks:'#teamTasksView',build:'#teamBuildView',mine:'#teamMineView'};$(map[b.dataset.teamtab]).classList.remove('hidden');if(b.dataset.teamtab==='mine')renderMine()});
$('#phaseFilter').onchange=renderTeam;$('#dayFilter').onchange=renderTeam;$('#personFilter').onchange=renderMine;
$('#toggleTaskForm').onclick=()=>$('#newTeamTaskForm').classList.toggle('hidden');
$('#newTeamTaskForm').onsubmit=async e=>{e.preventDefault();const body={title:$('#newTaskTitle').value.trim(),date:$('#newTaskDate').value,time:$('#newTaskTime').value,owner:$('#newTaskOwner').value.trim(),note:$('#newTaskNote').value.trim(),createdBy:teamName||'Team'};if(!body.title)return;const d=await teamApi('/team-tasks-live',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});customTasks=d.tasks||[];e.target.reset();e.target.classList.add('hidden');renderCustomTasks();populateTeamFilters();renderMine();renderOverview();toast('Aufgabe gespeichert')};

$('#internalDayFilter').onchange=renderInternalDates;
$('#toggleDateForm').onclick=()=>$('#newTeamDateForm').classList.toggle('hidden');
$('#newTeamDateForm').onsubmit=async e=>{e.preventDefault();const body={title:$('#newDateTitle').value.trim(),date:$('#newDateDate').value,time:$('#newDateTime').value,owner:$('#newDateOwner').value.trim(),location:$('#newDateLocation').value.trim(),note:$('#newDateNote').value.trim(),createdBy:teamName||'Team'};const d=await teamApi('/team-dates-live',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});internalDatesLive=d.dates||[];e.target.reset();e.target.classList.add('hidden');renderInternalDates();renderOverview();renderMine();toast('Termin gespeichert')};

$('#toggleShiftForm')?.addEventListener('click',()=>$('#newShiftForm').classList.toggle('hidden'));
$('#newShiftForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const body={title:$('#newShiftTitle').value.trim(),date:$('#newShiftDate').value,start:$('#newShiftStart').value,end:$('#newShiftEnd').value,owner:$('#newShiftOwner').value.trim(),location:$('#newShiftLocation').value.trim(),note:$('#newShiftNote').value.trim(),createdBy:teamName||'Team'};
  const d=await teamApi('/team-shifts-live',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  teamShifts=d.shifts||[];e.target.reset();e.target.classList.add('hidden');renderShifts();populateTeamFilters();renderMine();toast('Dienst gespeichert');
});
