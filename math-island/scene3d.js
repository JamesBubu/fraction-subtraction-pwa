/* Original, dependency-free WebGL miniature. All models are built locally. */
(function(root){
'use strict';
const norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
function look(eye,target){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function transform(m,p){return [0,1,2,3].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);}
function makeScene(){
 const data=[];let motion=0;
 const tri=(a,b,c,color)=>{const n=norm(cross(sub(b,a),sub(c,a))),col=typeof color==='string'?rgb(color):color;for(const p of [a,b,c])data.push(...p,...n,...col,motion);};
 const quad=(a,b,c,d,color)=>{tri(a,b,c,color);tri(a,c,d,color);};
 function box(x,y,z,w,h,d,c){const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],e=[x-w/2,y+h,z-d/2],f=[x+w/2,y+h,z-d/2],g=[x+w/2,y+h,z+d/2],hh=[x-w/2,y+h,z+d/2],cc=[x+w/2,y,z+d/2],dd=[x-w/2,y,z+d/2];quad(a,e,f,b,c);quad(b,f,g,cc,c);quad(cc,g,hh,dd,c);quad(dd,hh,e,a,c);quad(e,hh,g,f,c);}
 function cylinder(x,y,z,r0,r1,h,c,segments=16){for(let i=0;i<segments;i++){const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;const p=[x+r0*Math.cos(a),y,z+r0*Math.sin(a)],q=[x+r0*Math.cos(b),y,z+r0*Math.sin(b)],u=[x+r1*Math.cos(a),y+h,z+r1*Math.sin(a)],v=[x+r1*Math.cos(b),y+h,z+r1*Math.sin(b)];quad(p,u,v,q,c);tri([x,y+h,z],v,u,c);}}
 function ball(x,y,z,rx,ry,rz,c,s=12,rings=7){const p=(a,b)=>[x+rx*Math.sin(a)*Math.cos(b),y+ry*Math.cos(a),z+rz*Math.sin(a)*Math.sin(b)];for(let j=0;j<rings;j++)for(let i=0;i<s;i++){const a=j*Math.PI/rings,b=(j+1)*Math.PI/rings,u=i*Math.PI*2/s,v=(i+1)*Math.PI*2/s;quad(p(a,u),p(a,v),p(b,v),p(b,u),c);}}
 function beam(a,b,r,c){const delta=sub(b,a),axis=norm(delta),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u),n=8;for(let i=0;i<n;i++){const p=t=>u.map((k,j)=>(k*Math.cos(t)+v[j]*Math.sin(t))*r);const o=p(i*2*Math.PI/n),q=p((i+1)*2*Math.PI/n);quad(a.map((k,j)=>k+o[j]),b.map((k,j)=>k+o[j]),b.map((k,j)=>k+q[j]),a.map((k,j)=>k+q[j]),c);}}
 function ring(x,y,z,r,w,c,segments=64){for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;quad([x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],[x+(r+w)*Math.cos(b),y,z+(r+w)*Math.sin(b)],[x+(r+w)*Math.cos(a),y,z+(r+w)*Math.sin(a)],c);}}
 // Undulating shoreline: three solid layers, each with a bevel and shaded facets.
 const edge=Array.from({length:72},(_,i)=>{const a=i*Math.PI*2/72,r=1+.045*Math.sin(a*5)+.025*Math.cos(a*9);return [Math.cos(a)*278*r,Math.sin(a)*206*r];});
 function land(scale,y,h,c,top){for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length],p=[a[0]*scale,y,a[1]*scale],q=[b[0]*scale,y,b[1]*scale],u=[a[0]*scale*.99,y+h,a[1]*scale*.99],v=[b[0]*scale*.99,y+h,b[1]*scale*.99];quad(p,u,v,q,c);tri([0,y+h,0],v,u,top);}}
 motion=2;for(let x=-1200;x<1200;x+=40)for(let z=-1200;z<1200;z+=40)quad([x,-47,z],[x,-47,z+40],[x+40,-47,z+40],[x+40,-47,z],'#80c5c6');motion=0;
 land(1.065,-47,16,'#bca481','#e8d6af');land(1.025,-31,24,'#c9b58e','#ecdfb3');land(.96,-7,8,'#83a16b','#abc983');
 // Sand ripples and stones, plus a little offshore island.
 for(let i=0;i<24;i++){const a=i*2.399,r=1.01;ball(Math.cos(a)*279*r,-29,Math.sin(a)*207*r,6+i%5,4,5,'#dfd9c2',7,4);}
 cylinder(320,-46,-145,35,31,42,'#e1cfaa',20);cylinder(320,-4,-145,28,25,5,'#a9c783',20);
 // Paths assembled from warm inset stepping stones.
 for(const [tx,tz] of [[-150,95],[145,85],[-130,-110],[120,-125]])for(let i=1;i<15;i++){const t=i/15;const x=tx*t,z=tz*t+Math.sin(t*Math.PI)*12; cylinder(x,1.2,z,10,9,1.5,i%3?'#dfd7b8':'#eee4cb',8);}
 cylinder(0,1,0,39,39,2,'#d1c6a6',32);cylinder(0,3,0,35,35,1,'#e8ddc3',32);
 function tree(x,z,s=1,fruit=false){const previousMotion=motion;motion=3;cylinder(x,1,z,3*s,2*s,23*s,'#987351',9);beam([x,15*s,z],[x-10*s,31*s,z+3*s],1.4*s,'#987351');ball(x,43*s,z,18*s,23*s,18*s,'#709f62');ball(x-11*s,36*s,z-4*s,14*s,16*s,13*s,'#8bb676');ball(x+10*s,34*s,z+6*s,14*s,17*s,14*s,'#5e8d58');if(fruit)for(let j=0;j<5;j++){const a=j*2.4;ball(x+Math.cos(a)*15*s,(32+j%3*8)*s,z+Math.sin(a)*15*s,3*s,3.4*s,3*s,'#e7a25e',8,5);}motion=previousMotion;}
 [[-230,-60],[-215,5],[-220,-120],[-65,-175],[-20,-172],[45,-175],[223,-45],[224,10],[218,80],[185,136],[55,157],[-20,153],[-80,155],[320,-145]].forEach(([x,z],i)=>tree(x,z,.75+(i%3)*.17));
 function pine(x,z,s){motion=3;cylinder(x,1,z,2,2,16*s,'#917354',8);for(let i=0;i<3;i++)cylinder(x,12*s+i*13*s,z,(19-i*4)*s,0,29*s,['#6a9472','#79a17b','#8ab083'][i],9);motion=0;}
 pine(-245,-5,.85);pine(200,-105,.9);pine(17,-159,.85);
 // Meadow detail has fixed coordinates; no random flickering while orbiting.
 for(let i=0;i<105;i++){const a=i*2.399,r=180+(i%5)*9,x=Math.cos(a)*r*1.1,z=Math.sin(a)*r*.79;if(z>85&&x<-90)continue;for(let j=0;j<3;j++)tri([x+j*2,1,z],[x+j*2+1,5+(i%4),z],[x+j*2+2,1,z],'#82a466');if(i%7===0){cylinder(x,1,z,1,1,7,'#719158',5);ball(x,8,z,2.5,1.6,2.5,i%2?'#f2d58b':'#e8b6a5',7,4);}}
 function roof(x,z,w,d,y,rise,c){quad([x-w/2,y,z-d/2],[x,y+rise,z-d/2],[x,y+rise,z+d/2],[x-w/2,y,z+d/2],c);quad([x,y+rise,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x,y+rise,z+d/2],c);tri([x-w/2,y,z+d/2],[x,y+rise,z+d/2],[x+w/2,y,z+d/2],'#f2dfb9');tri([x+w/2,y,z-d/2],[x,y+rise,z-d/2],[x-w/2,y,z-d/2],'#ebd5ad');
  for(let side of [-1,1])for(let row=0;row<5;row++)for(let col=0;col<8;col++){const t=(row+.5)/5,xx=x+side*t*w/2,yy=y+rise*(1-t)+1.5,zz=z-d/2+(col+.5)*d/8;beam([xx-side*3,yy+rise*6/w,zz-3],[xx+side*3,yy-rise*6/w,zz-3],1.6,c==='#6e9c96'?(row%2?'#82aaa3':'#94bab1'):(row%2?'#c17e61':'#d79270'));}
 beam([x,y+rise+1,z-d/2-2],[x,y+rise+1,z+d/2+2],3,c);
 }
 function windowFront(x,y,z){box(x,y,z,15,17,2,'#f5edcf');box(x,y+2,z+1.3,11,13,1,'#669fa4');box(x,y+2,z+2,1.2,13,1,'#fff2cc');box(x,y+8,z+2,11,1.2,1,'#fff2cc');box(x,y-2,z+2,20,3,6,'#bd9166');box(x,y-1,z+3,16,2,3,'#6f9b62');for(let i=-1;i<=1;i++)ball(x+i*5,y+2,z+4,2,2,2,'#e7ba82',7,4);}
 function cottage(x,z,port=false){box(x,1,z,77,5,62,'#aaac98');box(x,6,z,70,46,56,port?'#e5e5c8':'#f3ddaf');for(const xx of [-32,32])box(x+xx,6,z+29,4,46,3,'#bea47b');roof(x,z,84,72,52,29,port?'#6e9c96':'#c98767');box(x,6,z+29,15,29,3,'#73988b');box(x,10,z+31,10,21,1,'#7eaa9b');ball(x+4,21,z+32,1.4,1.4,1,'#e9c583',6,4);windowFront(x-23,25,z+29);windowFront(x+23,25,z+29);box(x,2,z+37,24,4,12,'#c9c6ad');box(x,1,z+44,29,2,7,'#ded4ba');box(x+21,62,z-14,10,25,12,'#be9d80');box(x+21,86,z-14,14,4,16,'#e3ccb1');box(x+21,90,z-14,8,1,10,'#655f55');
 for(let i=0;i<3;i++)box(x+21,66+i*6,z-7.7,10,1,1,'#e2c6a4');
 // Side windows have actual depth on both walls.
 for(const side of [-1,1]){box(x+side*35.8,23,z-5,2,18,17,'#ece6c8');box(x+side*37,25,z-5,1,14,13,'#75a7aa');box(x+side*37.7,25,z-5,1,14,1,'#f7e8c8');}
 }
 cottage(145,75);cottage(-155,65,true);
 // Workshop's measuring blocks and an outdoor workbench.
 box(189,1,110,22,22,22,'#c98161');box(189,23,110,17,17,17,'#e3bf73');box(172,1,119,14,14,14,'#81a7a1');box(123,17,124,41,4,15,'#b28b5d');for(const x of [107,139])box(x,1,124,4,16,11,'#947451');for(let i=0;i<10;i++)box(108+i*3,21,124,1,1,7,'#ebd2a1');
 // Planked pier with piles, ropes, bollards and stacked cargo.
 for(let i=0;i<12;i++)box(-160,0,112+i*7,98,5,6.2,i%3?'#b79264':'#c9a577');
 for(const x of [-207,-113])for(const z of [112,147,182]){cylinder(x,-42,z,3.5,3.5,53,'#947353',10);cylinder(x,10,z,5,5,3,'#e7d5b3',12);}
 for(const x of [-207,-113])for(const z of [112,147]){beam([x,8,z],[x,5,z+17],.8,'#e4d8b6');beam([x,5,z+17],[x,8,z+35],.8,'#e4d8b6');}
 function crate(x,y,z,s){box(x,y,z,s,s,s,'#b58a5a');for(const off of [-.35,.35]){box(x+off*s,y,z+s/2+.5,2,s,1,'#e0bb80');box(x,y+off*s+s/2,z+s/2+1,s,2,1,'#deb77d');}beam([x-s*.4,y+2,z+s/2+1],[x+s*.4,y+s-2,z+s/2+1],1,'#e8c793');}
 crate(-184,5,143,15);crate(-168,5,146,13);crate(-184,20,143,12);
 // Lighthouse, balcony and glazed lantern.
 cylinder(-227,1,84,16,13,7,'#ddd4b7',18);cylinder(-227,8,84,11,7,56,'#f1e4bf',18);cylinder(-227,27,84,9.7,9.1,9,'#b9785e',18);cylinder(-227,62,84,13,13,3,'#7a9689',18);cylinder(-227,65,84,7,7,13,'#9dc6c0',12);for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(-227+8*Math.cos(a),65,84+8*Math.sin(a),.8,.8,14,'#668a82',6);}cylinder(-227,79,84,13,0,12,'#688b85',16);ball(-227,72,84,4,4,4,'#ffe7a4',10,6);
 // Boat gently moves as a single vertex group.
 motion=1;const bx=-149,bz=234,by=-32;
 quad([bx-39,by+10,bz-12],[bx+29,by+10,bz-12],[bx+37,by+10,bz],[bx-39,by+10,bz+12],'#e1c391');
 quad([bx-39,by+10,bz+12],[bx+37,by+10,bz],[bx+22,by,bz+8],[bx-29,by,bz+8],'#b67c56');quad([bx-39,by+10,bz-12],[bx-29,by,bz-8],[bx+22,by,bz-8],[bx+37,by+10,bz],'#c89062');
 box(bx-5,by+10,bz,25,17,19,'#f1deb1');box(bx-5,by+27,bz,31,3,23,'#749e99');box(bx-5,by+15,bz+10,14,8,1,'#62949f');beam([bx+17,by+10,bz],[bx+17,by+58,bz],1,'#ad8d61');tri([bx+17,by+56,bz],[bx+17,by+21,bz],[bx+36,by+21,bz],'#fff0c8');motion=0;
 // Fruit orchard, vegetable rows, split-rail fences and a small cart.
 for(let j=0;j<3;j++){box(-140,1,-128+j*26,120,2,17,'#a5ac77');for(let i=0;i<4;i++)tree(-184+i*30,-128+j*26,.61,true);}
 function fence(x,z,len){for(let i=0;i<=len;i+=15)box(x+i,1,z,3,16,3,'#ebdfb9');box(x+len/2,6,z,len,2,2,'#e7d9ad');box(x+len/2,13,z,len,2,2,'#e7d9ad');}
 fence(-205,-154,130);fence(-205,-51,55);fence(-113,-51,39);
 box(-77,9,-88,20,8,27,'#b99561');for(const z of [-99,-77])ball(-65,6,z,3,6,6,'#756f59',10,6);for(let j=0;j<4;j++)ball(-81+j%2*8,19,-94+Math.floor(j/2)*10,4,4,4,'#e2a25f',9,5);
 // Picnic blanket, table, stools, dishes, wicker basket and segmented parasol.
 box(118,1,-123,88,1,65,'#eddfbf');for(let x=0;x<8;x++)for(let z=0;z<6;z++)if((x+z)%2===0)box(79+x*11,2,-150+z*10,10.7,.3,9.7,'#dba88b');
 box(110,20,-126,44,5,24,'#e8c78f');for(const x of [93,127])for(const z of [-134,-118])box(x,3,z,3,17,3,'#ae8b5b');
 for(const x of [86,138]){cylinder(x,3,-126,8,8,12,'#bf9d6b',12);cylinder(x,15,-126,9,9,3,'#e7cc98',12);}
 cylinder(104,25.5,-125,7,7,1,'#fff4d8',18);ball(104,28,-125,5,2.5,4,'#d6a96b',12,6);cylinder(121,26,-125,2.5,2.5,5,'#93b3a5',12);
 box(147,3,-107,14,11,11,'#bc9661');for(let i=0;i<4;i++)box(147,5+i*2.5,-101.3,14,.7,.8,'#e5c28a');
 cylinder(156,3,-148,1.7,1.7,73,'#a38b64',10);for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;tri([156,86,-148],[156+37*Math.cos(b),69,-148+37*Math.sin(b)],[156+37*Math.cos(a),69,-148+37*Math.sin(a)],i%2?'#edcf92':'#f5e8c9');}ball(156,87,-148,2.4,3,2.4,'#bca078',8,5);
 // Friendly clay rabbit; position and facing are animated by the journey.
 motion=4;
 ball(0,13,8,10,13,8,'#f7edda');ball(0,30,8,11,10,9,'#fff4e1');ball(-5,44,8,3.4,12,3.5,'#fff4e1');ball(5,44,8,3.4,12,3.5,'#fff4e1');ball(-5,44,11,1.8,8,1,'#e8bcae');ball(5,44,11,1.8,8,1,'#e8bcae');ball(-4,31,16,1.3,1.7,1,'#415f54',8,5);ball(4,31,16,1.3,1.7,1,'#415f54',8,5);ball(0,27,17,1.6,1.1,1,'#cd9c87',8,5);ball(-6,3,13,5,3,6,'#f7edda');ball(6,3,13,5,3,6,'#f7edda');

 // Local marine models face +X; event uniforms place them beyond the shore.
 motion=5;
 ball(0,0,0,22,8,8,'#729eaa',16,8);ball(19,-1,0,11,3,3.5,'#89b4bd',12,6);
 tri([-5,6,0],[-10,18,0],[6,6,0],'#608998');
 tri([-22,0,0],[-36,2,-12],[-31,1,0],'#608998');tri([-22,0,0],[-31,1,0],[-36,2,12],'#608998');
 tri([3,-2,5],[-9,-8,19],[-9,-3,6],'#608998');tri([3,-2,-5],[-9,-3,-6],[-9,-8,-19],'#608998');
 ball(17,2,6,1.2,1.3,1,'#263f4b',8,5);
 motion=6;
 ball(0,0,0,38,15,17,'#638c9e',20,10);ball(21,-4,0,22,9,14,'#a6c4c8',16,8);
 tri([-32,0,0],[-57,2,-19],[-49,1,0],'#537c90');tri([-32,0,0],[-49,1,0],[-57,2,19],'#537c90');
 tri([2,-5,13],[-14,-11,31],[-15,-5,12],'#537c90');tri([2,-5,-13],[-15,-5,-12],[-14,-11,-31],'#537c90');
 ball(28,2,13,1.6,1.6,1,'#263f4b',8,5);
 motion=8;
 for(let j=0;j<16;j++){const a=j*2.399;ball(15+Math.cos(a)*(2+j*.55),20+j*1.7,Math.sin(a)*(2+j*.55),1.2,2.7,1.2,'#d6f2ed',7,4);}
 motion=7;
 // Body travels forward along X; wings flap along local Z.
 ball(0,0,0,7,2.5,2.8,'#fff9e8',12,6);ball(6,1,0,2.8,2.8,2.5,'#fff9e8',10,6);
 tri([8,1,-1],[13,0,0],[8,1,1],'#d9ae64');
 for(const side of [-1,1]){tri([3,0,side*2],[-3,1,side*18],[-7,0,side*3],'#f7f1df');tri([-3,1,side*18],[-9,0,side*24],[-7,0,side*3],'#81918d');}
 motion=0;
 return new Float32Array(data);
}
function create(canvas){
 const gl=canvas.getContext('webgl',{antialias:true,alpha:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');
 const geometry=makeScene();
 const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aMotion;uniform mat4 uVP;uniform mat4 uLight;uniform float uTime;uniform vec4 uRabbit;uniform vec4 uDolphin;uniform vec4 uWhale;uniform vec4 uGull;uniform float uSpray;varying vec3 vColor;varying vec3 vNormal;varying vec3 vPosition;varying vec4 vShadow;varying float vWater;
 void main(){vec3 p=aPosition;vec3 n=aNormal;
 if(aMotion>.5&&aMotion<1.5)p.y+=sin(uTime*1.25)*1.5;
 vWater=(aMotion>1.5&&aMotion<2.5)?1.:0.;
 if(vWater>.5){float a=p.x*.035+uTime*1.5,b=p.z*.049-uTime*.9;p.y+=sin(a)*1.4+sin(b)*.8;n=normalize(vec3(-cos(a)*.049,1.,-cos(b)*.0392));}
 if(aMotion>2.5&&aMotion<3.5){float gust=pow(max(0.,sin(uTime*.32)),3.);p.x+=sin(uTime*1.8+p.z*.04)*gust*pow(max(p.y,0.)/50.,1.5)*2.5;}
 if(aMotion>3.5&&aMotion<4.5){p.z-=8.;float c=cos(uRabbit.w),s=sin(uRabbit.w);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z)+uRabbit.xyz;n=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);}
 if(aMotion>4.5&&aMotion<5.5){float c=cos(uDolphin.w),s=sin(uDolphin.w);p=vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z)+uDolphin.xyz;n=vec3(c*n.x-s*n.y,s*n.x+c*n.y,n.z);}
 if(aMotion>5.5&&aMotion<6.5)p+=uWhale.xyz;
 if(aMotion>6.5&&aMotion<7.5){p.y+=sin(uTime*5.)*abs(p.z)*.3;p+=uGull.xyz;}
 if(aMotion>7.5){p.y=15.+(p.y-15.)*uSpray;p+=uWhale.xyz;if(uSpray<.01)p.y=-160.;}
 vColor=aColor;vNormal=n;vPosition=p;vShadow=uLight*vec4(p,1.0);gl_Position=uVP*vec4(p,1.0);}`;
 const fragment=`precision highp float;varying vec3 vColor;varying vec3 vNormal;varying vec3 vPosition;varying vec4 vShadow;varying float vWater;uniform sampler2D uShadow;uniform float uTime;float unpackDepth(vec4 c){return dot(c,vec4(1.0,1.0/255.0,1.0/65025.0,1.0/16581375.0));}void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 light=normalize(vec3(-.55,1.,.55));float diffuse=max(dot(n,light),0.0);vec3 p=vShadow.xyz/vShadow.w*.5+.5;float shade=0.;if(p.x>0.&&p.x<1.&&p.y>0.&&p.y<1.){for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float depth=unpackDepth(texture2D(uShadow,p.xy+vec2(float(x),float(y))/2048.));shade+=p.z-.0018>depth?1.:0.;}shade/=9.;}vec3 col=vColor*(.67+.36*diffuse*(1.-shade*.65));col+=vec3(.035,.025,.005)*max(n.y,0.);if(vWater>.5){float wave=sin(vPosition.x*.08+uTime*.7)*sin(vPosition.z*.12-uTime*.4);col+=wave*.025;float foam=pow(max(0.,sin(vPosition.x*.035+vPosition.z*.08+uTime*.4)),24.);col+=foam*.13;float shore=length(vPosition.xz/vec2(292.,219.));float swell=sin(shore*90.-uTime*2.4+sin(vPosition.x*.025)*.6);float band=smoothstep(1.0,1.06,shore)*(1.-smoothstep(1.15,1.32,shore));col=mix(col,vec3(.84,.95,.88),pow(max(swell,0.),9.)*band*.65);}gl_FragColor=vec4(col,1.);}`;
 const depthFrag=`precision highp float;void main(){vec4 c=fract(gl_FragCoord.z*vec4(1.,255.,65025.,16581375.));c-=c.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=c;}`;
 function program(f){const p=gl.createProgram();for(const [type,code]of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 const main=program(fragment),depth=program(depthFrag),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,geometry,gl.STATIC_DRAW);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,2048,0,gl.RGBA,gl.UNSIGNED_BYTE,null);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 const target=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,2048,2048);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Shadow framebuffer unavailable');
 const light=multiply(ortho(-440,440,-440,440,1,1600),look([-500,850,500],[0,0,0]));let vp;
 function bind(p,m,time,rabbit){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);for(const [name,size,offset]of [['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aMotion',1,36]]){const a=gl.getAttribLocation(p,name);if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,40,offset);}}gl.uniformMatrix4fv(gl.getUniformLocation(p,'uVP'),false,m);gl.uniformMatrix4fv(gl.getUniformLocation(p,'uLight'),false,light);gl.uniform1f(gl.getUniformLocation(p,'uTime'),time);const env=root.IslandAnimation.environment(time);for(const [name,value]of [['uRabbit',rabbit],['uDolphin',env.dolphin],['uWhale',env.whale],['uGull',env.gull]])gl.uniform4fv(gl.getUniformLocation(p,name),value);gl.uniform1f(gl.getUniformLocation(p,'uSpray'),env.spray);}
 function render(yaw,zoom,time=0,rabbit=[0,0,8,0]){const rect=canvas.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,2),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const aspect=w/h,extent=Math.max(300,365/aspect)/zoom,theta=yaw+.52;vp=multiply(ortho(-extent*aspect,extent*aspect,-extent,extent,1,1800),look([Math.sin(theta)*780,650,Math.cos(theta)*780],[0,0,0]));gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.viewport(0,0,2048,2048);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);bind(depth,light,time,rabbit);gl.drawArrays(gl.TRIANGLES,0,geometry.length/10);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(.67,.83,.81,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);bind(main,vp,time,rabbit);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(gl.getUniformLocation(main,'uShadow'),0);gl.drawArrays(gl.TRIANGLES,0,geometry.length/10);}
 return {render,project(x,z,height){const p=transform(vp,[x,height,z]),r=canvas.getBoundingClientRect();return [(p[0]/p[3]+1)*r.width/2,(1-p[1]/p[3])*r.height/2];},vertices:geometry.length/10};
}
root.MathIsland3D={create,makeScene,multiply,ortho,look,transform};
})(typeof window==='undefined'?globalThis:window);
