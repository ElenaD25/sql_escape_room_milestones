(() => {
"use strict";
const $ = id => document.getElementById(id);
const puzzles = [
 {id:0,title:"The forgotten note",q:"Which query returns only IT employees?",opts:["SELECT * FROM employees WHERE department = 'IT';","SELECT department FROM employees;","SELECT * FROM employees;"],a:0,digit:"3"},
 {id:1,title:"The oldest book",q:"Which query returns the earliest published book?",opts:["ORDER BY published_date DESC","ORDER BY published_date ASC LIMIT 1","LIMIT 1"],a:1,digit:"1"},
 {id:2,title:"Connect the tables",q:"Which keyword matches rows from employees and departments?",opts:["WHERE","JOIN","HAVING"],a:1,digit:"4"},
 {id:3,title:"Missing timestamp",q:"How do you test for a NULL value?",opts:["= NULL","IS NULL","== NULL"],a:1,digit:"1"},
 {id:4,title:"Count experiments",q:"Which query counts rows in each experiment type?",opts:["COUNT(*) WITH experiment_type","COUNT(*) GROUP BY experiment_type","SELECT COUNT(DISTINCT experiment_type)"],a:1,digit:"5"},
 {id:5,title:"Remove duplicates",q:"Which keyword removes duplicate values?",opts:["DISTINCT","UNIQUE","ONLY"],a:0,digit:"9"},
 {id:6,title:"Filter groups",q:"Which clause filters aggregated groups?",opts:["WHERE","HAVING","ORDER BY"],a:1,digit:"2"},
 {id:7,title:"Clause order",q:"Which clause order is valid?",opts:["SELECT FROM WHERE","FROM WHERE GROUP BY HAVING SELECT ORDER BY","ORDER BY FROM WHERE"],a:1,digit:"6"},
 {id:8,title:"Keep customers",q:"Which join keeps every left-table row?",opts:["INNER JOIN","LEFT JOIN","CROSS JOIN"],a:1,digit:"5"},
 {id:9,title:"Classify records",q:"Which SQL expression creates conditional labels?",opts:["CASE WHEN ... END","IF GROUP BY","ORDER CASE"],a:0,digit:"3"},
 {id:10,title:"Unique customers",q:"How do you count distinct customer IDs?",opts:["COUNT(customer_id)","COUNT(*)","COUNT(DISTINCT customer_id)"],a:2,digit:"8"},
 {id:11,title:"Final archive query",q:"Which clause sorts a result by balance from highest to lowest?",opts:["ORDER BY balance ASC","ORDER BY balance DESC","SORT balance DESC"],a:1,digit:"2"}
];
let character="girl",playerName="Elly",room=0,lives=5,score=0;
let solved=new Set(),digits=Array(12).fill(""),position={x:.50,y:.78},facing={x:0,y:-1};
let keys={},nearObject=null,lastFrame=0,active=null,selected=null,gameEnded=false,paused=false;
let seconds=900,clock=null;
const rooms=[
 {id:"study",name:"The Study",bg:"assets/room_study.png",door:{x:.93,y:.31},objects:[{id:0,x:.19,y:.49},{id:1,x:.29,y:.22},{id:2,x:.68,y:.27},{id:3,x:.82,y:.59}]},
 {id:"lab",name:"The Lab",bg:"assets/room-lab.png",door:{x:.93,y:.23},objects:[{id:4,x:.18,y:.30},{id:5,x:.37,y:.67},{id:6,x:.70,y:.27},{id:7,x:.86,y:.63}]},
 {id:"archive",name:"The Archive",bg:"assets/room-archieve.png",door:{x:.08,y:.35},objects:[{id:8,x:.18,y:.27},{id:9,x:.73,y:.25},{id:10,x:.80,y:.67},{id:11,x:.43,y:.70}]}
];
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function toast(msg){$("toast").textContent=msg;$("toast").classList.remove("fade");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("fade"),3000);}
function renderObjects(){
 $("objects").innerHTML="";
 rooms[room].objects.forEach(o=>{
  const p=puzzles[o.id],b=document.createElement("button");b.className="game-object"+(solved.has(o.id)?" solved":"");b.dataset.id=o.id;b.style.left=(o.x*100)+"%";b.style.top=(o.y*100)+"%";
  b.innerHTML=`<span class="obj-icon">${solved.has(o.id)?"✓":"✦"}</span><span class="obj-label">${esc(p.title)}</span>`;
  b.onclick=()=>{const target=nearest();if(target?.id===o.id)openPuzzle(o.id);else toast("Move closer to the glowing object to interact.");};$("objects").appendChild(b);
 });
 const exit=rooms[room].door,roomComplete=rooms[room].objects.every(o=>solved.has(o.id));const door=document.createElement("button");door.className="game-object door-object"+(roomComplete?" ready":"");door.dataset.door="true";door.style.left=(exit.x*100)+"%";door.style.top=(exit.y*100)+"%";
 door.innerHTML=`<span class="obj-icon">🚪</span><span class="obj-label">${roomComplete?(room===2?"EXIT UNLOCKED":"GO TO EXIT"):room===2?"EXIT":"NEXT ROOM"}</span>`;door.onclick=()=>{const target=nearest();if(target?.id=== "door")interactDoor();else toast("Move closer to the glowing door to interact.");};$("objects").appendChild(door);
}
function placePlayer(){const p=$("player");p.style.left=(position.x*100)+"%";p.style.top=(position.y*100)+"%";p.style.scale=facing.x<-.1?"-1 1":"1 1";}
function isNear(o){return Math.hypot((o.x-position.x)*$("scene").clientWidth,(o.y-position.y)*$("scene").clientHeight)<115;}
function nearest(){
 let best=null,bestDistance=Infinity;
 rooms[room].objects.forEach(o=>{if(solved.has(o.id))return;const d=Math.hypot((o.x-position.x)*$("scene").clientWidth,(o.y-position.y)*$("scene").clientHeight);if(d<bestDistance&&isNear(o)){best=o;bestDistance=d;}});
 const door={...rooms[room].door,id:"door"};if(isNear(door))best=door;return best;
}
function updateNear(){
 nearObject=nearest();document.querySelectorAll(".game-object").forEach(b=>b.classList.toggle("near",nearObject&&(b.dataset.door?nearObject.id=== "door":+b.dataset.id===nearObject.id)));
 const prompt=$("prompt");if(nearObject){prompt.classList.add("show");prompt.style.left=(nearObject.x*100)+"%";prompt.style.top=(nearObject.y*100-4)+"%";}else prompt.classList.remove("show");
}
function loop(ts){
 const dt=Math.min((ts-lastFrame)/1000||0,.05);lastFrame=ts;let dx=0,dy=0;
 if(paused){requestAnimationFrame(loop);return;}
 if(keys.w||keys.ArrowUp)dy--;if(keys.s||keys.ArrowDown)dy++;if(keys.a||keys.ArrowLeft)dx--;if(keys.d||keys.ArrowRight)dx++;
 if(dx||dy){const n=Math.hypot(dx,dy);dx/=n;dy/=n;const speed=.35*dt;position.x=Math.max(.035,Math.min(.965,position.x+dx*speed));position.y=Math.max(.08,Math.min(.94,position.y+dy*speed));if(dx)facing={x:dx,y:dy};$("player").classList.add("walk");placePlayer();}else $("player").classList.remove("walk");
 updateNear();requestAnimationFrame(loop);
}
function setRoom(r){room=r;position={x:.50,y:.78};facing={x:0,y:-1};$("room-bg").src=rooms[r].bg;$("scene").className="scene room-"+rooms[r].id;$("scene-title").textContent=`ROOM ${r+1} · ${rooms[r].name}`;$("room-name-hud").textContent=rooms[r].name.toUpperCase();placePlayer();renderObjects();renderHUD();}
function renderHUD(){
 if($("inventory-count"))$("inventory-count").textContent=`${solved.size} / 12`;
 renderInventoryModal();
 $("lives").textContent="♥ ".repeat(lives).trim()+"♡ ".repeat(5-lives).trim();$("lives").setAttribute("aria-label",`${lives} lives`);$("progress").textContent=`${solved.size} / 12 CLUES`;
 renderRoomList();document.querySelectorAll(".map-room").forEach((el,i)=>el.classList.toggle("cleared",rooms[i].objects.every(o=>solved.has(o.id))));$("map-player").style.left=["17%","48%","79%"][room];
}
function renderRoomList(){const list=$("room-list");if(!list)return;list.innerHTML=rooms.map((r,i)=>{const done=r.objects.every(o=>solved.has(o.id));return `<div class="room-row${i===room?" active":""}${done?" cleared":""}"><span class="room-dot"></span><b>${r.name}</b><small>${done?"CLEARED":i===room?"CURRENT":"LOCKED"}</small></div>`;}).join("");}
function openPuzzle(id){
 if(solved.has(id))return;active=puzzles[id];selected=null;$("quiz-overlay").classList.remove("hidden");$("quiz-kicker").textContent=`SQL CHALLENGE ${String(id+1).padStart(2,"0")} / 12`;$("quiz-title").textContent=active.title;$("quiz-desc").textContent=active.q;$("quiz-feedback").textContent="";
 $("quiz-content").innerHTML=`<div class="options">${active.opts.map((v,i)=>`<button class="option" data-option="${i}"><b>${String.fromCharCode(65+i)}.</b><code>${esc(v)}</code></button>`).join("")}</div>`;
 document.querySelectorAll("[data-option]").forEach(b=>b.onclick=()=>{selected=+b.dataset.option;document.querySelectorAll("[data-option]").forEach(x=>x.classList.toggle("selected",x===b));});
 $("quiz-submit").textContent="Check answer";$("quiz-submit").disabled=false;$("quiz-submit").onclick=checkAnswer;
}
function checkAnswer(){
 if(selected===null){$("quiz-feedback").textContent="Choose an answer first.";$("quiz-feedback").className="quiz-feedback bad";return;}
 if(selected!==active.a){lives--;renderHUD();$("quiz-feedback").textContent="Incorrect answer. Try again!";$("quiz-feedback").className="quiz-feedback bad";$("player").classList.add("damage");setTimeout(()=>$("player").classList.remove("damage"),450);if(lives<=0)setTimeout(()=>endGame(false),500);return;}
 solved.add(active.id);digits[active.id]=active.digit;score+=100;renderHUD();$("quiz-content").innerHTML=`<div class="hint-box"><b>Correct! Digit ${active.digit}</b></div>`;$("quiz-feedback").textContent="A digit was added to your inventory.";$("quiz-feedback").className="quiz-feedback good";$("quiz-submit").textContent="Continue";$("quiz-submit").onclick=()=>{$("quiz-overlay").classList.add("hidden");renderObjects();if(rooms[room].objects.every(o=>solved.has(o.id)))toast(room===2?"All clues solved! Go to the highlighted exit door.":"Room complete! Go to the highlighted door to continue.");};
}
function interactDoor(){
 const current=rooms[room].objects;if(!current.every(o=>solved.has(o.id))){toast("Solve all four puzzles in this room first.");return;}if(room<2){setRoom(room+1);toast("Entered the next room.");}else{$("door-overlay").classList.remove("hidden");renderDoor();}
}
function renderDoor(prefill=""){$("door-feedback").textContent="";const input=$("door-code");input.value=String(prefill).replace(/\D/g,"").slice(0,12);input.oninput=()=>{input.value=input.value.replace(/\D/g,"").slice(0,12);};$("keypad").innerHTML=[..."123456789","DEL","0","ENTER"].map(n=>`<button class="key" data-key="${n}">${n}</button>`).join("");document.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>{const n=b.dataset.key;if(n==="DEL")input.value=input.value.slice(0,-1);else if(n==="ENTER")$("door-submit").click();else if(input.value.length<12)input.value+=n;input.focus();});$("door-submit").onclick=()=>{if(input.value===digits.join(""))endGame(true);else{$("door-feedback").textContent="Incorrect code. Check the digits you collected.";$("door-feedback").className="quiz-feedback bad";}};}
function fillDoorFromInventory(){if(solved.size!==12){toast("Collect all 12 code fragments first.");return;}$("door-code").value=digits.join("");$("door-feedback").textContent="The full code from your inventory is ready.";$("door-feedback").className="quiz-feedback good";}
function endGame(won){if(gameEnded)return;gameEnded=true;paused=false;$("pause-overlay").classList.add("hidden");$("door-overlay").classList.add("hidden");$("result-overlay").classList.remove("hidden");$("result-title").textContent=won?"You escaped!":"Game over";$("result-desc").textContent=won?"You solved the SQL mystery.":"You ran out of lives.";$("result-stats").innerHTML=`<div><b>${score}</b><small>SCORE</small></div><div><b>${solved.size}/12</b><small>CLUES</small></div>`;if(won){let rows=[];try{rows=JSON.parse(localStorage.getItem("sqlEscapeLeaderboard")||"[]")}catch(e){}rows.push({name:playerName,score,date:new Date().toISOString().slice(0,10)});rows.sort((a,b)=>b.score-a.score);localStorage.setItem("sqlEscapeLeaderboard",JSON.stringify(rows.slice(0,10)));}}
function showLeaderboard(){let rows=[];try{rows=JSON.parse(localStorage.getItem("sqlEscapeLeaderboard")||"[]")}catch(e){}$("leaderboard-table").innerHTML=rows.length?`<table class="leaderboard-table"><thead><tr><th>#</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.score}</td><td>${r.date}</td></tr>`).join("")}</tbody></table>`:`<p>No completed runs yet.</p>`;$("leaderboard-overlay").classList.remove("hidden");}
function tick(){if(gameEnded||paused)return;if(seconds>0){seconds--;const mm=String(Math.floor(seconds/60)).padStart(2,"0"),ss=String(seconds%60).padStart(2,"0");if($("timer"))$("timer").textContent=`${mm}:${ss}`;}if(seconds===0){clearInterval(clock);clock=null;endGame(false);}}
function togglePause(){if(gameEnded||!$("setup-overlay").classList.contains("hidden"))return;paused=!paused;$("pause-overlay").classList.toggle("hidden",!paused);$("pause-game").textContent=paused?"Resume game":"Pause game";keys={};}
function resumeGame(){if(!paused)return;paused=false;$("pause-overlay").classList.add("hidden");$("pause-game").textContent="Pause game";lastFrame=0;}
function startGame(){playerName=$("player-name").value.trim()||"Explorer";$("player-name-hud").textContent=playerName;$("avatar").src=`assets/${character}.svg`;$("avatar-mini").src=`assets/${character}.svg`;$("setup-overlay").classList.add("hidden");setRoom(0);requestAnimationFrame(loop);if(!clock)clock=setInterval(tick,1000);}
function renderInventoryModal(){const grid=$("inventory-modal");if(!grid)return;grid.innerHTML="";for(let i=0;i<12;i++){const slot=document.createElement("div");slot.className="inv-slot"+(solved.has(i)?" filled":"");slot.textContent=solved.has(i)?`+ ${digits[i]}`:"_";slot.title=solved.has(i)?`Puzzle ${i+1} - digit ${digits[i]}`:"Empty slot";grid.appendChild(slot);}const code=digits.map(d=>d||"_").join(" ");$("inventory-code-preview").value=code;$("inventory-fragment-count").textContent=`${solved.size} / 12`;$("inventory-copy-code").disabled=solved.size===0;}function openInventory(){renderInventoryModal();$("inventory-overlay").classList.remove("hidden");}function closeInventory(){$("inventory-overlay").classList.add("hidden");}async function copyInventoryCode(){const code=digits.filter(Boolean).join("");if(!code){toast("Solve a puzzle to collect a code fragment.");return;}try{await navigator.clipboard.writeText(code);toast("Collected fragments copied. Paste them into the exit keypad.");}catch(e){const field=$("inventory-code-preview");field.value=code;field.focus();field.select();toast("Code selected. Press Ctrl+C, then paste it at the exit keypad.");}}function useInventoryCode(){if(solved.size!==12){toast("Collect all 12 fragments before using the exit code.");return;}closeInventory();$("door-overlay").classList.remove("hidden");renderDoor(digits.join(""));}
document.querySelectorAll(".character-choice").forEach(b=>b.onclick=()=>{character=b.dataset.character;document.querySelectorAll(".character-choice").forEach(x=>x.classList.toggle("selected",x===b));});
const bind=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
bind("start-game",startGame);bind("pause-game",togglePause);bind("restart-game-inline",()=>location.reload());bind("leaderboard-restart",()=>location.reload());bind("resume-game",resumeGame);bind("pause-restart",()=>location.reload());bind("leaderboard-open",showLeaderboard);bind("leaderboard-close",()=>$("leaderboard-overlay").classList.add("hidden"));bind("leaderboard-done",()=>$("leaderboard-overlay").classList.add("hidden"));bind("quiz-close",()=>$("quiz-overlay").classList.add("hidden"));bind("door-close",()=>$("door-overlay").classList.add("hidden"));bind("play-again",()=>location.reload());bind("result-leaderboard",()=>{ $("result-overlay").classList.add("hidden");showLeaderboard(); });bind("inventory-open",openInventory);bind("inventory-close",closeInventory);bind("inventory-done",closeInventory);bind("inventory-copy-code",copyInventoryCode);bind("inventory-use-code",useInventoryCode);bind("door-fill-inventory",fillDoorFromInventory);
document.addEventListener("keydown",e=>{const k=e.key;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(k))e.preventDefault();if(k=== "Escape")$("quiz-overlay").classList.add("hidden");if(!paused&&k.toLowerCase()==="e"&&!$("quiz-overlay").classList.contains("hidden")===false&&!$("setup-overlay").classList.contains("hidden")===true){const target=nearest();if(target?.id==="door")interactDoor();else if(target)openPuzzle(target.id);}if(!paused&&["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)&&$("setup-overlay").classList.contains("hidden")&&$("quiz-overlay").classList.contains("hidden")&&$("door-overlay").classList.contains("hidden"))keys[k.length===1?k.toLowerCase():k]=true;});document.addEventListener("keyup",e=>{const k=e.key;if(["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k))keys[k.length===1?k.toLowerCase():k]=false;});window.addEventListener("blur",()=>keys={});renderHUD();
})();
