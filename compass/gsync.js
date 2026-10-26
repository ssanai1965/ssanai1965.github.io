/* 나의 컴퍼스 — 구글 동기화
   ① 플래너 → 구글 캘린더(역할별 캘린더)  ③ 기기 간 플래너 동기화(구글 드라이브 앱 전용 보관함)
   기록은 이 기기와 사용자 본인의 구글 계정 사이에서만 오간다. */
(function(){
"use strict";
var CLIENT_ID="588259890959-d3485nbk5ipacn0rn3r4ei6pov6c56ir.apps.googleusercontent.com";
var SCOPES="https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/drive.appdata";
var ROLE_CAL_ALIASES={"직장인":["직장인","Work"]};
var ACTIVE={todo:1,progress:1,delegated:1};
var SYNC_FILE="compass-sync.json";
var RECOVERY="compass-device-recovery-v2";
var token=null,tokenExp=0,tokenClient=null,running=false;

/* ---------- IndexedDB helpers ---------- */
function openDb(name,ver,up){return new Promise(function(res,rej){var r=indexedDB.open(name,ver);if(up)r.onupgradeneeded=function(){up(r.result)};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});}
function plannerDb(){return openDb("my-compass-device-v2",1,function(d){d.createObjectStore("records",{keyPath:"id"})});}
function syncDb(){return openDb("compass-gsync-v1",1,function(d){d.createObjectStore("kv")});}
function reqP(r){return new Promise(function(res,rej){r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});}
async function kvGet(k){var d=await syncDb();try{return await reqP(d.transaction("kv").objectStore("kv").get(k))}finally{d.close()}}
async function kvSet(k,v){var d=await syncDb();try{var tx=d.transaction("kv","readwrite");tx.objectStore("kv").put(v,k);await new Promise(function(res,rej){tx.oncomplete=res;tx.onerror=function(){rej(tx.error)}})}finally{d.close()}}
async function readLocal(){var d=await plannerDb();try{return await reqP(d.transaction("records").objectStore("records").getAll())}finally{d.close()}}
/* 앱과 같은 규칙(버전 확인 후 +1)으로 기록. 버전이 다르면(그 사이 앱이 저장) 건너뜀 */
async function writeLocal(list){if(!list.length)return 0;var d=await plannerDb(),n=0;try{var tx=d.transaction("records","readwrite"),s=tx.objectStore("records");
 list.forEach(function(item){var g=s.get(item.e.id);g.onsuccess=function(){var cur=g.result;if((cur?cur.version||0:0)!==item.expect)return;s.put(Object.assign({},item.e,{version:(cur?cur.version||0:0)+1}));n++}});
 await new Promise(function(res,rej){tx.oncomplete=res;tx.onerror=function(){rej(tx.error)};tx.onabort=function(){rej(tx.error)}})}finally{d.close()}
 try{var ch=new BroadcastChannel("my-compass-device");ch.postMessage("saved");ch.close()}catch(e){}return n;}
function pendingIds(){try{var c=JSON.parse(localStorage.getItem(RECOVERY)||"null");return c&&c.dirty?c.dirty:{}}catch(e){return{}}}

/* ---------- hashing ---------- */
function stable(v){if(v===null||typeof v!=="object")return JSON.stringify(v);if(Array.isArray(v))return"["+v.map(stable).join(",")+"]";return"{"+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+":"+stable(v[k])}).join(",")+"}"}
function h(s){var x=5381,y=52711;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);x=(x*33)^c;y=(y*33)^c}return(x>>>0).toString(36)+(y>>>0).toString(36)}
function entHash(e){return e?h(stable({k:e.kind,d:e.data,x:!!e.deleted})):""}

