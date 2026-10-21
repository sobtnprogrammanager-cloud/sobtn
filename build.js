// Runs on Netlify before publishing: turns /content/*.md into page HTML (no dependencies).
const fs=require('fs'),path=require('path');
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function read(dir){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>{
  const raw=fs.readFileSync(path.join(dir,f),'utf8').replace(/\r/g,'');const m=raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);if(!m)return null;
  const d={};m[1].split('\n').forEach(l=>{const k=l.match(/^(\w+):\s*(.*)$/);if(k)d[k[1]]=k[2].trim().replace(/^(["'])(.*)\1$/,'$2')});d.body=m[2].trim();return d}).filter(d=>d&&d.title&&d.date)}
function md(s){return s.split(/\n{2,}/).map(p=>'<p>'+esc(p).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" rel="noopener">$1</a>').replace(/\n/g,'<br>')+'</p>').join('')}
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],day=s=>s.slice(8,10).replace(/^0/,''),mon=s=>M[+s.slice(5,7)-1],full=s=>`${day(s)} ${mon(s)} ${s.slice(0,4)}`;
const today=new Date(Date.now()+5.5*36e5).toISOString().slice(0,10);
const ev=read('content/events').filter(e=>(e.end_date||e.date)>=today).sort((a,b)=>a.date.localeCompare(b.date));
const ps=read('content/posts').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,9);
const evH=ev.length?ev.map(e=>`<li class="e" data-end="${esc(e.end_date||e.date)}"><time datetime="${esc(e.date)}">${day(e.date)}<small>${mon(e.date)}</small></time><div><h4>${esc(e.title)}</h4><div class="m">${e.end_date&&e.end_date!==e.date?full(e.date)+' – '+full(e.end_date):full(e.date)}${e.location?' · '+esc(e.location):''}</div>${e.body?md(e.body):''}${/^https?:/.test(e.link||'')?`<a class="btn" href="${esc(e.link)}" rel="noopener">Register / learn more</a>`:''}</div></li>`).join(''):'<li class="none">No upcoming events right now. Please check back soon.</li>';
const blH=ps.map(p=>`<li class="post">${p.image?`<img src="${esc(p.image.replace(/^\//,""))}" alt="${esc(p.title)}" loading="lazy" decoding="async">`:''}<div><time datetime="${esc(p.date)}">${full(p.date)}</time><h4>${esc(p.title)}</h4>${p.summary?`<p>${esc(p.summary)}</p>`:''}${p.body?`<details><summary>Read more</summary>${md(p.body)}</details>`:''}</div></li>`).join('');
const ld=JSON.stringify(ev.map(e=>({'@context':'https://schema.org','@type':'Event',name:e.title,startDate:e.date,endDate:e.end_date||e.date,eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',location:{'@type':'Place',name:e.location||'Tamil Nadu',address:e.location||'Tamil Nadu, India'},organizer:{'@type':'Organization',name:'Special Olympics Bharat – Tamil Nadu'}}))).replace(/</g,'\\u003c');
let h=fs.readFileSync('index.html','utf8');const sw=(t,v)=>h=h.replace(new RegExp(`<!--${t}-->[\\s\\S]*?<!--/${t}-->`),`<!--${t}-->${v}<!--/${t}-->`);

const MJ=fs.existsSync('content/medals.json')?JSON.parse(fs.readFileSync('content/medals.json','utf8')):null;let mdH=null,inH=null;
if(MJ){const n=MJ.national||{},g=+n.gold||0,s=+n.silver||0,z=+n.bronze||0,L=esc(n.label||'National-level competitions');
mdH=`<div class="medals rv" role="img" aria-label="Medals won at ${L}: ${g} gold, ${s} silver, ${z} bronze"><div class="disc d1"><div><strong data-n="${g}">0</strong><small>Gold</small></div></div><div class="disc d2"><div><strong data-n="${s}">0</strong><small>Silver</small></div></div><div class="disc d3"><div><strong data-n="${z}">0</strong><small>Bronze</small></div></div><p class="cap">${L} · ${g+s+z} medals</p></div>`;
const T={gold:'Gold',silver:'Silver',bronze:'Bronze'};
inH=(MJ.international||[]).map(a=>{const ms=a.medals||[];return `<li class="ic2 rv"><h3>${esc(a.name)}</h3><div class="m">${esc(a.competition)}<br>${esc(a.venue)}${a.dates?' · '+esc(a.dates):''}</div>${ms.map(x=>`<div class="mm"><span><i class="dot ${esc(x.type)}"></i>${T[x.type]||esc(x.type)}</span><span>${esc(x.event)}</span></div>`).join('')}</li>`}).join('');}
sw('EV',evH);if(mdH)sw('MD',mdH);if(inH!==null)sw('IN',inH);sw('BL',blH);sw('LD',ld);fs.writeFileSync('index.html',h);console.log(`events: ${ev.length}, posts: ${ps.length}`);
