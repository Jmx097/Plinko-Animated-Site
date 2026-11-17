import * as THREE from "three";
// The model is generated procedurally, not pre-rendered or video-based.
// WebGL runs on the viewer's GPU. No inference or server is required.
const randFactory = seed => () => {
  let t=seed+=0x6D2B79F5;
  t=Math.imul(t^t>>>15,t|1);
  t^=t+Math.imul(t^t>>>7,t|61);
  return ((t^t>>>14)>>>0)/4294967296;
};
const NODES=[
  [-1.75,1.02,0],[-.69,1.46,-.16],[.81,1.21,.03],[1.94,.62,-.09],
  [-1.95,-.35,.09],[-.71,-.22,.18],[.66,-.28,.12],[1.65,-.96,.05],[.05,-1.48,-.14]
];
const EDGES=[[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[5,8],[6,8],[1,6],[2,5]];
const VERTEX_SHADER=[
  "precision highp float;",
  "uniform float uTime,uMorph,uAssemble,uAudio,uPixelRatio,uGlow;",
  "attribute vec3 aTarget,aColor;",
  "attribute float aSeed,aSize,aIntensity;",
  "varying vec3 vColor;",
  "varying float vIntensity;",
  "void main(){",
  " float m=smoothstep(0.,1.,uMorph);",
  " vec3 p=mix(position,aTarget,m);",
  " float scatter=1.-smoothstep(0.,1.,uAssemble);",
  " p+=vec3(sin(aSeed*7.4),cos(aSeed*3.1),sin(aSeed*5.1))*scatter*(1.8+aSeed*.09);",
  " float wave=sin(uTime*2.15+aSeed*6.1+position.y*3.7)*.022;",
  " p+=normalize(position+vec3(.001))*(wave*(1.-m)+uAudio*.045);",
  " p.x+=sin(uTime*.6+p.y*3.+aSeed)*.012;",
  " p.y+=sin(uTime*.38+aSeed*4.)*.018;",
  " vec4 mv=modelViewMatrix*vec4(p,1.);",
  " gl_Position=projectionMatrix*mv;",
  " float flicker=.86+.14*sin(uTime*3.+aSeed*7.);",
  " vColor=aColor;",
  " vIntensity=max(.1,aIntensity)*flicker*(.76+uAudio*.5);",
  " gl_PointSize=min(13.,(aSize+uGlow*3.4)*uPixelRatio*mix(1.,1.25,m)*(.83+uAudio*.22));",
  "}"
].join("\n");
const FRAGMENT_SHADER=[
  "precision highp float;",
  "uniform float uGlow;",
  "varying vec3 vColor;",
  "varying float vIntensity;",
  "void main(){",
  " vec2 uv=gl_PointCoord-.5;",
  " float radius=length(uv);",
  " float disc=exp(-radius*radius*(uGlow>.5?10.:53.));",
  " float center=1.-smoothstep(.22,.48,radius);",
  " float alpha=disc*center*min(1.,vIntensity)*(uGlow>.5?.14:.72);",
  " gl_FragColor=vec4(vColor*(uGlow>.5?1.4:1.35),alpha);",
  " if(alpha<.01)discard;",
  "}"
].join("\n");

export function createHologram(container,{lowPower=false,onError=()=>{},onFPS=()=>{},onPulse=()=>{}}={}){
  let renderer,scene,camera,group,face,glow,geometry,faceMat,glowMat,dust,core;
  let mode="face",morph=0,morphTarget=0,pulse=0,speaking=false,listening=false;
  let last=0,time=0,fps=60;
  const pointer={x:0,y:0};
  const start=performance.now();
  let renderedFrames=0;
  let paused=false;
  const activeLines=[],activeNodes=[];
  const fallback=container.querySelector(".fallback-hologram");
  function cameraResize(){
    if(!renderer||!camera)return;
    const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
    camera.left=-3.15*width/height;camera.right=3.15*width/height;
    camera.top=3.15;camera.bottom=-3.15;camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
  }
  function generateGeometry(){
    const coords=[],targets=[],seeds=[],colors=[],sizes=[],intensities=[];
    const random=randFactory(20261117),rand=(a,b)=>a+(b-a)*random();
    const add=(x,y,z,type=0,bright=1)=>{
      const i=seeds.length;
      coords.push(x,y,z);
      seeds.push(random()*10);
      colors.push(type>.5?1:.07,type>.5?.42:.74,type>.5?.10:1);
      sizes.push(rand(1,2.5));intensities.push(bright);
      let nx,ny,nz;
      if(i%13<5){
        const edge=EDGES[(i*7)%EDGES.length],a=NODES[edge[0]],b=NODES[edge[1]],t=random();
        nx=a[0]+(b[0]-a[0])*t+rand(-.085,.085);
        ny=a[1]+(b[1]-a[1])*t+rand(-.085,.085);
        nz=a[2]+(b[2]-a[2])*t+rand(-.13,.13);
      }else{
        const n=NODES[(i*11+3)%NODES.length];
        nx=n[0]+rand(-.38,.38);ny=n[1]+rand(-.36,.36);nz=n[2]+rand(-.30,.30);
      }
      targets.push(nx,ny,nz);
    };
    const stride=lowPower?2:1;
    // 3D ellipsoidal head built from luminous latitude/longitude filaments.
    for(let v=0;v<=124;v+=stride){
      const latitude=-Math.PI/2+.008+(Math.PI-.016)*v/124;
      const ry=Math.sin(latitude),circle=Math.cos(latitude),y=.69+ry*1.39;
      const taper=y<.3?.81+Math.max(0,y+.7)*.19:1;
      const width=circle*.96*taper,depth=circle*.82;
      for(let a=0;a<160;a+=stride){
        const angle=2*Math.PI*a/160;
        const x=width*Math.cos(angle),z=depth*Math.sin(angle);
        const edge=Math.pow(Math.abs(Math.cos(angle)),7),front=Math.max(0,Math.sin(angle));
        add(x,y,z,.01,.22+edge*.8+front*.3+(v%7===0?.18:0));
      }
    }
    // A secondary scanning pattern reveals the contours on the front of the face.
    for(let j=0;j<72;j+=stride){
      const y=-.45+j/71*2.36,normalized=(y-.69)/1.39;
      const radius=Math.sqrt(Math.max(0,1-normalized*normalized));
      const taper=y<.3?.81+Math.max(0,y+.7)*.19:1;
      for(let i=0;i<115;i+=stride){
        const x=(i/114*2-1)*radius*.94*taper;
        const z=radius*.82*Math.sqrt(Math.max(0,1-(x/(radius*.96*taper+.0001))**2))+.014;
        add(x,y,z,.015,.39+rand(0,.34));
      }
    }
    // Warm orange energetic centre: separate particle family.
    for(let i=0;i<(lowPower?1450:3700);i++){
      const a=rand(0,Math.PI*2),r=Math.sqrt(random());
      add(Math.cos(a)*r*.39,.38+Math.sin(a)*r*.41,1.02+Math.cos(a*4+i*.015)*.018,.9,.54+1.0*(1-r));
    }
    // Eyes, brows and a lip contour create a recognizable holographic presence.
    for(const sign of [-1,1]){
      for(let band=0;band<8;band++){
        for(let j=0;j<83;j++){
          const u=j/82;
          const x=sign*(.12+u*.52);
          const y=.86+Math.sin(u*Math.PI)*(.055+band*.006)-band*.016;
          const z=.91+Math.sin(u*Math.PI)*.035;
          add(x,y,z,.01,.68+rand(0,.28));
        }
      }
      for(let j=0;j<150;j++){
        const u=j/149;
        add(sign*(.09+u*.085),.81-u*.63,.98+Math.sin(u*Math.PI)*.09,.01,.50);
      }
    }
    for(let band=0;band<12;band++){
      for(let j=0;j<80;j++){
        const u=j/79;
        const x=(u-.5)*.45;
        const y=.04+Math.sin(u*Math.PI)*(.04+band*.003)-band*.011;
        add(x,y,1.04,.85,.75+rand(0,.35));
      }
    }
    // Branching amber and blue neural filaments connect head to shoulders.
    for(let k=0;k<58;k+=stride){
      const t=k/57;
      for(let j=0;j<72;j+=stride){
        const u=j/71,sign=j%2?1:-1;
        const x=sign*(.05+.42*u)*(1-.34*t)+Math.sin(t*8+u*6)*.025;
        const y=-1.28+t*.81,z=.24+Math.sin(u*Math.PI)*.12;
        add(x,y,z,u<.7?.83:.05,.35+rand(0,.37));
      }
    }
    // Curved shoulder and chest scanlines create the holographic bust silhouette.
    for(let line=0;line<85;line+=stride){
      const depth=line/84;
      for(const side of [-1,1]){
        for(let j=0;j<84;j+=stride){
          const u=j/83,x=side*(.14+2.15*u);
          const shoulder=-.92-.17*u-.60*Math.pow(u,2.45);
          const y=shoulder-.58*depth+.06*Math.sin(u*Math.PI)*Math.cos(depth*9);
          const z=.24+(.32-.5*depth)*Math.sin(u*3.1)+.12*Math.cos(u*8);
          add(x,y,z,depth<.14&&u<.5?.7:.02,.27+(line%8===0?.35:0)+.24*(1-depth));
        }
      }
    }
    // Sparse orbiting micro-particles make the face feel airborne.
    for(let i=0;i<(lowPower?550:1600);i++){
      const x=rand(-2.5,2.5),y=rand(-1.9,2.5),z=rand(-1,.8);
      if(x*x/3.5+((y-.25)*(y-.25)/4)<1.9)add(x,y,z,.03,rand(.08,.42));
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(coords,3));
    g.setAttribute("aTarget",new THREE.Float32BufferAttribute(targets,3));
    g.setAttribute("aSeed",new THREE.Float32BufferAttribute(seeds,1));
    g.setAttribute("aColor",new THREE.Float32BufferAttribute(colors,3));
    g.setAttribute("aSize",new THREE.Float32BufferAttribute(sizes,1));
    g.setAttribute("aIntensity",new THREE.Float32BufferAttribute(intensities,1));
    g.computeBoundingSphere();
    return g;
  }
  function newMaterial(isGlow){
    return new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      uniforms:{
        uTime:{value:0},uMorph:{value:0},uAssemble:{value:0},
        uAudio:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio||1,lowPower?1:1.7)},
        uGlow:{value:isGlow?1:0}
      },
      vertexShader:VERTEX_SHADER,fragmentShader:FRAGMENT_SHADER
    });
  }
  function rebuild(){
    if(!group)return;
    if(face){
      group.remove(face,glow);
      geometry.dispose();faceMat.dispose();glowMat.dispose();
    }
    geometry=generateGeometry();
    faceMat=newMaterial(false);glowMat=newMaterial(true);
    glow=new THREE.Points(geometry,glowMat);face=new THREE.Points(geometry,faceMat);
    glow.frustumCulled=false;face.frustumCulled=false;
    group.add(glow,face);
  }
  function createNetwork(){
    for(const [a,b] of EDGES){
      const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...NODES[a]),new THREE.Vector3(...NODES[b])]);
      const mat=new THREE.LineBasicMaterial({color:0x34bbff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
      const line=new THREE.Line(geo,mat);group.add(line);activeLines.push(line);
    }
    for(let i=0;i<NODES.length;i++){
      const p=NODES[i];
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(i===5?.11:.07,12,10),
        new THREE.MeshBasicMaterial({color:i===5?0xffaa4a:0x20cbff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
      mesh.position.set(...p);group.add(mesh);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.14,.153,40),
        new THREE.MeshBasicMaterial({color:i===5?0xffaa4a:0x35baff,transparent:true,opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
      ring.position.set(...p);group.add(ring);activeNodes.push({mesh,ring});
    }
  }
  function createCoreGlow(){
    const canvas=document.createElement("canvas");
    canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext("2d");
    const radial=ctx.createRadialGradient(128,128,4,128,128,127);
    radial.addColorStop(0,"rgba(255,240,175,1)");
    radial.addColorStop(.18,"rgba(255,197,92,1)");
    radial.addColorStop(.42,"rgba(255,115,25,.70)");
    radial.addColorStop(.74,"rgba(255,100,14,.16)");
    radial.addColorStop(1,"rgba(255,100,14,0)");
    ctx.fillStyle=radial;ctx.fillRect(0,0,256,256);
    const material=new THREE.SpriteMaterial({
      map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,
      blending:THREE.AdditiveBlending,opacity:.75
    });
    core=new THREE.Sprite(material);
    core.position.set(0,.37,1.06);core.scale.set(1.00,1.12,1);
    group.add(core);
  }
  function createDust(){
    const random=randFactory(87006),rand=(a,b)=>a+(b-a)*random();
    const pos=[],col=[];
    for(let i=0;i<(lowPower?150:450);i++){
      pos.push(rand(-4.3,4.3),rand(-2.7,2.7),rand(-3,-1));
      col.push(.03,rand(.25,.65),rand(.6,1));
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
    dust=new THREE.Points(geo,new THREE.PointsMaterial({size:.012,vertexColors:true,opacity:.38,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    scene.add(dust);
  }
  function frame(now){
    if(paused)return;
    requestAnimationFrame(frame);
    const dt=last?Math.min((now-last)/1000,.05):.016;
    last=now;time+=dt;renderedFrames++;
    fps=fps*.9+(dt?1/dt:60)*.1;
    if(renderedFrames%60===0){
      onFPS(Math.round(fps));
      onPulse((.68+.20*Math.abs(Math.sin(time*.5))).toFixed(2));
    }
    morph+=(morphTarget-morph)*Math.min(1,dt*2.4);
    pulse=Math.max(0,pulse-dt*.7);
    const assemble=Math.min(1,Math.max(0,(performance.now()-start-350)/2300));
    const audio=speaking?(.32+.28*Math.abs(Math.sin(time*8.3))):listening?.36:pulse*.28;
    group.rotation.y+=(pointer.x*.13-group.rotation.y)*Math.min(1,dt*2);
    group.rotation.x+=(-pointer.y*.075-group.rotation.x)*Math.min(1,dt*2);
    group.position.y=Math.sin(time*.55)*.035;
    for(const mat of [faceMat,glowMat]){
      if(!mat)continue;
      mat.uniforms.uTime.value=time;
      mat.uniforms.uMorph.value=morph;
      mat.uniforms.uAssemble.value=assemble;
      mat.uniforms.uAudio.value=audio;
    }
    if(core){core.material.opacity=(1-morph)*(.69+.12*Math.sin(time*3.2));core.scale.setScalar(1+.055*Math.sin(time*2.1));}
    for(const line of activeLines)line.material.opacity=morph*.34;
    for(let i=0;i<activeNodes.length;i++){
      const {mesh,ring}=activeNodes[i];
      mesh.material.opacity=morph*.85;ring.material.opacity=morph*.53;
      ring.scale.setScalar(1+.08*Math.sin(time*2+i));
    }
    if(dust){dust.rotation.y+=dt*.003;dust.material.opacity=.30+.07*Math.sin(time*.4);}
    renderer.render(scene,camera);
  }
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:!lowPower,powerPreference:"high-performance"});
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,lowPower?1:1.7));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    scene=new THREE.Scene();
    camera=new THREE.OrthographicCamera(-3.15,3.15,3.15,-3.15,.1,100);
    camera.position.set(0,0,12);camera.lookAt(0,0,0);
    group=new THREE.Group();scene.add(group);
    rebuild();createNetwork();createCoreGlow();createDust();cameraResize();
    if(fallback)fallback.style.display="none";
    requestAnimationFrame(frame);
    if("ResizeObserver" in window)new ResizeObserver(cameraResize).observe(container);
    window.addEventListener("resize",cameraResize,{passive:true});
    window.addEventListener("pointermove",e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.hidden){last=0;}});
  }catch(err){
    console.warn("JARVIS graphics fallback:",err);
    if(renderer?.domElement?.parentNode)renderer.domElement.remove();
    document.getElementById("fpsValue").textContent="CSS MODE";
    onError(err);
  }
  return {
    setMode(next){mode=next;morphTarget=next==="face"?0:1;pulse=1;},
    setSpeaking(value){speaking=Boolean(value);},
    setListening(value){listening=Boolean(value);},
    setLowPower(value){
      lowPower=Boolean(value);
      if(!renderer)return;
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowPower?1:1.7));
      cameraResize();rebuild();
    }
  };
}