/* ---------- auth ---------- */
function loadGis(){if(window.google&&google.accounts&&google.accounts.oauth2)return Promise.resolve();return new Promise(function(res,rej){var s=document.getElementById("gis-script");if(!s){s=document.createElement("script");s.id="gis-script";s.src="https://accounts.google.com/gsi/client";s.async=true;document.head.appendChild(s)}s.addEventListener("load",function(){res()});s.addEventListener("error",function(){rej(new Error("gis"))})})}
function tokenValid(){return token&&Date.now()<tokenExp-60000}
function getToken(){return new Promise(function(res,rej){
 if(tokenValid())return res(token);
 if(!(window.google&&google.accounts&&google.accounts.oauth2))return rej(new Error("구글 로그인 모듈을 불러오지 못했어요. 인터넷 연결을 확인해 주세요."));
 tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:function(r){
  if(r&&r.access_token&&google.accounts.oauth2.hasGrantedAllScopes(r,"https://www.googleapis.com/auth/calendar.events","https://www.googleapis.com/auth/drive.appdata")){token=r.access_token;tokenExp=Date.now()+(+r.expires_in||3600)*1000;try{localStorage.setItem("compass-gsync-consented","1")}catch(e){}res(token)}
  else rej(new Error("구글 권한이 허용되지 않았어요. 모든 항목을 허용해 주세요."))},
  error_callback:function(e){rej(new Error(e&&e.type==="popup_closed"?"로그인 창이 닫혔어요.":"구글 로그인 창을 열지 못했어요."))}});
 var consented=false;try{consented=localStorage.getItem("compass-gsync-consented")==="1"}catch(e){}
 tokenClient.requestAccessToken({prompt:consented?"":"consent"});
});}
async function api(method,url,body,raw){
 var opt={method:method,headers:{Authorization:"Bearer "+token}};
 if(body!==undefined){if(raw){opt.body=body.data;opt.headers["Content-Type"]=body.type}else{opt.body=JSON.stringify(body);opt.headers["Content-Type"]="application/json"}}
 for(var i=0;;i++){var r=await fetch(url,opt),retry=r.status===429||r.status>=500;
  if(!retry&&r.status===403){try{retry=(await r.clone().text()).indexOf("ateLimit")>=0}catch(e){}}
  if(retry&&i<3){await new Promise(function(z){setTimeout(z,800*(i+1))});continue}return r}
}
async function apiJson(method,url,body,raw){var r=await api(method,url,body,raw);if(!r.ok){var t="";try{t=await r.text()}catch(e){}var err=new Error("Google API "+r.status+" "+t.slice(0,160));err.status=r.status;throw err}return r.status===204?null:r.json()}

/* ---------- ③ 기기 간 동기화 (Drive appDataFolder) ---------- */
var DRIVE="https://www.googleapis.com/drive/v3/files",UP="https://www.googleapis.com/upload/drive/v3/files";
async function driveFind(){var q=encodeURIComponent("name='"+SYNC_FILE+"'");var j=await apiJson("GET",DRIVE+"?spaces=appDataFolder&q="+q+"&fields=files(id,modifiedTime)&orderBy=modifiedTime desc");return j.files&&j.files[0]||null}
async function driveRead(id){var r=await api("GET",DRIVE+"/"+id+"?alt=media");if(!r.ok)throw new Error("드라이브 파일을 읽지 못했어요 ("+r.status+")");return r.json()}
async function driveWrite(id,obj){var data=JSON.stringify(obj);
 if(id)return apiJson("PATCH",UP+"/"+id+"?uploadType=media",{data:data,type:"application/json"},true);
 var b="compassBoundary"+Date.now(),meta=JSON.stringify({name:SYNC_FILE,parents:["appDataFolder"]});
 var multipart="--"+b+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+meta+"\r\n--"+b+"\r\nContent-Type: application/json\r\n\r\n"+data+"\r\n--"+b+"--";
 return apiJson("POST",UP+"?uploadType=multipart",{data:multipart,type:"multipart/related; boundary="+b},true)}
