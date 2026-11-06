'use strict';
const $ = s => document.querySelector(s);
const locations = {
  division: {name:'除法港口', label:'01 / 分給每個人，一樣多', intro:'156 箱貨物，平均分給 3 艘船。先分大箱，分不開時再拆箱。看看每一步怎麼記在直式裡。', x:-150,y:95},
  place: {name:'位值工坊', label:'02 / 換個樣子，數量不變', intro:'工坊裡有 1 個百、2 個十和 3 個一。試著拆開或包回去，看看總數會不會改變。', x:145,y:85},
  multiply: {name:'乘法果園', label:'03 / 拆成兩塊，再合起來', intro:'每排 12 棵果樹，有 4 排。把每排拆成 10 棵和 2 棵，大乘法就變成兩個小乘法。', x:-130,y:-110},
  fraction: {name:'分數野餐地', label:'04 / 同一個整體，不同的切法', intro:'同一條麵包，先切成 4 等份。選你想吃的份量，再把每份切半，觀察份量與分數。', x:120,y:-125}
};
let progress = {};
try { const saved=JSON.parse(localStorage.getItem('math-island-v1') || '{}'); if(saved && typeof saved==='object' && !Array.isArray(saved)) progress=saved; } catch { $('#storage-note').textContent='目前無法儲存；仍可完成所有活動。'; }
function updateProgress(){ const n=Object.keys(locations).filter(k=>progress[k]===true).length; $('#progress').textContent=`探險手冊 ${n} / 4`; document.querySelectorAll('[data-stamp]').forEach(e=>{const done=progress[e.dataset.stamp]===true;e.textContent=done?'✓':'↗';e.classList.toggle('done',done);}); }
updateProgress();
let yaw=-.2, zoom=1, paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const svg=$('#island'), world=$('#world');
let scene3d=null, sceneTime=0, rabbitPose=[0,0,8,0], journey=null;
try { scene3d=window.MathIsland3D.create($('#island-3d'));document.querySelector('.map-wrap').classList.add('has-3d'); } catch(error) { console.warn('3D scene unavailable; using the interactive SVG map.',error);$('#island-3d').hidden=true; }
const poly=(pts,fill,extra='')=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
function project(x,y,z=0){const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [550+a*zoom*1.25,315+b*zoom*.66-z*zoom];}
function face(points,fill){return poly(points.map(p=>project(...p)),fill);}
function box(x,y,z,w,d,h,color='#e8d3a2') {return face([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],color)+face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],'#b9b58e')+face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],'#ccbd91')+face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],'#f6e7c0');}
function house(x,y,color,kind='house'){
 const w=65,d=52,h=45;let s=box(x-w/2,y-d/2,8,w,d,h);s+=face([[x-w/2-7,y-d/2-6,53],[x,y-d/2-6,89],[x,y+d/2+6,89],[x-w/2-7,y+d/2+6,53]],color);s+=face([[x,y-d/2-6,89],[x+w/2+7,y-d/2-6,53],[x+w/2+7,y+d/2+6,53],[x,y+d/2+6,89]],kind==='house'?'#a65c46':'#52868b');
 s+=face([[x-9,y+d/2+.5,8],[x+9,y+d/2+.5,8],[x+9,y+d/2+.5,35],[x-9,y+d/2+.5,35]],'#617c69');
 for(let i of [-22,21])s+=face([[x+i-6,y+d/2+1,28],[x+i+5,y+d/2+1,28],[x+i+5,y+d/2+1,40],[x+i-6,y+d/2+1,40]],'#abd8cd');
 if(kind==='workshop') s+=box(x+21,y-14,65,10,12,35,'#d3baa0'); return s;
}
function tree(x,y,size=1,fruit=false){const [px,py]=project(x,y,8),s=zoom*size; let out=`<path d="M${px} ${py}v${-30*s}" stroke="#8a8056" stroke-width="${5*s}"/>`;out+=ellipse(px,py-41*s,19*s,24*s,'#8eac67')+ellipse(px-7*s,py-42*s,13*s,18*s,'#a5bd77')+ellipse(px+6*s,py-33*s,13*s,16*s,'#799c5e');if(fruit)out+=ellipse(px-7*s,py-42*s,3*s,3*s,'#e3a16a')+ellipse(px+8*s,py-33*s,3*s,3*s,'#e3a16a');return out;}
function drawMap(){
 if(scene3d){
  scene3d.render(yaw,zoom,sceneTime,rabbitPose);
  Object.entries(locations).forEach(([id,l])=>{const [x,y]=scene3d.project(l.x,l.y,id==='multiply'?78:115);const b=$(`#mark-${id}`);b.style.left=`${x}px`;b.style.top=`${y}px`;});
  return;
 }

 const edge=[[-260,-145],[-195,-205],[-55,-210],[65,-202],[205,-175],[268,-80],[270,65],[218,160],[85,194],[-80,205],[-220,150],[-280,20]];
 let s=ellipse(550,385,335*zoom,130*zoom,'#509791','opacity=".16" filter="url(#shadow)"');
 for(let j=3;j>0;j--)s+=ellipse(550,355, (350+j*20)*zoom,(159+j*10)*zoom,'none',`stroke="#f4ffed" stroke-opacity="${.1+j*.05}" stroke-width="2"`);
 for(let i=0;i<edge.length;i++){let a=edge[i],b=edge[(i+1)%edge.length];s+=face([[...a,0],[...b,0],[...b,-32],[...a,-32]],i%2?'#c6b583':'#d9c69a');}
 s+=face(edge.map(a=>[...a,0]),'#c8dca0');
 const inner=edge.map(([x,y])=>[x*.94,y*.94,3]);s+=face(inner,'#b9d18d');
 for(const l of Object.values(locations)){const a=project(0,0,5),b=project(l.x,l.y,5);s+=`<path d="M${a} Q${project(l.x*.65,0,5)} ${b}" fill="none" stroke="#ece0b6" stroke-width="${19*zoom}" stroke-linecap="round"/>`;}
 const center=project(0,0,6);s+=ellipse(center[0],center[1],38*zoom,23*zoom,'#e9dfb9');
 let objects=[];const add=(x,y,draw)=>objects.push({depth:x*Math.sin(yaw)+y*Math.cos(yaw),draw});
 [[-225,-70],[-205,-135],[-70,-170],[10,-180],[220,-60],[225,20],[200,120],[-35,150],[-200,20],[-80,-15],[70,145]].forEach(([x,y],i)=>add(x,y,()=>tree(x,y,.75+(i%3)*.16)));
 add(-150,105,()=>{let o=box(-200,110,2,115,65,5,'#b49365');for(let i=0;i<8;i++)o+=face([[-200+i*15,110,8],[-198+i*15,110,8],[-198+i*15,175,8],[-200+i*15,175,8]],'#987d59');return o+house(-155,73,'#729d9e','port');});
 add(145,85,()=>house(145,85,'#d88e6f','workshop')+box(188,102,7,21,21,20));
 add(-140,-105,()=>{let o=face([[-200,-150,6],[-80,-150,6],[-80,-75,6],[-200,-75,6]],'#9fba7c');for(let y=-140;y<=-85;y+=27)for(let x=-184;x<=-95;x+=30)o+=tree(x,y,.6,true);return o;});
 add(120,-125,()=>{let o=face([[75,-160,7],[160,-160,7],[160,-110,7],[75,-110,7]],'#f2e5be');for(let i=0;i<4;i++)o+=face([[75+i*21,-160,8],[85+i*21,-160,8],[85+i*21,-110,8],[75+i*21,-110,8]],'#dfb098');o+=box(102,-145,9,36,20,14);const [px,py]=project(150,-120,10);o+=`<path d="M${px} ${py}v${-69*zoom}" stroke="#a48e64" stroke-width="${3*zoom}"/>`;o+=poly([[px-42*zoom,py-53*zoom],[px,py-82*zoom],[px+42*zoom,py-53*zoom]],'#e0ad64');return o;});
 add(0,15,()=>{const [x,y]=project(0,15,7);return ellipse(x,y,15*zoom,6*zoom,'#9daf83')+ellipse(x,y-16*zoom,11*zoom,15*zoom,'#fffdf1')+ellipse(x,y-32*zoom,12*zoom,11*zoom,'#fffdf1')+ellipse(x-6*zoom,y-47*zoom,4*zoom,12*zoom,'#fffdf1')+ellipse(x+6*zoom,y-47*zoom,4*zoom,12*zoom,'#fffdf1')+ellipse(x-4*zoom,y-34*zoom,1.4*zoom,1.6*zoom,'#3c564d')+ellipse(x+4*zoom,y-34*zoom,1.4*zoom,1.6*zoom,'#3c564d');});
 add(-165,220,()=>{return face([[-200,200,0],[-130,200,0],[-141,225,-5],[-189,225,-5]],'#a77752')+face([[-198,201,1],[-132,201,1],[-144,213,1],[-186,213,1]],'#e8d6a4')+box(-176,195,5,18,17,18);});
 objects.sort((a,b)=>a.depth-b.depth).forEach(o=>s+=o.draw());world.innerHTML=s;
 const r=svg.getBoundingClientRect(),scale=Math.min(r.width/1100,r.height/640),ox=(r.width-1100*scale)/2,oy=(r.height-640*scale)/2;
 Object.entries(locations).forEach(([id,l])=>{let [x,y]=project(l.x,l.y,105);const b=$(`#mark-${id}`);b.style.left=`${ox+x*scale}px`;b.style.top=`${oy+y*scale}px`;});
}
$('#landmarks').innerHTML=Object.entries(locations).map(([id,l],i)=>`<button id="mark-${id}" class="landmark" data-lesson="${id}"><em>0${i+1}</em>${l.name}</button>`).join('');
function setMotion(){document.body.classList.toggle('paused',paused);$('#motion').textContent=paused?'開啟動態':'暫停動態';$('#motion').setAttribute('aria-pressed',String(paused));}
setMotion();$('#motion').onclick=()=>{paused=!paused;setMotion();if(paused&&journey)finishTravel();};
$('#rotate-left').onclick=()=>{yaw-=.25;drawMap();};$('#rotate-right').onclick=()=>{yaw+=.25;drawMap();};
function zoomBy(n){zoom=Math.max(.75,Math.min(1.3,zoom*n));drawMap();}
$('#zoom-in').onclick=()=>zoomBy(1.1);$('#zoom-out').onclick=()=>zoomBy(1/1.1);$('#reset-view').onclick=()=>{yaw=-.2;zoom=1;drawMap();};
svg.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY>0?.95:1.05);},{passive:false});
const pointers=new Map();let distance=0;
svg.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);distance=0;});
svg.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){yaw+=(e.clientX-prev.x)*.007;drawMap();}else{const [a,b]=[...pointers.values()];const next=Math.hypot(a.x-b.x,a.y-b.y);if(distance>0)zoomBy(next/distance);distance=next;}});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(ev,e=>{pointers.delete(e.pointerId);distance=0;});
new ResizeObserver(drawMap).observe(svg);
let current='',state={},opener=null,quizReady=false;
const dialog=$('#lesson-dialog');
document.addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b)openLesson(b.dataset.lesson,b);});
function openLesson(id,button){
 if(dialog.open)return;
 if(!scene3d||paused){journey=null;const destination=IslandAnimation.destinations[id];rabbitPose=[destination[0],0,destination[1],0];drawMap();showLesson(id,button);return;}
 if(journey) return; // One chosen destination per journey; no competing dialogs.
 journey=IslandAnimation.planJourney(rabbitPose,id);journey.button=button;
 $('#travel-status').hidden=false;$('#travel-status').innerHTML='<span></span><button id="skip-travel">直接進入 →</button>';
 $('#travel-status span').textContent=`兔兔正跳往${locations[id].name}…`;
 $('#skip-travel').onclick=finishTravel;
 document.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-disabled','true'));
 document.querySelector('.map-wrap').scrollIntoView({behavior:'smooth',block:'center'});
}
function clearTravel(){journey=null;$('#travel-status').hidden=true;document.querySelectorAll('[data-lesson]').forEach(b=>b.removeAttribute('aria-disabled'));}
function finishTravel(){if(!journey)return;const route=journey;const final=IslandAnimation.sampleJourney(route,route.duration);rabbitPose=final.pose;clearTravel();drawMap();showLesson(route.id,route.button);}
function showLesson(id,button){current=id;opener=button;$('#lesson-title').textContent=locations[id].name;$('#lesson-label').textContent=locations[id].label;$('#lesson-intro').textContent=locations[id].intro;resetLesson();dialog.showModal();dialog.scrollTop=0;}
$('#close-lesson').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{opener?.focus();});
$('#restart').onclick=()=>resetLesson();
function resetLesson(){quizReady=false;$('#feedback').textContent='';$('#quiz').innerHTML='';state=current==='division'?newDivision(156,3):current==='place'?{counts:[1,2,3],moves:0}:current==='multiply'?{rows:4,cols:12,split:false}:{selected:2,split:false};renderLesson();}
function renderLesson(){({division:renderDivision,place:renderPlace,multiply:renderMultiply,fraction:renderFraction})[current]();}
function newDivision(n,d){return {n,d,counts:String(n).padStart(3,'0').split('').map(Number),cargo:[0,0,0],q:[null,null,null],index:0,history:[],finished:false};}
const units=['百','十','一'],values=[100,10,1],classes=['hundred','ten','one'];
function pieces(counts){return counts.map((n,i)=>`<span class="unit-group" aria-label="${n} 個${units[i]}">${Array.from({length:n},()=>`<span class="piece ${classes[i]}" aria-hidden="true">${values[i]}</span>`).join('')}</span>`).join('');}
const legend='<div class="legend"><span><b style="background:var(--hundred)"></b>大箱＝100</span><span><b style="background:var(--ten)"></b>長箱＝10</span><span><b style="background:var(--one)"></b>小箱＝1</span></div>';
function divisionPrompt(){const s=state,i=s.index;if(s.finished)return `每艘船拿到 ${s.cargo.reduce((a,n,i)=>a+n*values[i],0)} 箱。倉庫剩 ${s.counts[2]} 箱，不能再平均分給 ${s.d} 艘船。`;
 if(s.q[i]===null){const q=Math.floor(s.counts[i]/s.d);return q===0?`這一位有 ${s.counts[i]} 個${units[i]}，不夠每船分 1 個${units[i]}。在商的${units[i]}位記下 0，保留它的位置。`:`${s.counts[i]} 個${units[i]}分給 ${s.d} 艘船，每船先拿 ${q} 個${units[i]}。按下分配，看直式的${units[i]}位。`;}
 return s.counts[i]>0?`剩下 ${s.counts[i]} 個${units[i]}。把它們換成 ${s.counts[i]*10} 個${units[i+1]}，再和原本的 ${s.counts[i+1]} 個${units[i+1]}一起分。`:`${units[i]}位分完了。接著看${units[i+1]}位，位置不能跳過。`;}
