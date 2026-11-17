import { createHologram } from "./render.js";
// PLINKO JARVIS — fully client-side cinematic demonstration.
// Scripted responses and sample figures; no LLM API or real client systems.
const $ = (id) => document.getElementById(id);
const micButton = $("micButton");
const soundButton = $("soundButton");
const qualityButton = $("qualityButton");
const transcript = $("transcriptLines");
const input = $("commandInput");
let soundEnabled = "speechSynthesis" in window;
let activeSpeech = false;
let speechGeneration = 0;
let isListening = false;
let showToken = 0;
let recognition = null;
let conversationActive = false;
let resumeTimer = null;
let notificationTimer;
let stage = "face";
let viz = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lowPower = prefersReducedMotion || /iPhone|iPod|Android/i.test(navigator.userAgent);

const SCENARIOS = {
  introduce: {
    heading: "AI that takes action.",
    tag: "PLINKO CAPABILITIES",
    description: "A living command interface for the automations, intelligence, and workflows behind your business.",
    metrics: [["3D","LIVE VISUALS"],["0","API KEYS"],["∞","IDEAS"]],
    subtitle: "JUST A RATHER VERY INTELLIGENT SYSTEM",
    name: "J . A . R . V . I . S",
    status: "CONNECTED",
    answer: "Good evening. I am Jarvis, a visual demonstration of Plinko Solutions intelligence. I can transform ideas into interactive workflows, show connected information, and give your clients a glimpse of what automation could feel like."
  },
  pipeline: {
    heading: "Your pipeline, illuminated.",
    tag: "ILLUSTRATIVE PIPELINE",
    description: "A sample lead pipeline visualized as connected opportunities. This is demonstration data, not a live CRM.",
    metrics: [["48","SAMPLE LEADS"],["12","QUALIFIED"],["04","MEETINGS"]],
    subtitle: "VISUALIZING CONNECTED OPPORTUNITIES",
    name: "P I P E L I N E",
    status: "VISUALIZING",
    answer: "Here is an illustrative sales pipeline. Forty eight incoming leads, twelve qualified opportunities, and four booked meetings. The hologram has transformed into a rendered network. In production, this view could connect to your CRM and automation tools."
  },
  automation: {
    heading: "Automate the ordinary.",
    tag: "AGENT WORKFLOW SIMULATION",
    description: "A sample journey from lead intake to qualification, personalized response, booking, and reporting.",
    metrics: [["05","WORKFLOW STEPS"],["24/7","POTENTIAL"],["0","LIVE ACTIONS"]],
    subtitle: "SIMULATING AGENT ORCHESTRATION",
    name: "A G E N T   F L O W",
    status: "SIMULATING",
    answer: "Imagine a lead arriving through your website. An agent classifies the request, prepares a personalized response, recommends a meeting, and updates a dashboard. This demo is a simulation, so nothing is sent and no customer data is touched."
  }
};
function notify(text) {
  const el=$("notification");
  el.textContent=text;el.classList.add("is-visible");
  clearTimeout(notificationTimer);
  notificationTimer=setTimeout(()=>el.classList.remove("is-visible"),4300);
}
function addTranscript(who,text){
  const item=document.createElement("div");
  item.className="transcript-line"+(who==="YOU"?" user-line":"");
  const name=document.createElement("span"),body=document.createElement("p");
  name.textContent=who;body.textContent=text;item.append(name,body);transcript.appendChild(item);
  while(transcript.children.length>8)transcript.removeChild(transcript.firstElementChild);
  transcript.scrollTop=transcript.scrollHeight;
  $("transcriptTime").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}
