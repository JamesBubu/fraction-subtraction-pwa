const assert=require('node:assert/strict');
require('./scene3d.js');
const s=globalThis.MathIsland3D,g=s.makeScene();
assert.equal(g.length%30,0);
assert.ok(g.every(Number.isFinite));
assert.deepEqual(g,s.makeScene(),'Scene construction must be deterministic');
for(let i=0;i<g.length;i+=10){
 assert.ok(g.slice(i+6,i+9).every(c=>c>=0&&c<=1));
 const length=Math.hypot(...g.slice(i+3,i+6));
 assert.ok(length<.0001||Math.abs(length-1)<.0001,'Valid surface normal');
}
for(const aspect of [375/480,768/480,1400/680])for(let yaw=-Math.PI;yaw<=Math.PI;yaw+=Math.PI/8){
 const extent=Math.max(300,365/aspect),vp=s.multiply(s.ortho(-extent*aspect,extent*aspect,-extent,extent,1,1800),s.look([Math.sin(yaw+.52)*780,650,Math.cos(yaw+.52)*780],[0,0,0]));
 assert.ok(vp.every(Number.isFinite));
 for(const [x,z,h]of [[-150,95,115],[145,85,115],[-130,-110,78],[120,-125,115]]){
  const p=s.transform(vp,[x,h,z]);assert.ok(p.every(Number.isFinite));
  assert.ok(Math.abs(p[0])<1&&Math.abs(p[1])<1,'All four markers remain in the default viewport at every orbit angle');
 }
}
console.log(`PASS: ${g.length/30} triangles, finite geometry, normals, deterministic construction, full orbit at mobile/tablet/desktop sizes.`);
