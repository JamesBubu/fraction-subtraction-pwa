const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
require('./animation-state.js');const A=globalThis.IslandAnimation;
for(const time of [0,5,6,8,11,19,23,29,33,52,53,100,1000]){
 const e=A.environment(time);assert.ok(Object.values(e).flat().every(Number.isFinite));
 assert.ok(e.spray>=0&&e.spray<=1);
}
assert.ok(A.environment(0).dolphin[1]<-100);assert.ok(A.environment(8.2).dolphin[1]>0);
assert.ok(A.environment(24.5).whale[1]>-47);assert.ok(A.environment(24.5).spray>.9);
assert.ok(A.environment(15).gull[1]>150);assert.ok(A.environment(30).gull[1]<0);
for(const start of [[0,0,8,0],...Object.values(A.destinations).map(([x,z])=>[x,0,z,0])])for(const id of Object.keys(A.destinations)){
 const j=A.planJourney(start,id);assert.deepEqual(A.sampleJourney(j,0).pose.slice(0,3),start.slice(0,3));
 for(let t=0;t<j.duration;t+=.025){const r=A.sampleJourney(j,t);assert.ok(!r.done);assert.ok(r.pose.every(Number.isFinite));assert.ok(r.pose[1]>=0&&r.pose[1]<=12);}
 const end=A.sampleJourney(j,j.duration);assert.ok(end.done);assert.equal(end.pose[0],A.destinations[id][0]);assert.equal(end.pose[2],A.destinations[id][1]);assert.equal(end.pose[1],0);
}
// Exercise production journey/dialog handlers with a minimal DOM, without a browser.
function harness(){const elements=new Map(),listeners={};const element=key=>{if(!elements.has(key))elements.set(key,{style:{},dataset:{},hidden:false,open:false,classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(){},scrollIntoView(){},focus(){},getBoundingClientRect(){return {width:1100,height:640};},showModal(){this.open=true;this.opens=(this.opens||0)+1;},close(){this.open=false;}});return elements.get(key);};const context={console,Math,JSON,Float32Array,performance:{now:()=>0},requestAnimationFrame(){},ResizeObserver:class{observe(){}},matchMedia:()=>({matches:false,addEventListener(){}}),localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false,body:{classList:{toggle(){}}},querySelector:element,querySelectorAll:()=>[],addEventListener:(type,f)=>(listeners[type]??=[]).push(f)}};context.window=context;context.MathIsland3D={create:()=>({render(){},project:()=>[100,100]})};vm.createContext(context);for(const name of ['animation-state.js','island.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),context);return {run:s=>vm.runInContext(s,context),element,listeners};}
let h=harness();h.run("openLesson('division',null)");assert.equal(h.element('#lesson-dialog').open,false);
h.run("openLesson('place',null)");assert.equal(h.run('journey.id'),'division','Repeated clicks cannot queue another dialog');
for(let t=40;t<5000;t+=40)h.run(`animateScene(${t})`);
assert.equal(h.element('#lesson-dialog').open,true);assert.equal(h.element('#lesson-dialog').opens,1);assert.equal(h.run('current'),'division');assert.equal(h.run('journey'),null);
h=harness();h.run("openLesson('place',null);finishTravel()");assert.equal(h.run('current'),'place');assert.equal(h.element('#lesson-dialog').opens,1);
h=harness();h.run("openLesson('multiply',null)");h.element('#motion').onclick();assert.equal(h.run('current'),'multiply');assert.equal(h.element('#lesson-dialog').opens,1);
h=harness();h.run("openLesson('fraction',null)");for(const fn of h.listeners.keydown||[])fn({key:'Escape'});assert.equal(h.run('journey'),null);assert.equal(h.element('#lesson-dialog').open,false);
h=harness();h.run("paused=true;openLesson('fraction',null)");assert.equal(h.element('#lesson-dialog').opens,1);assert.equal(h.run('journey'),null);
h=harness();h.run("openLesson('division',null);document.hidden=true;animateScene(5000)");assert.equal(h.run('journey.elapsed'),0);assert.equal(h.element('#lesson-dialog').open,false);
console.log('PASS: animal event schedules, 20 journey routes, exact arrivals, delayed lesson, repeated clicks, skip, pause, Escape, reduced motion, hidden-page freeze.');