function renderDivision(){const s=state,i=s.index,answer=s.cargo.reduce((a,n,j)=>a+n*values[j],0);const digits=String(s.n).padStart(3,'0').split('');
 $('#lesson-intro').textContent=`${s.n} 箱貨物，平均分給 ${s.d} 艘船。大箱裝 100，小長箱裝 10，綠色小箱裝 1。`;
 $('#lesson-content').innerHTML=`<div class="task-tabs"><button data-example="156" aria-pressed="${s.n===156}">拆箱試試 156 ÷ 3</button><button data-example="408" aria-pressed="${s.n===408}">別漏掉 0：408 ÷ 4</button><button data-example="125" aria-pressed="${s.n===125}">有剩下呢？125 ÷ 4</button></div><div class="activity-layout"><section class="activity"><div class="place-heading"><p class="small-label">港口倉庫 · 尚未分配</p><strong>${s.counts.reduce((a,n,j)=>a+n*values[j],0)}</strong></div>${legend}<div class="warehouse">${pieces(s.counts)}</div><div class="ships">${Array.from({length:s.d},(_,j)=>`<div class="ship">第 ${j+1} 艘船<strong>${answer}</strong><div class="cargo">${pieces(s.cargo)}</div></div>`).join('')}</div><p class="message">${divisionPrompt()}</p><div class="controls">${s.finished?'<button class="primary" id="try-quiz">我發現了，來試一題 →</button>':`<button class="primary" id="divide-action">${s.q[i]===null?(Math.floor(s.counts[i]/s.d)===0?`商的${units[i]}位記 0`:`每船分 ${Math.floor(s.counts[i]/s.d)} 個${units[i]}`):(s.counts[i]>0?`拆開剩下的${units[i]}位箱子`:`接著分${units[i+1]}位`)}</button>`}</div></section><section class="paper"><p class="small-label">把分配記在直式裡</p><table class="calculation"><caption>${s.n} ÷ ${s.d}　每一欄都有自己的位置</caption><thead><tr><th></th><th>百位</th><th>十位</th><th>個位</th></tr></thead><tbody><tr class="quotient"><td class="row-name">每船得到</td>${s.q.map((q,j)=>`<td class="${!s.finished&&i===j?'active-cell':''} ${q===null?'pending':''}">${q===null?'·':q===0&&j===0?'—':q}</td>`).join('')}</tr><tr class="dividend"><td class="row-name">${s.d} 艘船 ⟌</td>${digits.map(n=>`<td>${n}</td>`).join('')}</tr></tbody></table><p class="small-label" style="margin-top:20px">分配紀錄</p><ol class="step-history">${s.history.map(h=>`<li>${h}</li>`).join('')||'<li>先看最大的位值：百位。</li>'}</ol>${s.finished?`<div class="identity">${s.n} ÷ ${s.d}＝${answer}${s.counts[2]?` 餘 ${s.counts[2]}`:''}<br>驗算：${answer} × ${s.d}＋${s.counts[2]}＝${s.n}</div>`:'<p class="fact-card">上面的數字代表「每一艘船」拿到多少。百位沒有分到時，最前面的 0 可以不寫；中間的 0 一定要留下。</p>'}</section></div>`;
 document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{state=newDivision(Number(b.dataset.example),b.dataset.example==='156'?3:4);$('#quiz').innerHTML='';$('#feedback').textContent='';quizReady=false;renderDivision();});
 if(s.finished)$('#try-quiz').onclick=()=>showQuiz();else $('#divide-action').onclick=()=>{advanceDivision(s);renderDivision();};
}
function advanceDivision(s){if(s.finished)return;const i=s.index;if(s.q[i]===null){const before=s.counts[i],q=Math.floor(before/s.d);s.q[i]=q;s.cargo[i]=q;s.counts[i]-=q*s.d;s.history.push(`${before} 個${units[i]} ÷ ${s.d}＝${q} 個${units[i]}，剩 ${s.counts[i]} 個${units[i]}。${q===0&&i===0?'商最前面的 0 省略。':q===0?'這一位記 0，不跳過。':''}`);if(i===2)s.finished=true;}else{if(s.counts[i]>0){const n=s.counts[i];s.counts[i+1]+=n*10;s.counts[i]=0;s.history.push(`${n} 個${units[i]}換成 ${n*10} 個${units[i+1]}，合起來是 ${s.counts[i+1]} 個${units[i+1]}。`);}s.index++;}}
function renderPlace(){const c=state.counts;$('#lesson-content').innerHTML=`<div class="activity-layout"><section class="activity"><div class="place-heading"><p class="small-label">工坊裡的積木</p><strong>總共 ${c.reduce((a,n,i)=>a+n*values[i],0)}</strong></div>${legend}<div class="warehouse">${pieces(c)}</div><p class="equation">${c[0]} 個百 ＋ ${c[1]} 個十 ＋ ${c[2]} 個一</p><div class="controls"><button data-exchange="0" ${c[0]===0?'disabled':''}>拆 1 個百 → 10 個十</button><button data-exchange="1" ${c[1]===0?'disabled':''}>拆 1 個十 → 10 個一</button><button data-pack="0" ${c[1]<10?'disabled':''}>10 個十 → 包成 1 個百</button><button data-pack="1" ${c[2]<10?'disabled':''}>10 個一 → 包成 1 個十</button></div></section><section class="paper"><p class="small-label">數量守恆小筆記</p><div class="equation">100＝10 × 10<br>10＝10 × 1</div><p class="fact-card">拆開包裝，只是換一種表示方法。<b>總數一直是 123。</b><br>除法中，大箱不夠平均分時，就可以用這個方法換成小箱。</p><p>已經換過 ${state.moves} 次。</p><button id="place-quiz" ${state.moves<2?'disabled':''}>換過兩次了，試試看 →</button></section></div>`;
 document.querySelectorAll('[data-exchange]').forEach(b=>b.onclick=()=>{const i=+b.dataset.exchange;if(c[i]<=0)return;c[i]--;c[i+1]+=10;state.moves++;renderPlace();});document.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pack;if(c[i+1]<10)return;c[i+1]-=10;c[i]++;state.moves++;renderPlace();});$('#place-quiz').onclick=()=>showQuiz();}
