/* Pure animation state, shared by the renderer and verification. */
(function(root){
 const destinations={division:[-155,112],place:[145,120],multiply:[-140,-45],fraction:[90,-95]};
 const approaches={division:[-80,125],place:[90,130],multiply:[-80,-35],fraction:[60,-90]};
 const clamp=n=>Math.max(0,Math.min(1,n));
 function event(time,period,start,duration){const phase=((time%period)+period)%period;return phase>=start&&phase<start+duration?(phase-start)/duration:-1;}
 function environment(time){
  const d=event(time,32,6,4.4),w=event(time,53,19,11),g=event(time,39,10,11);
  return {dolphin:d<0?[0,-150,285,0]:[-90+150*d,-70+85*Math.sin(Math.PI*d),285,Math.cos(Math.PI*d)*.6],whale:w<0?[100,-150,290,0]:[75+95*w,-86+53*Math.sin(Math.PI*w),290,0],gull:g<0?[0,-250,0,0]:[-350+700*g,155+12*Math.sin(g*Math.PI),-70+50*g,0],spray:w>.35&&w<.63?Math.sin((w-.35)/.28*Math.PI):0};
 }
 function planJourney(from,id){const target=destinations[id];if(!target)throw Error('Unknown destination');const points=[[from[0],from[2]]];if(Math.hypot(from[0],from[2]-8)>10){const prior=Object.keys(destinations).find(k=>Math.hypot(from[0]-destinations[k][0],from[2]-destinations[k][1])<5);if(prior)points.push(approaches[prior]);points.push([0,8]);}points.push(approaches[id],target);const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const distance=lengths.reduce((a,b)=>a+b,0);return {id,points,lengths,distance,duration:Math.max(1.7,Math.min(3.3,distance/105)),elapsed:0};}
 function sampleJourney(j,elapsed){const t=clamp(elapsed/j.duration),e=t*t*(3-2*t);let distance=e*j.distance,segment=0;while(segment<j.lengths.length-1&&distance>j.lengths[segment])distance-=j.lengths[segment++];const a=j.points[segment],b=j.points[segment+1],f=j.lengths[segment]?clamp(distance/j.lengths[segment]):1;const hops=Math.max(3,Math.round(j.distance/34));return {done:t>=1,pose:[t>=1?b[0]:a[0]+(b[0]-a[0])*f,t>=1?0:Math.abs(Math.sin(e*Math.PI*hops))*12,t>=1?b[1]:a[1]+(b[1]-a[1])*f,Math.atan2(b[0]-a[0],b[1]-a[1])]};}
 root.IslandAnimation={destinations,environment,planJourney,sampleJourney,event};
})(typeof window==='undefined'?globalThis:window);