/* 3-way 병합: base=지난 동기화 때의 해시. 한쪽만 바뀌면 바뀐 쪽, 양쪽 다 바뀌면 이 기기 쪽 */
function merge(localList,remoteList,base){
 var L={},R={},ids={},out={},takeRemote=[],remoteNeedsUpdate=false;
 localList.forEach(function(e){L[e.id]=e;ids[e.id]=1});remoteList.forEach(function(e){R[e.id]=e;ids[e.id]=1});
 Object.keys(ids).forEach(function(id){var l=L[id],r=R[id],hl=entHash(l),hr=entHash(r),b=base[id];
  if(!r){out[id]=l;remoteNeedsUpdate=true;return}
  if(!l){out[id]=r;takeRemote.push(r);return}
  if(hl===hr){out[id]=l;return}
  var lc=hl!==b,rc=hr!==b;
  if(rc&&!lc){out[id]=r;takeRemote.push(r)}else{out[id]=l;remoteNeedsUpdate=true}});
 return{merged:out,takeRemote:takeRemote,remoteNeedsUpdate:remoteNeedsUpdate,L:L}}
async function syncDevices(){
 var pend=pendingIds();var local=await readLocal();
 Object.keys(pend).forEach(function(id){var p=pend[id];var i=local.findIndex(function(e){return e.id===id});if(i>=0)local[i]=Object.assign({},local[i],{kind:p.kind,data:p.data,deleted:p.deleted});else local.push(p)});
 var file=await driveFind(),remote=[];if(file){var j=await driveRead(file.id);if(j&&j.format==="my-compass-sync"&&Array.isArray(j.records))remote=j.records}
 var base=(await kvGet("base"))||{};
 var m=merge(local,remote,base);
 var writes=m.takeRemote.filter(function(r){return!pend[r.id]}).map(function(r){var l=m.L[r.id];return{e:{id:r.id,kind:r.kind,data:r.data,deleted:!!r.deleted},expect:l?l.version||0:0}});
 var written=await writeLocal(writes);
 var mergedList=Object.keys(m.merged).map(function(id){var e=m.merged[id];return{id:e.id,kind:e.kind,data:e.data,deleted:!!e.deleted,version:e.version||0}});
 if(m.remoteNeedsUpdate||!file)await driveWrite(file&&file.id,{format:"my-compass-sync",version:1,updatedAt:new Date().toISOString(),records:mergedList});
 var nb={};mergedList.forEach(function(e){nb[e.id]=entHash(e)});await kvSet("base",nb);
 return{records:mergedList,pulled:written,pushed:m.remoteNeedsUpdate||!file}}

/* ---------- ① 캘린더로 보내기 ---------- */
var CAL="https://www.googleapis.com/calendar/v3";
function eventId(taskId){var s=String(taskId).toLowerCase();if(/^[0-9a-f-]+$/.test(s))return"c"+s.replace(/-/g,"");var hex="";var b=new TextEncoder().encode(String(taskId));for(var i=0;i<b.length;i++)hex+=(b[i]<16?"0":"")+b[i].toString(16);return"c"+hex}
function nextDay(d){var p=d.split("-"),x=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+1));return x.toISOString().slice(0,10)}
function plusHour(d,t){var p=d.split("-"),q=t.split(":"),x=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],+q[0]+1,+q[1]));return x.toISOString().slice(0,10)+"T"+x.toISOString().slice(11,16)+":00"}
function eventBody(e,roleName){var t=e.data,desc=["우선순위 "+(t.priority||"")+" · "+roleName];if(t.notes)desc.push(t.notes);desc.push("— 나의 컴퍼스에서 동기화");
 var b={summary:t.title||"(제목 없음)",description:desc.join("\n"),status:"confirmed",extendedProperties:{private:{compass:"1",taskId:e.id}}};
 if(/^\d{2}:\d{2}$/.test(t.time||"")){b.start={dateTime:t.date+"T"+t.time+":00",timeZone:"Asia/Seoul"};b.end={dateTime:plusHour(t.date,t.time),timeZone:"Asia/Seoul"}}
 else{b.start={date:t.date};b.end={date:nextDay(t.date)}}return b}