function renderMultiply(){const s=state;$('#lesson-content').innerHTML=`<div class="activity-layout"><section class="activity"><p class="small-label">每排 ${s.cols} 棵 × ${s.rows} 排</p><label class="range-row">幾排 <input id="rows" aria-label="果樹排數" type="range" min="2" max="6" value="${s.rows}"><output>${s.rows}</output></label><label class="range-row">每排幾棵 <input id="cols" aria-label="每排果樹數量" type="range" min="11" max="15" value="${s.cols}"><output>${s.cols}</output></label><div class="orchard" role="img" aria-label="${s.rows} 排，每排 ${s.cols} 棵果樹" style="grid-template-columns:repeat(${s.cols},1fr)">${Array.from({length:s.rows*s.cols},(_,i)=>`<span class="fruit ${s.split&&i%s.cols>=10?'second':''}" style="${s.split&&i%s.cols===10?'box-shadow:-3px 0 #c09146':''}"></span>`).join('')}</div><button id="split-orchard" class="primary">${s.split?'合起來看':'把每排拆成 10 棵和剩下的'}</button></section><section class="paper"><p class="small-label">用兩個小乘法幫忙</p><div class="equation">${s.cols} × ${s.rows}＝${s.cols*s.rows}</div>${s.split?`<div class="fact-card">綠色區：10 × ${s.rows}＝${10*s.rows}<br>黃色區：${s.cols-10} × ${s.rows}＝${(s.cols-10)*s.rows}</div><p class="equation">${10*s.rows}＋${(s.cols-10)*s.rows}＝${s.cols*s.rows}</p><p class="message">每一排的兩塊都要算，最後再合起來。樹沒有變多，也沒有變少。</p><button id="multiply-quiz">換一題，我來拆 →</button>`:'<p class="fact-card">先按「拆成 10 棵和剩下的」，觀察每一排怎麼被分成兩塊。</p>'}</section></div>`;
 for(const id of ['rows','cols'])$('#'+id).onchange=e=>{const v=+e.target.value;const focus=id;state[id]=v;renderMultiply();$('#'+focus).focus();};$('#split-orchard').onclick=()=>{s.split=!s.split;renderMultiply();};if(s.split)$('#multiply-quiz').onclick=()=>showQuiz();}
