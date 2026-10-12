<!-- Faísca · port do gemini-io2026-spark2 (three.js via CDN) -->
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* Parâmetros da referência (objeto `ll` no bundle do Gemini) */
const CFG={particleCount:80000,colorSaturation:.75,scatterTop:1,scatterBottom:.15,shrinkSpeed:15,entranceDelayMs:2000,entranceGrowSpeed:.8,entranceLingerSeconds:3,sparkCurveN:.7,roundingFactor:.18,
  coreGreenColor:'#00B95C',coreYellowColor:'#FFCC00',coreRedColor:'#FF4641',coreBlueColor:'#3186FF',autoReturnToFront:true,autoReturnForce:.15,autoReturnForceDecay:.02};
const sign=e=>e>0?1:e<0?-1:0;
const smooth=(a,b,x)=>{ const r=Math.max(0,Math.min(1,(x-a)/(b-a))); return r*r*(3-2*r); };
const REDUZ=matchMedia('(prefers-reduced-motion: reduce)').matches;

function spark(host,{count=CFG.particleCount,radius=120,scrollEl=null,sizeToWindow=false}={}){
  const scene=new THREE.Scene();
  const wrap=document.createElement('div'); Object.assign(wrap.style,{overflow:'hidden',width:'100%',height:'100%',position:'absolute',top:0,left:0});
  const canvas=document.createElement('canvas'); canvas.style.display='block'; wrap.appendChild(canvas); host.appendChild(wrap);
  let renderer; try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); }catch(e){ return null; }
  const size=()=>sizeToWindow?[innerWidth,innerHeight]:[host.clientWidth||1,host.clientHeight||1];
  let [W,H]=size(); renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const camera=new THREE.PerspectiveCamera(75,W/H,.1,2000); camera.position.z=240;
  const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.05; controls.enableZoom=false;
  let dragging=false, returning=false, returnForce=CFG.autoReturnForce;
  controls.addEventListener('start',()=>{ dragging=true; returning=true; returnForce=CFG.autoReturnForce; });
  controls.addEventListener('end',()=>{ dragging=false; });
  const coarse=matchMedia('(hover: none) and (pointer: coarse)').matches; canvas.style.pointerEvents=coarse?'none':'auto';

  /* atributos por ponto: ângulo na superelipse, raio^5, profundidade, tamanho-base */
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3), col=new Float32Array(count*3), siz=new Float32Array(count);
  const ang=new Float32Array(count), rad=new Float32Array(count), dep=new Float32Array(count), bsz=new Float32Array(count);
  for(let i=0;i<count;i++){ ang[i]=Math.random()*Math.PI*2; rad[i]=Math.random()**5; dep[i]=Math.random()+Math.random()+Math.random()-1.5; bsz[i]=.8+Math.random()*1.2; }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('customSize',new THREE.BufferAttribute(siz,1));
  const core=[CFG.coreGreenColor,CFG.coreYellowColor,CFG.coreRedColor,CFG.coreBlueColor].map(c=>new THREE.Color(c));
  const edge=['#00A5B7','#FF6B2B','#D8627E','#A975AA'].map(c=>new THREE.Color(c));
  const hsl={h:0,s:0,l:0}; for(const c of [...core,...edge]){ c.getHSL(hsl); c.setHSL(hsl.h,hsl.s*CFG.colorSaturation,hsl.l); }
  let state=3, nextState=3; const waves=[];
  const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2(-9999,-9999), plane=new THREE.Plane(new THREE.Vector3(0,0,1),0), hit=new THREE.Vector3(), local=new THREE.Vector3(); let hover=false;
  const rect=()=>sizeToWindow?{left:0,top:0,width:innerWidth,height:innerHeight}:host.getBoundingClientRect();
  addEventListener('pointermove',e=>{ const r=rect(); mouse.x=(e.clientX-r.left)/r.width*2-1; mouse.y=-((e.clientY-r.top)/r.height)*2+1; hover=mouse.x>-1&&mouse.x<1&&mouse.y>-1&&mouse.y<1; });
  addEventListener('pointerleave',()=>{ hover=false; mouse.set(-9999,-9999); });
  const pulse=()=>{ nextState=(nextState+1)%core.length; waves.push({radius:0,stateIndex:nextState,width:75,speed:750}); };
  canvas.addEventListener('pointerdown',pulse);

  const mat=new THREE.ShaderMaterial({uniforms:{uPixelRatio:{value:renderer.getPixelRatio()}},vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float customSize; varying vec3 vColor; uniform float uPixelRatio;
      void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=customSize*uPixelRatio*(250.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying vec3 vColor;
      void main(){ float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.4,0.5,d); gl_FragColor=vec4(vColor,a); }`});
  const points=new THREE.Points(geo,mat); points.scale.set(0,0,0); points.visible=false; scene.add(points);
  let entered=false; setTimeout(()=>{ points.visible=true; entered=true; },REDUZ?0:CFG.entranceDelayMs);
  if(REDUZ) points.scale.set(1,1,1);

  /* rolagem recolhe a dispersão */
  let scatter=CFG.scatterTop, scatterTarget=CFG.scatterTop;
  if(scrollEl){ addEventListener('scroll',()=>{ const t=scrollEl.getBoundingClientRect(); let n=0; if(t.top<0){ const e=t.height-innerHeight; n=e>0?Math.min(1,-t.top/e):t.bottom>0?-t.top/t.height:1; } const r=Math.min(1,n*CFG.shrinkSpeed); scatterTarget=CFG.scatterTop-(CFG.scatterTop-CFG.scatterBottom)*r; },{passive:true}); }

  const clock=new THREE.Clock(); let phase=-Math.PI/2, spin=0, linger=0, visible=true, raf=0;
  const io=new IntersectionObserver(([e])=>{ visible=e.isIntersecting; if(visible&&!raf) raf=requestAnimationFrame(loop); }); io.observe(host);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&visible&&!raf) raf=requestAnimationFrame(loop); });
  const one=new THREE.Vector3(1,1,1), origin=new THREE.Vector3();

  function loop(){
    raf=0; if(!visible||document.hidden) return; raf=requestAnimationFrame(loop);
    const dt=Math.min(clock.getDelta(),.05);
    if(entered){ linger+=dt; if(linger>CFG.entranceLingerSeconds){ if(!returning) spin+=dt; const sp=(.15+(((3.5+CFG.sparkCurveN)/2+(3.5-CFG.sparkCurveN)/2*Math.sin(phase)-(CFG.sparkCurveN-.1))**2)*.15)*1.2; phase+=dt*sp; } }
    scatter+=(scatterTarget-scatter)*.1;
    const n=(3.5+CFG.sparkCurveN)/2+(3.5-CFG.sparkCurveN)/2*Math.sin(phase);
    waves.forEach(w=>w.radius+=dt*w.speed); while(waves.length&&waves[0].radius>=1500){ state=waves[0].stateIndex; waves.shift(); }
    const r=spin*.22; points.rotation.x=Math.sin(r*2)**3*.85; points.rotation.y=Math.sin(r)**3*1.15; points.rotation.z=Math.sin(r)**3*-.65; points.updateMatrixWorld();
    if(hover){ raycaster.setFromCamera(mouse,camera); raycaster.ray.intersectPlane(plane,hit); local.copy(hit); points.worldToLocal(local); } else local.set(-9999,-9999,-9999);
    const peek=(nextState+1)%core.length;
    for(let i=0;i<count;i++){
      const t=ang[i], rr=rad[i], c=Math.cos(t), s=Math.sin(t);
      const ox=Math.abs(c)**(2/n)*sign(c), oy=Math.abs(s)**(2/n)*sign(s);
      const rf=CFG.roundingFactor*Math.cos(2*t)**2;
      let x=ox*(1-rf)+c*rf, y=oy*(1-rf)+s*rf;
      const m=1+rr*scatter-.04, z=dep[i]*radius*(.1+1.2*scatter);
      x*=radius*m; y*=radius*m;
      let d=Math.sqrt(x*x+y*y+z*z)||.001;
      let st=state, boost=1;
      for(const w of waves){ if(d<w.radius) st=w.stateIndex; const nd=Math.abs(d-w.radius); if(nd<w.width){ boost=Math.max(boost,1+(1-nd/w.width)*1.5); } }
      let hv=0; if(hover){ const ex=x-local.x, ey=y-local.y, ez=z-local.z, hd=Math.sqrt(ex*ex+ey*ey+ez*ez); if(hd<75){ hv=1-smooth(0,1,hd/75); boost=Math.max(boost,1+hv*.85); } }
      const o=i*3; pos[o]=x; pos[o+1]=y; pos[o+2]=z;
      const k=1-Math.min(Math.max((d-40)/220,0),1); siz[i]=bsz[i]*(.01+k*1.8);
      const a=core[st], b=edge[st], mix=smooth(0,1,smooth(.08,.55,rr));
      let R=a.r+(b.r-a.r)*mix, G=a.g+(b.g-a.g)*mix, B=a.b+(b.b-a.b)*mix;
      if(hv>0){ const pa=core[peek], pb=edge[peek]; R+=((pa.r+(pb.r-pa.r)*mix)-R)*hv; G+=((pa.g+(pb.g-pa.g)*mix)-G)*hv; B+=((pa.b+(pb.b-pa.b)*mix)-B)*hv; }
      if(boost>1){ R=Math.min(1,R*boost); G=Math.min(1,G*boost); B=Math.min(1,B*boost); }
      col[o]=R; col[o+1]=G; col[o+2]=B;
    }
    geo.attributes.position.needsUpdate=true; geo.attributes.color.needsUpdate=true; geo.attributes.customSize.needsUpdate=true;
    if(entered&&!REDUZ) points.scale.lerp(one,dt*CFG.entranceGrowSpeed);
    if(CFG.autoReturnToFront&&returning&&!dragging){
      if(returnForce>.001){
        const f=new THREE.Vector3(0,0,240).applyEuler(points.rotation), bk=new THREE.Vector3(0,0,-240).applyEuler(points.rotation), up=new THREE.Vector3(0,1,0).applyEuler(points.rotation);
        const tgt=camera.position.distanceToSquared(f)<camera.position.distanceToSquared(bk)?f:bk;
        if(camera.position.distanceToSquared(tgt)<25) returnForce=Math.max(0,returnForce-dt*CFG.autoReturnForceDecay);
        const sp=returnForce*5; camera.position.lerp(tgt,dt*sp); camera.up.lerp(up,dt*sp).normalize(); camera.position.setLength(240); controls.target.lerp(origin,dt*sp);
      } else { returning=false; camera.up.lerp(new THREE.Vector3(0,1,0),dt*2).normalize(); }
    } else if(!dragging&&camera.up.y<.999) camera.up.lerp(new THREE.Vector3(0,1,0),dt*2).normalize();
    controls.update(); renderer.render(scene,camera);
  }
  new ResizeObserver(()=>{ [W,H]=size(); camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H); }).observe(sizeToWindow?document.body:host);
  raf=requestAnimationFrame(loop);
  return {pulse,points,renderer};
}

const heroHost=document.getElementById('hero-spark');
if(heroHost) spark(heroHost,{count:CFG.particleCount,radius:120,scrollEl:document.querySelector('.hero'),sizeToWindow:true});
const mini=document.getElementById('hero-mini');
if(mini){ const h=document.createElement('div'); h.style.cssText='position:absolute;inset:0'; mini.prepend(h); window.__sparkMini=spark(h,{count:24000,radius:110}); }
</script>
</body>
</html>