async function calendarMap(roles){var j=await apiJson("GET",CAL+"/users/me/calendarList?minAccessRole=writer&maxResults=250"),byName={},primary=null;
 (j.items||[]).forEach(function(c){var n=(c.summaryOverride||c.summary||"").trim();if(!byName[n])byName[n]=c.id;if(c.primary)primary=c.id});
 var map={},missing=[];Object.keys(roles).forEach(function(rid){var name=roles[rid],names=ROLE_CAL_ALIASES[name]||[name],cid=null;for(var i=0;i<names.length&&!cid;i++)cid=byName[names[i]]||null;if(!cid){cid=primary||"primary";missing.push(name)}map[rid]=cid});
 return{map:map,missing:missing}}
async function pool(items,n,fn){var i=0,errs=[];async function w(){while(i<items.length){var it=items[i++];try{await fn(it)}catch(e){errs.push(e)}}}var ws=[];for(var k=0;k<n;k++)ws.push(w());await Promise.all(ws);return errs}
async function pushCalendar(records){
 var roles={};records.forEach(function(e){if(e.kind==="role"&&!e.deleted)roles[e.id]=e.data.name});
 var cm=await calendarMap(roles),state=(await kvGet("cal"))||{},jobs=[],stat={up:0,del:0};
 records.forEach(function(e){if(e.kind!=="task")return;var t=e.data||{},want=!e.deleted&&ACTIVE[t.status]&&/^\d{4}-\d{2}-\d{2}$/.test(t.date||"")&&roles[t.roleId];
  var prev=state[e.id];
  if(want){var cal=cm.map[t.roleId],body=eventBody(e,roles[t.roleId]),hh=h(stable({c:cal,b:body}));if(prev&&prev.h===hh)return;jobs.push({kind:"up",e:e,cal:cal,body:body,hh:hh,prev:prev})}
  else if(prev){jobs.push({kind:"del",e:e,prev:prev})}});
 var errs=await pool(jobs,4,async function(j){var id=eventId(j.e.id);
  if(j.kind==="del"){var r=await api("DELETE",CAL+"/calendars/"+encodeURIComponent(j.prev.cal)+"/events/"+id);if(!(r.ok||r.status===404||r.status===410))throw new Error("삭제 실패 "+r.status);delete state[j.e.id];stat.del++;return}
  if(j.prev&&j.prev.cal!==j.cal){var d=await api("DELETE",CAL+"/calendars/"+encodeURIComponent(j.prev.cal)+"/events/"+id);if(!(d.ok||d.status===404||d.status===410))throw new Error("이동 실패 "+d.status)}
  var url=CAL+"/calendars/"+encodeURIComponent(j.cal)+"/events/"+id;var r2=await api("PUT",url,j.body);
  if(r2.status===404){var b=Object.assign({id:id},j.body);r2=await api("POST",CAL+"/calendars/"+encodeURIComponent(j.cal)+"/events",b)}
  if(!r2.ok)throw new Error("일정 저장 실패 "+r2.status);state[j.e.id]={cal:j.cal,h:j.hh};stat.up++});
 await kvSet("cal",state);stat.errors=errs.length;stat.missing=cm.missing;stat.firstError=errs[0]&&errs[0].message;return stat}