function renderFraction(){const s=state;$('#lesson-content').innerHTML=`<div class="activity-layout"><section class="activity"><p class="small-label">這一整條麵包，是同一個「1」</p><div class="fraction-bar">${Array.from({length:4},(_,i)=>`<button class="slice ${i<s.selected?'selected':''} ${s.split?'split':''}" data-slice="${i+1}" aria-label="選取 ${i+1} 個四分之一" aria-pressed="${s.selected===i+1}"></button>`).join('')}</div><div class="fraction-labels"><span>0</span><span>一整條 ＝ 1</span></div><p class="message">點麵包選份量。金黃色是你選的部分。<br>現在選了 ${s.selected} 個四分之一。</p><button id="cut-bread" class="primary">${s.split?'回到 4 等份':'每一份再切成 2 等份'}</button></section><section class="paper"><p class="small-label">分得更細，份量一樣</p><div class="equation">${s.selected} / 4 ${s.split?`＝ ${s.selected*2} / 8`:''}</div><p class="fact-card">${s.split?`整條變成 8 小份，你選的部分變成 ${s.selected*2} 小份。切線增加了，但麵包沒有增加。<br><b>分子和分母都乘 2，份量不變。</b>`:'分母 4：整條被分成 4 等份。<br>分子 '+s.selected+'：你選了其中 '+s.selected+' 份。'}</p>${s.split?'<button id="fraction-quiz">我懂了，換一題 →</button>':''}</section></div>`;
 document.querySelectorAll('[data-slice]').forEach(b=>b.onclick=()=>{s.selected=+b.dataset.slice;renderFraction();});$('#cut-bread').onclick=()=>{s.split=!s.split;renderFraction();};if(s.split)$('#fraction-quiz').onclick=()=>showQuiz();}
