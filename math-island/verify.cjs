// Verify the actual division state transitions used by the activity.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'island.js'),'utf8');
const functions = ['newDivision','advanceDivision'].map(name => {
  const line = source.split('\n').find(l => l.startsWith(`function ${name}(`));
  assert.ok(line, `Missing production function ${name}`);
  return line;
}).join('\n');
const context = vm.createContext({});
vm.runInContext(`const units=['百','十','一']; ${functions}; this.model={newDivision,advanceDivision};`,context);
const {newDivision,advanceDivision} = context.model;
let count=0;
for(let n=100;n<=999;n++) for(let d=2;d<=6;d++) {
  const s = newDivision(n,d);
  for(let step=0;!s.finished;step++) {
    assert.ok(step<6,'Activity must terminate');
    advanceDivision(s);
    const stock=s.counts.reduce((a,v,i)=>a+v*[100,10,1][i],0);
    const each=s.cargo.reduce((a,v,i)=>a+v*[100,10,1][i],0);
    assert.equal(stock+d*each,n,'Every transition conserves total quantity');
    assert.ok(s.counts.every(v=>Number.isInteger(v)&&v>=0));
  }
  assert.equal(s.cargo.reduce((a,v,i)=>a+v*[100,10,1][i],0),Math.floor(n/d));
  assert.equal(s.counts[2],n%d);
  assert.ok(s.counts[2]<d);
  const done=JSON.stringify(s);advanceDivision(s);assert.equal(JSON.stringify(s),done);
  count++;
}
for(const [n,d,q,r] of [[156,3,[0,5,2],0],[408,4,[1,0,2],0],[125,4,[0,3,1],1]]){
  const s=newDivision(n,d);while(!s.finished)advanceDivision(s);
  assert.equal(JSON.stringify(s.q),JSON.stringify(q));assert.equal(s.counts[2],r);
}
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const target=m[1];if(/^(https?:|data:)/.test(target))continue;
  assert.ok(fs.existsSync(path.resolve(__dirname,target)),`Broken asset or course link: ${target}`);
}
for(const lesson of ['division','place','multiply','fraction'])assert.ok(html.includes(`data-lesson="${lesson}"`));
console.log(`PASS: ${count} division examples, conservation at every step, zero placeholders, remainders, all local assets and course links.`);