/* ---------- 실행·UI ---------- */
function toast(msg,ms){var n=document.getElementById("ics-toast");if(!n){n=document.createElement("div");n.id="ics-toast";n.setAttribute("role","status");n.style.cssText="position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#314e46;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;z-index:99999;max-width:90vw;box-shadow:0 6px 20px rgba(0,0,0,.25);white-space:pre-line";document.body.appendChild(n)}n.textContent=msg;n.style.display="block";clearTimeout(n._t);n._t=setTimeout(function(){n.style.display="none"},ms||5000)}
function setLast(){try{localStorage.setItem("compass-gsync-last",new Date().toISOString())}catch(e){}updateLabel()}
function lastText(){try{var v=localStorage.getItem("compass-gsync-last");if(!v)return"아직 동기화하지 않았어요";var d=new Date(v);return"최근 동기화: "+d.toLocaleString("ko-KR",{timeZone:"Asia/Seoul",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return""}}
function updateLabel(){var s=document.querySelector("#gsync-btn small");if(s)s.textContent="기기 간 동기화 + 역할별 구글 캘린더로 보내기 · "+lastText()}
async function runAfterToken(){
 running=true;var btn=document.getElementById("gsync-btn");if(btn)btn.style.opacity=".6";toast("구글과 동기화 중…",60000);
 try{
  var flushBtn=[].slice.call(document.querySelectorAll("button")).find(function(b){return b.textContent.trim()==="지금 저장"});if(flushBtn)flushBtn.click();
  await new Promise(function(z){setTimeout(z,600)});
  var d=await syncDevices();var c=await pushCalendar(d.records);setLast();
  var msg="동기화 완료\n· 다른 기기에서 가져온 기록 "+d.pulled+"건\n· 캘린더 반영 "+c.up+"건, 삭제 "+c.del+"건";
  if(c.missing.length)msg+="\n· 같은 이름의 캘린더가 없어 기본 캘린더에 넣은 역할: "+c.missing.join(", ");
  if(c.errors)msg+="\n· 실패 "+c.errors+"건 (다시 동기화하면 재시도): "+(c.firstError||"");
  toast(msg,9000);
 }catch(err){if(err&&err.status===401){token=null}toast("동기화하지 못했어요.\n"+(err&&err.message||""),9000)}
 finally{running=false;if(btn)btn.style.opacity=""}}
function start(){if(running)return;if(!navigator.onLine){toast("인터넷에 연결된 상태에서 동기화할 수 있어요.");return}
 if(tokenValid()){runAfterToken();return}
 loadGis().then(function(){return getToken()}).then(runAfterToken).catch(function(e){toast(e.message||"구글 로그인에 실패했어요.",7000)});}
function startFromGesture(){ /* 로그인 창은 클릭 직후 열어야 차단되지 않음 */
 if(running)return;if(!navigator.onLine){toast("인터넷에 연결된 상태에서 동기화할 수 있어요.");return}
 if(tokenValid()){runAfterToken();return}
 if(window.google&&google.accounts&&google.accounts.oauth2){getToken().then(runAfterToken).catch(function(e){toast(e.message,7000)});return}
 start()}
function inject(){var btns=document.querySelectorAll("button.backup-action");if(!btns.length||document.getElementById("gsync-btn"))return;var first=null;btns.forEach(function(b){if(!first&&b.textContent.indexOf("iCloud Drive로")>=0)first=b});if(!first)first=btns[0];
 var head=document.createElement("h4");head.id="gsync-head";head.textContent="구글 동기화";
 var b=first.cloneNode(true);b.id="gsync-btn";b.type="button";var st=b.querySelector("strong"),sm=b.querySelector("small");if(st)st.textContent="구글과 동기화하기";if(sm)sm.textContent="";
 b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();startFromGesture()});
 var anchor=first;while(anchor.previousElementSibling&&anchor.previousElementSibling.tagName!=="H4")anchor=anchor.previousElementSibling;var h4=anchor.previousElementSibling;var parent=first.parentNode;
 parent.insertBefore(head,h4||first);parent.insertBefore(b,h4||first);updateLabel();}
new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true});
if(navigator.onLine)setTimeout(function(){loadGis().catch(function(){})},1500);
window.__compassSync={merge:merge,eventId:eventId,eventBody:eventBody,entHash:entHash,syncDevices:syncDevices,pushCalendar:pushCalendar,_setToken:function(t){token=t;tokenExp=Date.now()+3600000}};
})();
