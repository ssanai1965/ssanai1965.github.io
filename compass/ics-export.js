/* 나의 컴퍼스 — 캘린더(.ics) 내보내기 (읽기 전용: 플래너 기록은 수정하지 않음) */
(function(){
"use strict";
var STATUS_OK={todo:1,progress:1,delegated:1};
function openDb(name,ver,up){return new Promise(function(res,rej){var r=indexedDB.open(name,ver);if(up)r.onupgradeneeded=function(){up(r.result)};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});}
function getAll(db,store){return new Promise(function(res,rej){var r=db.transaction(store,"readonly").objectStore(store).getAll();r.onsuccess=function(){res(r.result||[])};r.onerror=function(){rej(r.error)}});}
function putIds(db,ids){return new Promise(function(res,rej){var tx=db.transaction("exported","readwrite"),s=tx.objectStore("exported"),at=new Date().toISOString();ids.forEach(function(id){s.put({id:id,at:at})});tx.oncomplete=function(){res()};tx.onerror=function(){rej(tx.error)}});}
function clearIds(db){return new Promise(function(res,rej){var tx=db.transaction("exported","readwrite");tx.objectStore("exported").clear();tx.oncomplete=function(){res()};tx.onerror=function(){rej(tx.error)}});}
function exportDb(){return openDb("compass-ics-v1",1,function(d){d.createObjectStore("exported",{keyPath:"id"})});}
function plannerRecords(){return openDb("my-compass-device-v2",1,function(d){d.createObjectStore("records",{keyPath:"id"})}).then(function(db){return getAll(db,"records").then(function(r){db.close();return r})});}
function esc(t){return String(t||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");}
function fold(line){var out=[],cur="",n=0;for(var i=0;i<line.length;i++){var ch=line[i],b=new TextEncoder().encode(ch).length;if(n+b>73){out.push(cur);cur=" ";n=1}cur+=ch;n+=b}out.push(cur);return out.join("\r\n");}
function pad(n){return(n<10?"0":"")+n}
function utcStamp(d){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+"T"+pad(d.getUTCHours())+pad(d.getUTCMinutes())+"00Z"}
function kst(date,time){var p=date.split("-"),t=time.split(":");return new Date(Date.UTC(+p[0],+p[1]-1,+p[2],+t[0]-9,+t[1]));}
function nextDay(date){var p=date.split("-"),d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+1));return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate());}
function buildIcs(tasks,roles,calName){var now=utcStamp(new Date()),L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//My Compass Planner//KO","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:"+esc(calName||"나의 컴퍼스")];
 tasks.forEach(function(e){var t=e.data,role=roles[t.roleId]||"",title=t.title;L.push("BEGIN:VEVENT","UID:"+e.id+"@compass-planner","DTSTAMP:"+now);
  if(/^\d{2}:\d{2}$/.test(t.time||"")){var s=kst(t.date,t.time);L.push("DTSTART:"+utcStamp(s),"DTEND:"+utcStamp(new Date(s.getTime()+3600000)));}
  else L.push("DTSTART;VALUE=DATE:"+t.date.replace(/-/g,""),"DTEND;VALUE=DATE:"+nextDay(t.date));
  L.push("SUMMARY:"+esc(title));var desc=["우선순위 "+(t.priority||"")+(role?" · "+role:"")];if(t.notes)desc.push(t.notes);L.push("DESCRIPTION:"+esc(desc.join("\n")),"END:VEVENT");});
 L.push("END:VCALENDAR");return L.map(fold).join("\r\n")+"\r\n";}
function todayKst(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
function toast(msg){var n=document.getElementById("ics-toast");if(!n){n=document.createElement("div");n.id="ics-toast";n.setAttribute("role","status");n.style.cssText="position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#314e46;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;z-index:99999;max-width:90vw;box-shadow:0 6px 20px rgba(0,0,0,.25)";document.body.appendChild(n)}n.textContent=msg;n.style.display="block";clearTimeout(n._t);n._t=setTimeout(function(){n.style.display="none"},4500);}
async function collect(){var recs=await plannerRecords(),roles={};recs.forEach(function(e){if(e.kind==="role"&&!e.deleted)roles[e.id]=e.data.name});
 var edb=await exportDb(),done={};(await getAll(edb,"exported")).forEach(function(x){done[x.id]=1});
 var tasks=recs.filter(function(e){return e.kind==="task"&&!e.deleted&&e.data&&/^\d{4}-\d{2}-\d{2}$/.test(e.data.date||"")&&STATUS_OK[e.data.status]&&!done[e.id]});
 tasks.sort(function(a,b){return(a.data.date+(a.data.time||"")).localeCompare(b.data.date+(b.data.time||""))});return{tasks:tasks,roles:roles,edb:edb};}
async function run(){try{var c=await collect();if(!c.tasks.length){c.edb.close();toast("새로 내보낼 일정이 없어요.");return}
 var groups={},order=[];c.tasks.forEach(function(e){var r=c.roles[e.data.roleId]||"기타";if(!groups[r]){groups[r]=[];order.push(r)}groups[r].push(e)});
 var files=order.map(function(r){var name="나의컴퍼스-"+r+"-"+todayKst()+".ics",blob=new Blob([buildIcs(groups[r],c.roles,r)],{type:"text/calendar;charset=utf-8"});return{name:name,blob:blob,file:new File([blob],name,{type:"text/calendar"})}});
 var shared=false,fl=files.map(function(f){return f.file});
 if(navigator.canShare&&navigator.canShare({files:fl})&&navigator.share){try{await navigator.share({files:fl,title:"나의 컴퍼스 일정"});shared=true}catch(err){if(err&&err.name==="AbortError"){c.edb.close();return}}}
 if(!shared){for(var i=0;i<files.length;i++){var u=URL.createObjectURL(files[i].blob),a=document.createElement("a");a.href=u;a.download=files[i].name;document.body.appendChild(a);a.click();a.remove();(function(x){setTimeout(function(){URL.revokeObjectURL(x)},6000)})(u);await new Promise(function(z){setTimeout(z,400)})}}
 await putIds(c.edb,c.tasks.map(function(e){return e.id}));c.edb.close();toast(c.tasks.length+"개 일정을 역할별 "+files.length+"개 파일("+order.join("·")+")로 보냈어요.");}catch(err){toast("캘린더 파일을 만들지 못했어요.")}}
async function reset(){if(!confirm("내보내기 기록을 지울까요? 다음 내보내기에 완료 전 모든 일정이 다시 포함돼요(캘린더에 중복될 수 있어요)."))return;try{var d=await exportDb();await clearIds(d);d.close();toast("내보내기 기록을 지웠어요.")}catch(e){toast("기록을 지우지 못했어요.")}}
function inject(){var btns=document.querySelectorAll("button.backup-action");if(!btns.length||document.getElementById("ics-export-btn"))return;var csv=null;btns.forEach(function(b){if(b.textContent.indexOf("CSV")>=0)csv=b});if(!csv)return;
 var b=csv.cloneNode(true);b.id="ics-export-btn";b.type="button";var st=b.querySelector("strong"),sm=b.querySelector("small");if(st)st.textContent="캘린더로 내보내기 (.ics)";if(sm)sm.textContent="역할별 파일 · 지난번 이후 새 일정만 · 완료 제외";b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();run()});
 var r=document.createElement("button");r.id="ics-reset-btn";r.type="button";r.className="text-button";r.textContent="캘린더 내보내기 기록 초기화";r.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();reset()});
 csv.parentNode.insertBefore(b,csv.nextSibling);b.parentNode.insertBefore(r,b.nextSibling);}
new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true});
window.__compassIcs={collect:collect,buildIcs:buildIcs};
})();