function showQuiz(){quizReady=true;const questions={division:{q:'換一題：306 ÷ 3，每船得到多少？為什麼？',options:['12，沒有十就跳過','102，十位沒有分到也要記 0','120，把 0 寫在最後'],correct:1,hint:'先分 3 個百，再看 0 個十，最後分 6 個一。每船有 1 個百、0 個十、2 個一。',why:'102 的 0 保住十位，1 才仍然表示 1 個百。102 × 3＝306。'},place:{q:'把 123 的 1 個百全部拆開，會變成什麼？',options:['12 個十和 3 個一','2 個十和 13 個一','13 個十'],correct:0,hint:'拆出的 10 個十，要加上原來的 2 個十。3 個一仍然留下。',why:'10 個十＋2 個十＋3 個一＝123。包裝改變，總數不變。'},multiply:{q:'每排 14 棵，有 3 排，怎麼拆開算？',options:['10 × 3＋4','10 × 3＋4 × 3','10＋4 × 3'],correct:1,hint:'每一排都有 10 棵和 4 棵。兩塊都有 3 排，所以兩塊都要乘 3。',why:'30＋12＝42。每一棵都算一次，不漏算任何一排。'},fraction:{q:'同一條麵包的 3/4，每份再切成兩小份，會是？',options:['3/8，份數變多','6/8，份量沒變','6/4，麵包變多'],correct:1,hint:'整條由 4 份變 8 份；選中的 3 份，每份也分成 2 份。',why:'3 × 2＝6，4 × 2＝8，所以 3/4＝6/8。金黃色的份量沒有變。'}};if(current==='division' && state.n===156) questions.division={q:'換一題：162 箱平均分給 3 艘船，每船得到多少？',options:['54 箱','52 箱','504 箱'],correct:0,hint:'1 個百拆成 10 個十，加上原有的 6 個十，是 16 個十。分完剩 1 個十，再拆成 10 個一，和 2 個一一起分。',why:'每船先拿 5 個十，再拿 4 個一，共 54 箱。54 × 3＝162。'};
 if(current==='division' && state.n===125) questions.division={q:'換一題：127 箱平均分給 4 艘船，結果是？',options:['每船 30 箱，剩 7 箱','每船 31 箱，剩 3 箱','每船 32 箱，剩 1 箱'],correct:1,hint:'127＝4 × 31＋3。剩下的箱子必須比船數 4 少，否則還能繼續分。',why:'每船 31 箱，剩 3 箱。31 × 4＋3＝127，而且 3 小於 4。'};
 const q=questions[current];$('#quiz').innerHTML=`<p>${q.q}</p><div class="answers">${q.options.map((a,i)=>`<button data-answer="${i}" aria-pressed="false">${a}</button>`).join('')}</div><p id="quiz-result" role="status" style="margin-top:14px;font-weight:400"></p>`;
 $('#quiz').scrollIntoView({behavior:paused?'instant':'smooth',block:'nearest'});
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-answer]').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));if(+b.dataset.answer===q.correct){progress[current]=true;try{localStorage.setItem('math-island-v1',JSON.stringify(progress));}catch{$('#storage-note').textContent='這次的發現暫時保存在畫面中，關閉後可能無法保留。';}updateProgress();$('#quiz-result').textContent='✓ 發現收進手冊了！'+q.why;$('#feedback').textContent='太好了！也試著用自己的話說說看。';}else{$('#quiz-result').textContent='再看看：'+q.hint;$('#feedback').textContent='可以回上面再操作一次，慢慢想。';}});
}

// One animation loop, capped at 30 fps; freeze on pause, hidden tab, or lesson view.
let lastSceneFrame=0;
function animateScene(now){
 if(scene3d && !paused && !document.hidden && !dialog.open && now-lastSceneFrame>33){
  const dt=Math.min((now-lastSceneFrame)/1000,.05);sceneTime+=dt;lastSceneFrame=now;
  if(journey){journey.elapsed+=dt;const sample=IslandAnimation.sampleJourney(journey,journey.elapsed);rabbitPose=sample.pose;if(sample.done)finishTravel();}
  drawMap();
 }
 else if(paused || document.hidden || dialog.open) lastSceneFrame=now;
 requestAnimationFrame(animateScene);
}
requestAnimationFrame(animateScene);
$('#island-3d').addEventListener('webglcontextlost',event=>{event.preventDefault();scene3d=null;$('#island-3d').hidden=true;document.querySelector('.map-wrap').classList.remove('has-3d');if(journey)finishTravel();drawMap();});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&journey){const button=journey.button;rabbitPose=[0,0,8,0];clearTravel();drawMap();button?.focus();}});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){paused=true;setMotion();if(journey)finishTravel();}});
