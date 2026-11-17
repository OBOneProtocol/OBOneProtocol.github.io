(function(){
"use strict";
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var root=document.documentElement;
function $(s){return document.querySelector(s)}
var y=$("#year");if(y)y.textContent=new Date().getFullYear();
/* theme toggle; the contribution graph follows the page theme */
var GRAPH="https://raw.githubusercontent.com/OBOneProtocol/OBOneProtocol/output/github-contribution-grid-snake";
function syncGraph(){var g=$("#graph");if(g)g.src=GRAPH+(root.getAttribute("data-theme")==="light"?"":"-dark")+".svg"}
syncGraph();
var tb=$("#theme");
if(tb)tb.addEventListener("click",function(){
  var n=root.getAttribute("data-theme")==="light"?"dark":"light";
  root.setAttribute("data-theme",n);
  try{localStorage.setItem("theme",n)}catch(e){}
  syncGraph();
});
/* profile photo fallback */
var img=$("#profile-img"),fb=$("#profile-fallback");
if(img&&fb){
  var show=function(){img.hidden=true;fb.hidden=false};
  if(img.complete&&img.naturalWidth===0)show();else img.addEventListener("error",show,{once:true});
}
/* typed tagline */
var tag=$("#tagline");
var lines=[
["$ reproduce --issue","# failing test before the fix"],
["$ docker build .","# the build decides, not the model"],
["$ request-approval","# human in the lead"],
["$ fix --examined 3","# then escalate with evidence"],
["$ git log upstream","# merged, with tests"]];
function render(cmd,com,caret){
  tag.textContent="";
  var p=document.createElement("span");p.className="p";p.textContent=cmd;tag.appendChild(p);
  if(com!==null){tag.appendChild(document.createTextNode("    "));var c=document.createElement("span");c.className="c";c.textContent=com;tag.appendChild(c)}
  if(caret){var k=document.createElement("span");k.className="caret";tag.appendChild(k)}
}
if(tag&&!reduce){
  var i=0;
  (function run(){
    var l=lines[i%lines.length],a=l[0],b=l[1],n=0,m=-1;
    function step(){
      if(n<=a.length){render(a.slice(0,n),null,true);n++;setTimeout(step,55)}
      else if(m<=b.length){render(a,b.slice(0,Math.max(m,0)),true);m++;setTimeout(step,m>0?28:350)}
      else{render(a,b,true);i++;setTimeout(run,2200)}
    }
    step();
  })();
}
/* scroll reveal */
var rv=document.querySelectorAll(".rv");
if(!("IntersectionObserver" in window)||reduce){rv.forEach(function(e){e.classList.add("in")})}
else{
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
  rv.forEach(function(e){io.observe(e)});
}
/* count up */
function countUp(el,to){
  if(reduce||to===0){el.textContent=to;return}
  var t0=null,d=1100;
  function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/d,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f);
}
/* live stats */
var base="https://api.github.com/search/issues?per_page=100&q=";
var q="author:OBOneProtocol+type:pr+-user:OBOneProtocol+";
function get(u){return fetch(u,{headers:{Accept:"application/vnd.github+json"}}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
function load(){
  try{var c=JSON.parse(sessionStorage.getItem("ghstats")||"null");if(c&&Date.now()-c.t<36e5&&c.d)return Promise.resolve(c.d)}catch(e){}
  return Promise.all([get(base+q+"is:merged"),get(base+q+"is:open")]).then(function(r){
    var repos={};r[0].items.forEach(function(it){repos[it.repository_url]=1});
    var d={merged:r[0].total_count,repos:Object.keys(repos).length,open:r[1].total_count};
    if(typeof d.merged!=="number"||typeof d.open!=="number")throw new Error("bad");
    try{sessionStorage.setItem("ghstats",JSON.stringify({t:Date.now(),d:d}))}catch(e){}
    return d;
  });
}
var box=$("#stats"),fbk=$("#stats-fallback");
if(box){
  load().then(function(d){
    box.hidden=false;
    var go=function(){box.querySelectorAll(".n").forEach(function(n){countUp(n,d[n.getAttribute("data-key")])})};
    if("IntersectionObserver" in window&&!reduce){
      var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){go();o.disconnect()}},{threshold:.3});o.observe(box);
    }else go();
  }).catch(function(){box.hidden=true;fbk.hidden=false;var cap=$(".cap");if(cap)cap.hidden=true});
}
})();
