import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const target="http://127.0.0.1:8080/";
const artifactDir=new URL("./artifacts/",import.meta.url);
mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({
  headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--no-sandbox"]
});
try{
  const desktop=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors=[];
  desktop.on("pageerror",err=>errors.push(err.message));
  await desktop.goto(target,{waitUntil:"domcontentloaded",timeout:30000});
  await desktop.locator("#hologram canvas").waitFor({state:"visible",timeout:25000});
  await desktop.waitForTimeout(3100);
  assert.match(await desktop.title(),/JARVIS/);
  assert.equal(await desktop.locator("#presenceLabel").textContent(),"STANDBY");
  await desktop.screenshot({path:new URL("./artifacts/desktop.png",import.meta.url).pathname,fullPage:true});
  await desktop.locator('[data-command="pipeline"]').click();
  assert.match(await desktop.locator("#resultTag").textContent(),/ILLUSTRATIVE PIPELINE/);
  await desktop.waitForTimeout(1300);
  await desktop.screenshot({path:new URL("./artifacts/pipeline.png",import.meta.url).pathname,fullPage:true});
  await desktop.locator("#commandInput").fill("show agent automation");
  await desktop.locator("#commandInput").press("Enter");
  assert.match(await desktop.locator("#resultTag").textContent(),/AGENT WORKFLOW SIMULATION/);
  if(errors.length)console.warn("Non-fatal browser console errors:",errors);
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await mobile.goto(target,{waitUntil:"domcontentloaded",timeout:30000});
  await mobile.locator("#hologram canvas").waitFor({state:"visible",timeout:25000});
  await mobile.waitForTimeout(1500);
  await mobile.screenshot({path:new URL("./artifacts/mobile.png",import.meta.url).pathname,fullPage:true});
  console.log("Browser smoke checks passed. Screenshots saved (desktop, pipeline, mobile).");
}finally{
  await browser.close();
}