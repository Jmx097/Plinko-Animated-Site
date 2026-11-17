import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const html=read("index.html"),main=read("src/main.js"),render=read("src/render.js"),css=read("styles.css");
for(const p of ["index.html","styles.css","src/main.js","src/render.js","README.md"]){
  assert.ok(existsSync(new URL(p,root)),"Missing "+p);
}
for(const id of ["hologram","fallback","micButton","commandInput","commandForm","showcaseButton","soundButton","qualityButton","transcriptLines","presenceLabel","resultData"]){
  assert.ok(html.includes('id="'+id+'"'),"Missing HTML element: "+id);
}
assert.ok(html.includes('./styles.css'),"Missing CSS reference");
assert.ok(html.includes('./src/main.js'),"Missing script reference");
assert.ok(html.includes('"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/'),"Missing Three.js import map");
assert.ok(main.includes('from "./render.js"'),"Missing renderer module import");
assert.ok(render.includes("export function createHologram"),"Missing renderer export");
assert.ok(render.includes("new THREE.Points"),"Not a particle renderer");
assert.ok(render.includes("setMode(next)"),"Missing scene transformation");
for(const state of ["introduce","pipeline","automation"]){
  assert.ok(main.includes(state+": {"),"Missing scenario: "+state);
}
assert.ok(css.includes("@media(max-width:650px)"),"Missing mobile styles");
assert.ok(main.includes("SpeechRecognition")&&main.includes("SpeechSynthesisUtterance"),"Missing voice features");
assert.ok(!/api[_-]?key\s*[:=]\s*["'][^\s"']+/i.test(main+render),"Potential hardcoded API key");
console.log("JARVIS static smoke checks passed.");
