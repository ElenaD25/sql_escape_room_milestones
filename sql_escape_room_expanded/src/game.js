(() => {
"use strict";
const $ = id => document.getElementById(id);
const RO = {
  move:"Mișcă-te cu WASD / săgeți. Privește spre un obiect și apasă E pentru a interacționa.",
  study:"CAMERA 1 · BIROUL", lab:"CAMERA 2 · LABORATORUL", archive:"CAMERA 3 · ARHIVA",
  rooms:["Biroul","Laboratorul","Arhiva"], inventory:"INVENTAR", map:"HARTA CAMEREI", code:"FRAGMENTE DE COD",
  score:"SCOR", time:"TIMP RĂMAS", clues:"INDICII", setup:"Alege-ți personajul", setupDesc:"Aventura SQL este pe cale să înceapă. Alege un personaj și un nume.",
  girl:"Fată",boy:"Băiat",name:"Numele personajului",start:"Începe aventura",check:"Verifică răspunsul",hint:"Arată indiciul",submit:"Verifică",continue:"Continuă",close:"Închide",
  tooFar:"Apropie-te de obiect și privește spre el pentru a interacționa.",wrong:"Răspuns greșit! Ai pierdut o viață. Mai încearcă.",lives:"Vieți",hintText:"Indiciu",correct:"Corect! Ai primit cifra",digit:"Cifră colectată",roomDone:"Ai rezolvat toate puzzle-urile din această cameră. Mergi la ușă pentru a continua.",
  doorLocked:"Ușa este încuiată. Rezolvă toate cele patru puzzle-uri din cameră.",doorTitle:"Terminalul de securitate",doorDesc:"Introdu codul de 12 cifre obținut din toate cele trei camere.",
  doorWrong:"Cod incorect. Verifică cifrele colectate.",unlock:"Deblochează ieșirea",win:"Ai evadat!",winDesc:"Ai rezolvat misterul SQL și ai ieșit din laborator. Felicitări, detectivule!",
  gameOver:"Joc încheiat",gameOverDesc:"Ai rămas fără vieți. Poți încerca din nou și să-ți îmbunătățești scorul.",
  leaderboard:"Cei mai buni detectivi",player:"Jucător",date:"Data",time:"Timp",playAgain:"Joacă din nou",leaderboardBtn:"Vezi clasamentul",back:"Înapoi la joc",
  interact:"E · INTERACȚIONEAZĂ",explore:"Explorează camera. Apropie-te de un obiect luminos și apasă E.",
  objectNames:["Biletul de pe birou","Raftul cu cărți","Calculatorul","Lampa de birou","Stația de analiză","Rezervorul de date","Panoul de servere","Terminalul de securitate","Registrul vechi","Dosarul arhivat","Proiectorul de date","Cufărul final"],
  roomHints:["Verifică valoarea departamentului.","Caută cea mai mică dată de publicare.","Cele două tabele au un câmp comun.","WHERE filtrează rândurile înainte de grupare.",
    "COUNT(*) numără toate rândurile din grup.","DISTINCT elimină duplicatele.","HAVING filtrează grupurile după agregare.","Ordinea clauzelor contează.",
    "LEFT JOIN păstrează toate rândurile din tabelul din stânga.","CASE WHEN evaluează condițiile în ordine.","COUNT(DISTINCT ...) numără valori unice.","Așază clauzele în ordinea corectă."],
  syntax:"Construiește interogarea SQL",drag:"Trage piesele în căsuțe, în ordinea corectă. Poți și să apeși pe o piesă, apoi pe o căsuță.",
  clearRoom:"Cameră completă",locked:"Încuiat",cleared:"Rezolvat",current:"Aici ești",empty:"Gol"
};
const EN = {
  move:"Move with WASD / arrow keys. Face an object and press E to interact.",
  study:"ROOM 1 · THE STUDY",lab:"ROOM 2 · THE LAB",archive:"ROOM 3 · THE ARCHIVE",
  rooms:["The Study","The Lab","The Archive"],inventory:"INVENTORY",map:"ROOM MAP",code:"CODE FRAGMENTS",
  score:"SCORE",time:"TIME LEFT",clues:"CLUES",setup:"Choose your character",setupDesc:"Your SQL adventure is about to begin. Pick a character and give them a name.",
  girl:"Girl",boy:"Boy",name:"Character name",start:"Start adventure",check:"Check answer",hint:"Show hint",submit:"Check",continue:"Continue",close:"Close",
  tooFar:"Move closer to the object and face it to interact.",wrong:"Incorrect answer! You lost one life. Try again.",lives:"Lives",hintText:"Hint",correct:"Correct! You earned digit",digit:"Digit collected",roomDone:"All puzzles in this room are solved. Go to the door to continue.",
  doorLocked:"The door is locked. Solve all four puzzles in this room first.",doorTitle:"Security terminal",doorDesc:"Enter the 12-digit code collected across all three rooms.",
  doorWrong:"Incorrect code. Check the digits you collected.",unlock:"Unlock the exit",win:"You escaped!",winDesc:"You solved the SQL mystery and made it out of the data lab. Congratulations, detective!",
  gameOver:"Game over",gameOverDesc:"You ran out of lives. Try again and see if you can beat your score.",
  leaderboard:"Top detectives",player:"Player",date:"Date",time:"Time",playAgain:"Play again",leaderboardBtn:"View leaderboard",back:"Back to game",
  interact:"E · INTERACT",explore:"Explore the room. Move close to a glowing object and press E.",
  objectNames:["Desk note","Bookshelf","Computer","Desk lamp","Analysis station","Data tank","Server panel","Security terminal","Old ledger","Archived folder","Data projector","Final chest"],
  roomHints:["Check the department value.","Look for the earliest publication date.","The two tables share a key field.","WHERE filters rows before grouping.",
    "COUNT(*) counts every row in a group.","DISTINCT removes duplicates.","HAVING filters groups after aggregation.","Clause order matters.",
    "LEFT JOIN preserves every row from the left table.","CASE WHEN evaluates conditions in order.","COUNT(DISTINCT ...) counts unique values.","Place the clauses in the correct order."],
  syntax:"Build the SQL query",drag:"Drag the pieces into the slots in the correct order. You can also click a piece, then a slot.",
  clearRoom:"Room cleared",locked:"Locked",cleared:"Cleared",current:"You are here",empty:"Empty"
};
const I18N = {en:EN,ro:RO};
let lang="en",character="girl",playerName="Elly",score=0,lives=5,room=0,activePuzzle=null,selectedOption=null,selectedPiece=null;
let solved=new Set(),digits=[],position={x:.50,y:.76},facing={x:0,y:-1},keys={},lastFrame=0,nearObject=null,doorMode=false,gameEnded=false;
const roomData = [
 {id:"study",name:"The Study",bg:"assets/room-study.png",tint:"",objects:[
  {id:0,x:.19,y:.49,icon:"✉",type:"mcq",title:"The forgotten note",q:"Which query returns only employees from the IT department?",opts:["SELECT * FROM employees WHERE department = 'IT';","SELECT department FROM employees;","SELECT * FROM employees ORDER BY department;"],a:0,hint:"WHERE filters individual rows using a condition.",digit:"3",explain:"The WHERE clause keeps only rows that match its condition."},
  {id:1,x:.29,y:.22,icon:"▤",type:"mcq",title:"The oldest book",q:"Which query returns the earliest published book?",opts:["SELECT * FROM books ORDER BY published_date DESC LIMIT 1;","SELECT * FROM books ORDER BY published_date ASC LIMIT 1;","SELECT * FROM books LIMIT 1;"],a:1,hint:"ASC sorts dates from earliest to latest. LIMIT 1 keeps the first row.",digit:"1",explain:"ORDER BY ... ASC sorts ascending; LIMIT 1 returns only the first result."},
  {id:2,x:.68,y:.27,icon:"⌘",type:"builder",title:"Connect the tables",q:"Arrange the SQL pieces to join employees with departments using department_id.",pieces:["SELECT *","FROM employees e","JOIN departments d","ON e.department_id = d.department_id;"],hint:"A JOIN combines rows from two tables; ON describes how the rows match.",digit:"4",explain:"A JOIN needs a source table, a joined table, and an ON matching condition."},
  {id:3,x:.82,y:.59,icon:"♨",type:"mcq",title:"The missing timestamp",q:"How do you find records where exit_time has no value?",opts:["exit_time = NULL","exit_time IS NULL","exit_time == 'NULL'"],a:1,hint:"SQL uses a special predicate to test for missing values.",digit:"1",explain:"Use IS NULL, not = NULL."}
 ]},
 {id:"lab",name:"The Lab",bg:"assets/room-lab.png",tint:"lab",objects:[
  {id:4,x:.18,y:.30,icon:"▣",type:"mcq",title:"Count the experiments",q:"Which query counts records for each experiment_type?",opts:["SELECT experiment_type, COUNT(*) FROM experiments GROUP BY experiment_type;","SELECT COUNT(*) FROM experiments;","SELECT experiment_type FROM experiments ORDER BY COUNT(*);"],a:0,hint:"To count each category separately, create one group per category.",digit:"5",explain:"GROUP BY forms categories; COUNT(*) counts rows in each group."},
  {id:5,x:.37,y:.67,icon:"⌗",type:"mcq",title:"Remove duplicates",q:"Which keyword returns unique city values?",opts:["UNIQUE ROWS","DISTINCT","ONLY"],a:1,hint:"The keyword appears immediately after SELECT.",digit:"9",explain:"SELECT DISTINCT city returns each city once."},
  {id:6,x:.70,y:.27,icon:"⌘",type:"builder",title:"Filter grouped results",q:"Build a query that returns departments with more than 5 employees.",pieces:["SELECT department","FROM employees","GROUP BY department","HAVING COUNT(*) > 5;"],hint:"WHERE filters rows before grouping; HAVING filters groups after aggregation.",digit:"2",explain:"HAVING is used to filter grouped/aggregated results."},
  {id:7,x:.86,y:.63,icon:"⚙",type:"mcq",title:"The query sequence",q:"Which is the correct order of these SQL clauses?",opts:["SELECT → WHERE → FROM → ORDER BY","FROM → WHERE → GROUP BY → HAVING → ORDER BY → SELECT","FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY"],a:2,hint:"Think about the logical processing order: source, row filter, grouping, group filter, projection, sorting.",digit:"6",explain:"The logical processing order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY."}
 ]},
 {id:"archive",name:"The Archive",bg:"assets/room-archive.png",tint:"archive",objects:[
  {id:8,x:.18,y:.27,icon:"⇆",type:"mcq",title:"Keep every customer",q:"Which join keeps every row from customers, even without a matching account?",opts:["INNER JOIN","LEFT JOIN","CROSS JOIN"],a:1,hint:"The table written before LEFT JOIN is the one whose rows are all preserved.",digit:"5",explain:"LEFT JOIN returns all rows from the left table and matching rows from the right."},
  {id:9,x:.73,y:.25,icon:"▧",type:"mcq",title:"Classify the records",q:"Which SQL expression lets you return different labels based on conditions?",opts:["CASE WHEN ... THEN ... ELSE ... END","IF GROUP BY","ORDER CASE"],a:0,hint:"It starts with CASE and ends with END; each condition uses WHEN.",digit:"3",explain:"CASE evaluates conditions and returns a value for the first matching WHEN."},
  {id:10,x:.80,y:.67,icon:"◉",type:"mcq",title:"Unique customers",q:"How do you count the number of different customer_id values?",opts:["COUNT(customer_id)","COUNT(*)","COUNT(DISTINCT customer_id)"],a:2,hint:"Combine COUNT with DISTINCT to count unique non-NULL values.",digit:"8",explain:"COUNT(DISTINCT customer_id) counts distinct non-NULL customer IDs."},
  {id:11,x:.43,y:.70,icon:"▣",type:"builder",title:"The final archive query",q:"Arrange the pieces to list active accounts with the largest balance first.",pieces:["SELECT account_id, balance","FROM accounts","WHERE status = 'ACTIVE'","ORDER BY balance DESC;"],hint:"Filter active accounts first, then sort the result by balance in descending order.",digit:"2",explain:"The query selects fields, reads the table, filters active rows, then sorts highest balance first."}
 ]}
];
const RO_PUZZLES = [
 {title:"Biletul uitat",q:"Ce interogare returnează doar angajații din departamentul IT?",opts:["SELECT * FROM employees WHERE department = 'IT';","SELECT department FROM employees;","SELECT * FROM employees ORDER BY department;"],hint:"WHERE filtrează rândurile individuale folosind o condiție.",explain:"Clauza WHERE păstrează doar rândurile care îndeplinesc condiția."},
 {title:"Cea mai veche carte",q:"Ce interogare returnează cartea publicată cel mai devreme?",opts:["SELECT * FROM books ORDER BY published_date DESC LIMIT 1;","SELECT * FROM books ORDER BY published_date ASC LIMIT 1;","SELECT * FROM books LIMIT 1;"],hint:"ASC sortează datele de la cea mai veche la cea mai nouă. LIMIT 1 păstrează primul rând.",explain:"ORDER BY ... ASC sortează crescător, iar LIMIT 1 returnează primul rezultat."},
 {title:"Conectează tabelele",q:"Aranjează piesele SQL pentru a conecta employees cu departments folosind department_id.",pieces:["SELECT *","FROM employees e","JOIN departments d","ON e.department_id = d.department_id;"],hint:"JOIN combină rânduri din două tabele; ON descrie modul în care acestea se potrivesc.",explain:"Un JOIN are nevoie de tabelul sursă, tabelul asociat și condiția de potrivire ON."},
 {title:"Timestamp-ul lipsă",q:"Cum găsești înregistrările în care exit_time nu are nicio valoare?",opts:["exit_time = NULL","exit_time IS NULL","exit_time == 'NULL'"],hint:"SQL folosește un predicat special pentru a verifica valorile lipsă.",explain:"Folosește IS NULL, nu = NULL."},
 {title:"Numără experimentele",q:"Ce interogare numără înregistrările pentru fiecare experiment_type?",opts:["SELECT experiment_type, COUNT(*) FROM experiments GROUP BY experiment_type;","SELECT COUNT(*) FROM experiments;","SELECT experiment_type FROM experiments ORDER BY COUNT(*);"],hint:"Pentru a număra fiecare categorie separat, creează un grup pentru fiecare categorie.",explain:"GROUP BY formează categoriile, iar COUNT(*) numără rândurile din fiecare grup."},
 {title:"Elimină duplicatele",q:"Ce cuvânt-cheie returnează valori city unice?",opts:["UNIQUE ROWS","DISTINCT","ONLY"],hint:"Cuvântul-cheie apare imediat după SELECT.",explain:"SELECT DISTINCT city returnează fiecare oraș o singură dată."},
 {title:"Filtrează grupurile",q:"Construiește o interogare care returnează departamentele cu mai mult de 5 angajați.",pieces:["SELECT department","FROM employees","GROUP BY department","HAVING COUNT(*) > 5;"],hint:"WHERE filtrează rândurile înainte de grupare; HAVING filtrează grupurile după agregare.",explain:"HAVING este folosit pentru filtrarea grupurilor și a rezultatelor agregate."},
 {title:"Ordinea clauzelor",q:"Care este ordinea corectă a acestor clauze SQL?",opts:["SELECT → WHERE → FROM → ORDER BY","FROM → WHERE → GROUP BY → HAVING → ORDER BY → SELECT","FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY"],hint:"Gândește-te la ordinea logică: sursă, filtrarea rândurilor, grupare, filtrarea grupurilor, selecție, sortare.",explain:"Ordinea logică este FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY."},
 {title:"Păstrează toți clienții",q:"Ce tip de JOIN păstrează toate rândurile din customers, chiar dacă nu există un cont asociat?",opts:["INNER JOIN","LEFT JOIN","CROSS JOIN"],hint:"Tabelul scris înainte de LEFT JOIN este cel ale cărui rânduri sunt păstrate toate.",explain:"LEFT JOIN returnează toate rândurile din tabelul din stânga și potrivirile din dreapta."},
 {title:"Clasifică înregistrările",q:"Ce expresie SQL permite returnarea unor etichete diferite în funcție de condiții?",opts:["CASE WHEN ... THEN ... ELSE ... END","IF GROUP BY","ORDER CASE"],hint:"Începe cu CASE și se termină cu END; fiecare condiție folosește WHEN.",explain:"CASE evaluează condițiile și returnează valoarea primei condiții WHEN adevărate."},
 {title:"Clienți unici",q:"Cum numeri valorile distincte customer_id?",opts:["COUNT(customer_id)","COUNT(*)","COUNT(DISTINCT customer_id)"],hint:"Combină COUNT cu DISTINCT pentru a număra valorile unice care nu sunt NULL.",explain:"COUNT(DISTINCT customer_id) numără ID-urile distincte care nu sunt NULL."},
 {title:"Interogarea finală din arhivă",q:"Aranjează piesele pentru a lista conturile active cu cel mai mare sold primele.",pieces:["SELECT account_id, balance","FROM accounts","WHERE status = 'ACTIVE'","ORDER BY balance DESC;"],hint:"Filtrează mai întâi conturile active, apoi sortează rezultatul descrescător după sold.",explain:"Interogarea selectează câmpurile, citește tabelul, filtrează conturile active și apoi sortează soldurile descrescător."}
];
const totalPuzzles=roomData.reduce((n,r)=>n+r.objects.length,0);
const t=()=>I18N[lang];
const puzzleText=(o,key)=>lang==="ro"?(RO_PUZZLES[o.id]?.[key]||o[key]):o[key];
const roomObj=(r=room,id)=>roomData[r].objects.find(o=>o.id===id);
const code=()=>digits.map(x=>x||"_").join("");
function toast(msg){$("toast").textContent=msg;$("toast").classList.remove("fade");clearTimeout(toast._t);toast._t=setTimeout(()=>$("toast").classList.add("fade"),3600);}
function setRoom(r){
 room=r;const data=roomData[room];
 $("room-bg").src=data.bg;$("scene").className="scene"+(data.tint?" room-"+data.tint:"");
 $("scene-title").textContent=`ROOM ${room+1} · ${t().rooms[room].toUpperCase()}`;$("room-name-hud").textContent=t().rooms[room].toUpperCase();
 $("story-title").textContent=lang==="en"?"A mysterious data lab...":"Un laborator misterios de date...";
 $("story").textContent=room===0?(lang==="en"?"The first clues are hidden around the study.":"Primele indicii sunt ascunse în birou."):room===1?(lang==="en"?"The lab is full of unfinished queries.":"Laboratorul este plin de interogări neterminate."):(lang==="en"?"The archive holds the final pieces of the code.":"Arhiva ascunde ultimele fragmente ale codului.");
 position={x:.50,y:.78};facing={x:0,y:-1};nearObject=null;renderObjects();renderHUD();placePlayer();toast(lang==="en"?`Entered ${data.name}. Find all four SQL clues.`:`Ai intrat în ${data.name}. Găsește toate cele patru indicii SQL.`);
}
function renderObjects(){
 $("objects").innerHTML="";
 roomData[room].objects.forEach(o=>{
  const b=document.createElement("button");b.className="game-object";b.dataset.id=o.id;b.style.left=(o.x*100)+"%";b.style.top=(o.y*100)+"%";
  b.innerHTML=`<span class="obj-icon">${o.icon}</span><span class="obj-label">${esc(puzzleText(o,"title"))}</span>`;
  b.title=o.title;b.addEventListener("click",()=>openPuzzle(o.id));
  if(solved.has(o.id))b.classList.add("solved");
  $("objects").appendChild(b);
 });
 // Door/room transition marker
 const door=document.createElement("button");door.className="game-object door-object";door.dataset.door="true";door.style.left=".50";door.style.left="50%";door.style.top="10%";
 door.innerHTML=`<span class="obj-icon">🚪</span><span class="obj-label">${room===2?(lang==="en"?"EXIT":"IEȘIRE"):(lang==="en"?"NEXT ROOM":"CAMERA URMĂTOARE")}</span>`;
 door.addEventListener("click",()=>{if(isFacing({x:.5,y:.10}))interactDoor();else toast(t().tooFar);});$("objects").appendChild(door);
}
function renderHUD(){
 if($("score"))$("score").textContent=score;
 $("lives").textContent="♥ ".repeat(lives).trim()+"♡ ".repeat(5-lives).trim();
 $("lives").setAttribute("aria-label",`${lives} lives`);$("progress").textContent=`${solved.size} / ${totalPuzzles} CLUES`;
 $("inventory-count").textContent=`${solved.size} / ${totalPuzzles}`;$("inventory").innerHTML="";
 for(let i=0;i<totalPuzzles;i++){const slot=document.createElement("div");slot.className="inv-slot"+(solved.has(i)?" filled":"");slot.textContent=solved.has(i)?`✦ ${digits[i]}`:"＋";slot.title=solved.has(i)?`Puzzle ${i+1} · digit ${digits[i]}`:"Empty slot";$("inventory").appendChild(slot);}
 $("code-preview").textContent=digits.map(d=>d||"_").join("  ");$("map-player").style.left=["17%","48%","79%"][room];
 document.querySelectorAll(".map-room").forEach((el,i)=>{el.classList.toggle("cleared",roomData[i].objects.every(o=>solved.has(o.id)));});
 $("room-list").innerHTML=roomData.map((r,i)=>`<div class="room-row ${i===room?"active":""}" data-room="${i}"><div class="room-name">${esc(t().rooms[i])}</div><div class="room-status">${i<room?"✔️":i===room?"➤":"✖️"}</div></div>`).join("");
}
function esc(html){return String(html).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function interactDoor(){
 if(doorMode)return;
 doorMode=true;const codeInput=code();
 if(room===2){
  if(solved.size===totalPuzzles){doorUnlock();return;}
  toast(t().doorLocked);
 }else{
  if(activePuzzle)closePuzzle();
  room++;
  if(room===roomData.length){gameWin();return;}
  setRoom(room);
 }
 doorMode=false;
}
function doorUnlock(){
 $("door-code").textContent=code().replace(/./g,c=>"●");
 $("door-desc").textContent=t().doorDesc;
 $("door-wrong").classList.add("hidden");
 $("door-panel").classList.remove("hidden");
}
function doorSubmit(){
 const input=$("door-code").textContent.replace(/●/g,"1").replace(/○/g,"0").replace(/[^01]/g,"");
 if(input===code()){
  $("door-panel").classList.add("hidden");
  win();
 }else{
  $("door-wrong").classList.remove("hidden");
  setTimeout(()=>$("door-wrong").classList.add("hidden"),3600);
 }
}
function gameWin(){
 gameEnded=true;
 $("win-score").textContent=score;
 $("win-lives").textContent=lives;
 $("win-digits").innerHTML=digits.map(d=>`<span class="digit">${d}</span>`).join("");
 $("win-panel").classList.remove("hidden");
}
function gameOver(){
 gameEnded=true;
 $("game-over-score").textContent=score;
 $("game-over-digits").innerHTML=digits.map(d=>`<span class="digit">${d}</span>`).join("");
 $("game-over-panel").classList.remove("hidden");
}
function restartGame(){
 location.reload();
}
function openPuzzle(id){
 if(activePuzzle)return;
 activePuzzle=roomObj(room,id);
 $("puzzle-title").textContent=puzzleText(activePuzzle,"title");
 $("puzzle-question").textContent=puzzleText(activePuzzle,"q");
 $("puzzle-hint").textContent=puzzleText(activePuzzle,"hint");
 $("puzzle-explain").textContent=puzzleText(activePuzzle,"explain");
 $("puzzle-opts").innerHTML="";
 if(activePuzzle.type==="mcq"){
  activePuzzle.opts.forEach((opt,i)=>{
   const btn=document.createElement("button");btn.className="puzzle-opt";btn.textContent=opt;btn.dataset.index=i;
   btn.addEventListener("click",()=>checkAnswer(i));
   $("puzzle-opts").appendChild(btn);
  });
 }else if(activePuzzle.type==="builder"){
  activePuzzle.pieces.forEach((piece,i)=>{
   const btn=document.createElement("button");btn.className="puzzle-piece";btn.textContent=piece;btn.dataset.index=i;
   btn.addEventListener("click",()=>placePiece(i));
   $("puzzle-opts").appendChild(btn);
  });
 }
 $("puzzle-panel").classList.remove("hidden");
}
function closePuzzle(){
 activePuzzle=null;
 $("puzzle-panel").classList.add("hidden");
}
function checkAnswer(selected){
 const correct=activePuzzle.a;
 if(Array.isArray(correct)){
  if(correct.includes(selected)){
   correct.forEach(c=>document.querySelector(`.puzzle-opt[data-index="${c}"]`).classList.add("correct"));
   toast(t().correct);
   correct.forEach(c=>{solved.add(c);digits[c]=parseInt(c+1);});
   setTimeout(()=>{roomData[room].objects.find(o=>o.id===activePuzzle.id).solved=true;renderObjects();closePuzzle();renderHUD();},1200);
  }else{
   document.querySelector(`.puzzle-opt[data-index="${selected}"]`).classList.add("wrong");
   toast(t().wrong);
   lives--;
   setTimeout(()=>{if(lives===0)gameOver();else closePuzzle();renderHUD();},1200);
  }
 }else{
  if(selected===correct){
   document.querySelector(`.puzzle-piece[data-index="${selected}"]`).classList.add("correct");
   toast(t().correct);
   solved.add(activePuzzle.id);
   digits[activePuzzle.id]=parseInt(activePuzzle.id+1);
   setTimeout(()=>{roomData[room].objects.find(o=>o.id===activePuzzle.id).solved=true;renderObjects();closePuzzle();renderHUD();},1200);
  }else{
   document.querySelector(`.puzzle-piece[data-index="${selected}"]`).classList.add("wrong");
   toast(t().wrong);
   lives--;
   setTimeout(()=>{if(lives===0)gameOver();else closePuzzle();renderHUD();},1200);
  }
 }
}
function placePiece(index){
 const piece=activePuzzle.pieces[index];
 const slots=document.querySelectorAll(".puzzle-piece");
 let emptySlot=-1;
 slots.forEach((slot,i)=>{
  if(slot.classList.contains("filled"))slot.classList.remove("filled");
  else if(emptySlot===-1)emptySlot=i;
 });
 if(emptySlot!==-1){
  slots[emptySlot].textContent=piece;
  slots[emptySlot].classList.add("filled");
  if(Array.from(slots).every(slot=>slot.classList.contains("filled"))){
   toast(t().correct);
   solved.add(activePuzzle.id);
   digits[activePuzzle.id]=parseInt(activePuzzle.id+1);
   setTimeout(()=>{roomData[room].objects.find(o=>o.id===activePuzzle.id).solved=true;renderObjects();closePuzzle();renderHUD();},1200);
  }
 }
}
function placePlayer(){
 const player=$("player");
 player.style.left=(position.x*100)+"%";
 player.style.top=(position.y*100)+"%";
 player.style.transform=`rotate(${Math.atan2(facing.y,facing.x)*180/Math.PI}deg)`;
}
function isFacing(target){
 const dx=target.x-position.x,dy=target.y-position.y;
 return Math.abs(Math.atan2(dy,dx)*180/Math.PI)<=45;
}
function updatePlayerPosition(){
 const speed=0.02;
 if(keys.w){position.x+=facing.x*speed;position.y+=facing.y*speed;}
 if(keys.s){position.x-=facing.x*speed;position.y-=facing.y*speed;}
 if(keys.a){facing.x+=speed;facing.y-=speed;}
 if(keys.d){facing.x-=speed;facing.y+=speed;}
 const len=Math.sqrt(facing.x*facing.x+facing.y*facing.y);
 if(len>0){facing.x/=len;facing.y/=len;}
}
function gameLoop(){
 if(gameEnded)return;
 const now=performance.now();
 const delta=(now-lastFrame)/1000;
 lastFrame=now;
 updatePlayerPosition();
 if(nearObject&&isFacing(nearObject)){
  $("interact-prompt").classList.remove("hidden");
  if(keys.e)interactObject(nearObject);
 }else{
  $("interact-prompt").classList.add("hidden");
 }
 if(roomData[room].objects.some(o=>o.solved))$("door-hint").classList.remove("hidden");
 else $("door-hint").classList.add("hidden");
}
setRoom(0);
window.addEventListener("keydown",e=>{
 if(gameEnded)return;
 keys[e.key]=true;
 if(e.key==="Escape"){if(activePuzzle)closePuzzle();});
 window.addEventListener("keyup",e=>{keys[e.key]=false;});
 setInterval(gameLoop,1000/60);
})();