function setStatus(text){$("presenceLabel").textContent=text;$("voiceReadout").textContent=text;}
function updateContent(which){
  const b=SCENARIOS[which];
  $("resultTag").textContent=b.tag;$("resultHeading").textContent=b.heading;
  $("resultBody").textContent=b.description;
  $("stageSubtitle").textContent=b.subtitle;$("hologramName").textContent=b.name;
  $("resultData").replaceChildren(...b.metrics.map(([value,label])=>{
    const div=document.createElement("div"),strong=document.createElement("strong"),span=document.createElement("span");
    strong.textContent=value;span.textContent=label;div.append(strong,span);return div;
  }));
  const panel=$("dataCard");panel.classList.remove("is-flashing");void panel.offsetWidth;panel.classList.add("is-flashing");
  document.querySelectorAll(".scenario").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.command===which));
}
function detectIntent(text){
  const message=String(text).toLowerCase();
  if(/lead|sales|pipeline|prospect|crm|opportunit|conversion|revenue|funnel|graph|network|map/.test(message))return "pipeline";
  if(/automat|workflow|agent|task|business|follow.up|book|email|client|process/.test(message))return "automation";
  return "introduce";
}
function cancelSpeech(){
  if("speechSynthesis" in window){try{speechSynthesis.cancel();}catch{}}
  activeSpeech=false;
  speechGeneration++;
  viz?.setSpeaking(false);
}
function preferredVoice(){
  if(!("speechSynthesis" in window))return null;
  const voices=speechSynthesis.getVoices();
  return voices.find(v=>/^en/.test(v.lang)&&/Daniel|Aaron|Microsoft|Google|Samantha/i.test(v.name))
    ||voices.find(v=>/^en/.test(v.lang))||null;
}
function scheduleListen(){
  clearTimeout(resumeTimer);
  if(conversationActive)resumeTimer=setTimeout(()=>{if(conversationActive&&!isListening&&!activeSpeech)startRecognition();},650);
}
function speak(text){
  if(!soundEnabled||!("speechSynthesis" in window)){scheduleListen();return Promise.resolve();}
  return new Promise(resolve=>{
    let done=false;
    const generation=++speechGeneration;
    const finish=()=>{if(!done){done=true;if(generation===speechGeneration){activeSpeech=false;viz?.setSpeaking(false);if(!isListening)setStatus(stage==="face"?"CONNECTED":"VISUALIZING");scheduleListen();}resolve();}};
    try{
      speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang="en-US";utterance.rate=.96;utterance.pitch=.79;utterance.volume=1;
      const voice=preferredVoice();if(voice)utterance.voice=voice;
      utterance.onend=finish;utterance.onerror=finish;
      activeSpeech=true;viz?.setSpeaking(true);setStatus("SPEAKING");speechSynthesis.speak(utterance);
      setTimeout(finish,Math.min(32000,Math.max(8000,text.length*105)));
    }catch{finish();}
  });
}
function runScenario(which,{fromShowcase=false,spokenQuestion=""}={}){
  if(!fromShowcase){showToken++;restoreShowcaseButton();}
  cancelSpeech();stage=which==="introduce"?"face":"network";
  viz?.setMode(which==="introduce"?"face":"network");
  updateContent(which);setStatus(SCENARIOS[which].status);
  if(spokenQuestion)addTranscript("YOU",spokenQuestion);
  addTranscript("JARVIS",SCENARIOS[which].answer);
  return speak(SCENARIOS[which].answer);
}
function runTextCommand(text){
  const q=text.trim();if(!q)return;
  const which=detectIntent(q);
  if(which==="introduce"&&!/jarvis|hello|introduc|who are|start|wake|hi\b/i.test(q))notify("Offline demonstration: showing a sample response, not a general-purpose AI.");
  runScenario(which,{spokenQuestion:q});
}
function restoreShowcaseButton(){
  $("showcaseButton").disabled=false;
  $("showcaseButton").innerHTML='<span class="play-icon">▶</span> RUN SHOWCASE <span class="showcase-duration">~45 SEC</span>';
}
async function showcase(){
  const token=++showToken;
  $("showcaseButton").disabled=true;
  $("showcaseButton").innerHTML='<span class="play-icon">◉</span> SHOWCASE RUNNING <span class="showcase-duration">LIVE</span>';
  try{
    for(const id of ["introduce","pipeline","automation"]){
      if(token!==showToken)break;
      await runScenario(id,{fromShowcase:true});
      await new Promise(resolve=>setTimeout(resolve,900));
    }
  }finally{if(token===showToken)restoreShowcaseButton();}
}
function reset(){
  showToken++;conversationActive=false;clearTimeout(resumeTimer);cancelSpeech();
  try{recognition?.abort();}catch{}
  isListening=false;viz?.setListening(false);micButton.classList.remove("is-listening");micButton.setAttribute("aria-pressed","false");
  restoreShowcaseButton();stage="face";viz?.setMode("face");updateContent("introduce");setStatus("STANDBY");
}
function setLowPower(on){
  lowPower=on;qualityButton.textContent="LOW POWER: "+(on?"ON":"OFF");
  qualityButton.setAttribute("aria-pressed",String(on));viz?.setLowPower(on);
}
function setSound(on){
  soundEnabled=on&&("speechSynthesis" in window);if(!soundEnabled)cancelSpeech();
  soundButton.classList.toggle("is-active",soundEnabled);
  soundButton.setAttribute("aria-pressed",String(soundEnabled));
  soundButton.querySelector("span").textContent=soundEnabled?"SOUND ON":"SOUND OFF";
  if(on&&!soundEnabled)notify("Spoken output is unavailable in this browser.");
}
function listen(){
  if(conversationActive){
    conversationActive=false;clearTimeout(resumeTimer);
    try{recognition?.abort();}catch{}
    cancelSpeech();isListening=false;viz?.setListening(false);
    micButton.classList.remove("is-listening");micButton.setAttribute("aria-pressed","false");
    $("modeHint").textContent="TAP MICROPHONE OR TYPE A COMMAND";setStatus("STANDBY");return;
  }
  conversationActive=true;
  $("modeHint").textContent="HANDS-FREE SCRIPTED DEMO · TAP MIC TO END";
  showToken++;cancelSpeech();restoreShowcaseButton();startRecognition();
}
function startRecognition(){
  if(!conversationActive||isListening||activeSpeech)return;
  const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Rec){conversationActive=false;notify("This browser has no speech-recognition API. Type a command or try desktop Chrome.");$("voiceLink").textContent="TEXT INPUT";input.focus();return;}
  try{
    recognition=new Rec();recognition.lang="en-US";recognition.interimResults=false;recognition.continuous=false;recognition.maxAlternatives=1;
    recognition.onstart=()=>{isListening=true;viz?.setListening(true);micButton.classList.add("is-listening");micButton.setAttribute("aria-pressed","true");setStatus("LISTENING");};
    recognition.onresult=e=>{const words=e.results?.[0]?.[0]?.transcript||"";if(/^(jarvis )?(stop listening|end conversation|go to sleep)/i.test(words.trim())){listen();return;}if(words.trim())runTextCommand(words);};
    recognition.onerror=e=>{
      if(["not-allowed","service-not-allowed","network"].includes(e.error))conversationActive=false;
      if(e.error==="not-allowed"||e.error==="service-not-allowed")notify("Microphone permission denied. You can type a command.");
      else if(e.error==="network")notify("This browser's speech recognition needs a network connection. Typed commands still work.");
      else if(e.error!=="no-speech"&&e.error!=="aborted")notify("Speech recognition: "+e.error);
    };
    recognition.onend=()=>{isListening=false;viz?.setListening(false);micButton.classList.remove("is-listening");micButton.setAttribute("aria-pressed","false");if(!activeSpeech){setStatus(stage==="face"?"STANDBY":"VISUALIZING");scheduleListen();}};
    recognition.start();
  }catch(e){conversationActive=false;notify("Unable to start voice recognition: "+e.message);}
}
document.querySelectorAll("[data-command]").forEach(button=>button.addEventListener("click",()=>runScenario(button.dataset.command)));
$("showcaseButton").addEventListener("click",showcase);
$("commandForm").addEventListener("submit",e=>{e.preventDefault();const q=input.value;input.value="";runTextCommand(q);});
micButton.addEventListener("click",listen);
qualityButton.addEventListener("click",()=>setLowPower(!lowPower));
soundButton.addEventListener("click",()=>setSound(!soundEnabled));
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){reset();return;}
  if(e.code==="Space"&&!e.repeat&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();listen();}
});
setLowPower(lowPower);setSound(soundEnabled);
$("voiceLink").textContent=(window.SpeechRecognition||window.webkitSpeechRecognition)?"BROWSER READY":"TEXT / TTS";
setStatus("STANDBY");
viz=createHologram($("hologram"),{lowPower,onError:()=>notify("WebGL unavailable. Showing a lightweight CSS hologram instead."),onFPS:value=>$("fpsValue").textContent=value+" FPS",onPulse:value=>$("neuralReadout").textContent=value});
if(window.isSecureContext===false)notify("Microphone input requires HTTPS or localhost. Visuals and typing still work.");
document.addEventListener("visibilitychange",()=>{if(document.hidden&&conversationActive)listen();});
