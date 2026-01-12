/* =========================================================
   Flipbook quiz + Google Books result.
   FIXED VERSION (FULL FILE)

   What this fixes fast:
   - Quiz was rendering "way below" because Home stayed active / layout stacked.
   - Removes conflicting auto-start + stray home calls.
   - Start works from Home (cover/start button) -> Quiz.
   - PageFlip loads ONLY pages inside #flipbook.
   - Keeps your existing scoring + result logic intact.
========================================================= */

const QUESTIONS = [
  {
    id: "q1",
    text: "How would you like this book to make you feel?",
    options: [
      "Calm, reflective, and unhurried",
      "Slightly tense, but engaged",
      "Comforted and gently held",
      "Alert, curious, and awake"
    ]
  },
  {
    id: "q2",
    text: "How much mental energy do you have for reading right now?",
    options: [
      "Very little — a few pages at a time",
      "Some — a chapter here and there",
      "A fair amount — I can properly focus",
      "Plenty — I want something immersive"
    ]
  },
  {
    id: "q3",
    text: "What kind of world are you drawn to at the moment?",
    options: [
      "Grounded in everyday reality",
      "Slightly off-kilter, but recognisable",
      "Entirely otherworldly",
      "Historical or far removed from the present"
    ]
  },
  {
    id: "q4",
    text: "What matters most to you in a book right now?",
    options: [
      "Language, mood, and atmosphere",
      "Narrative drive and tension",
      "Characters and their inner lives",
      "Ideas that linger after reading"
    ]
  },
  {
    id: "q5",
    text: "How would you like the book to conclude?",
    options: [
      "Quietly, leaving space for reflection",
      "Clearly and with a sense of hope",
      "Unexpectedly or with honest weight",
      "The ending matters less than the journey"
    ]
  }
];


// 30 picks (simple trait tags for scoring)
const SHORTLIST = [
  { id:"stoner", q:"intitle:Stoner inauthor:John Williams", t:{calm:3,real:2,characters:2} },
  { id:"gilead", q:"intitle:Gilead inauthor:Marilynne Robinson", t:{calm:3,real:2,ideas:1,language:2} },
  { id:"remains", q:"intitle:The Remains of the Day inauthor:Kazuo Ishiguro", t:{calm:2,real:2,characters:2,honest:1} },
  { id:"norwegianwood", q:"intitle:Norwegian Wood inauthor:Haruki Murakami", t:{calm:2,real:1,surreal:1,characters:2} },
  { id:"outline", q:"intitle:Outline inauthor:Rachel Cusk", t:{calm:2,real:2,ideas:1,language:2,open:1} },

  { id:"dragon", q:"intitle:The Girl with the Dragon Tattoo inauthor:Stieg Larsson", t:{tense:3,plot:3,energy:2} },
  { id:"gonegirl", q:"intitle:Gone Girl inauthor:Gillian Flynn", t:{tense:3,plot:3,honest:1,energy:2} },
  { id:"darkmatter", q:"intitle:Dark Matter inauthor:Blake Crouch", t:{tense:3,plot:3,curious:2,surreal:1} },
  { id:"theroad", q:"intitle:The Road inauthor:Cormac McCarthy", t:{tense:2,ideas:1,language:1,honest:2} },
  { id:"neverletmego", q:"intitle:Never Let Me Go inauthor:Kazuo Ishiguro", t:{tense:2,characters:2,ideas:2,honest:1} },

  { id:"ove", q:"intitle:A Man Called Ove inauthor:Fredrik Backman", t:{comfort:3,characters:3,hope:2} },
  { id:"eleanor", q:"intitle:Eleanor Oliphant Is Completely Fine inauthor:Gail Honeyman", t:{comfort:3,characters:3,hope:1,real:2} },
  { id:"anne", q:"intitle:Anne of Green Gables inauthor:Lucy Maud Montgomery", t:{comfort:3,characters:3,hope:2} },
  { id:"littlewomen", q:"intitle:Little Women inauthor:Louisa May Alcott", t:{comfort:2,characters:3,history:2,hope:2} },
  { id:"bookthief", q:"intitle:The Book Thief inauthor:Markus Zusak", t:{comfort:2,characters:3,history:2,honest:1} },

  { id:"piranesi", q:"intitle:Piranesi inauthor:Susanna Clarke", t:{surreal:3,curious:3,calm:1} },
  { id:"kafkaonshore", q:"intitle:Kafka on the Shore inauthor:Haruki Murakami", t:{surreal:3,curious:3,language:1,open:1} },
  { id:"mastermarg", q:"intitle:The Master and Margarita inauthor:Mikhail Bulgakov", t:{surreal:3,ideas:2,plot:1,language:1} },
  { id:"annihilation", q:"intitle:Annihilation inauthor:Jeff VanderMeer", t:{surreal:3,tense:2,curious:2,plot:2} },
  { id:"metamorphosis", q:"intitle:The Metamorphosis inauthor:Franz Kafka", t:{surreal:2,ideas:3,honest:2,low:1} },

  { id:"sapiens", q:"intitle:Sapiens inauthor:Yuval Noah Harari", t:{ideas:4,curious:2,energy:2} },
  { id:"meditations", q:"intitle:Meditations inauthor:Marcus Aurelius", t:{ideas:3,calm:2,low:2} },
  { id:"stranger", q:"intitle:The Stranger inauthor:Albert Camus", t:{ideas:3,honest:3,low:1} },
  { id:"sisyphus", q:"intitle:The Myth of Sisyphus inauthor:Albert Camus", t:{ideas:4,honest:2,low:1} },
  { id:"frankl", q:"intitle:Man's Search for Meaning inauthor:Viktor Frankl", t:{ideas:3,comfort:2,hope:1} },

  { id:"hobbit", q:"intitle:The Hobbit inauthor:J.R.R. Tolkien", t:{fantasy:4,plot:2} },
  { id:"namewind", q:"intitle:The Name of the Wind inauthor:Patrick Rothfuss", t:{fantasy:4,plot:2,energy:1} },
  { id:"nightcircus", q:"intitle:The Night Circus inauthor:Erin Morgenstern", t:{fantasy:3,language:2,calm:1,surreal:1} },
  { id:"circe", q:"intitle:Circe inauthor:Madeline Miller", t:{fantasy:3,history:1,characters:2,language:1} },
  { id:"alllight", q:"intitle:All the Light We Cannot See inauthor:Anthony Doerr", t:{history:3,characters:2,language:2,hope:1} },
];

const els = {
  // Screens
  screenHome: document.getElementById("screenHome"),
  screenQuiz: document.getElementById("screenQuiz"),
  screenResult: document.getElementById("screenResult"),

  // Home start buttons (if present)
  startBtn: document.getElementById("startBtn"),
  startInlineBtn: document.getElementById("startInlineBtn"),

  // Topbar
  topbarMeta: document.getElementById("topbarMeta"),

  // Quiz controls
  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),
  progressText: document.getElementById("progressText"),

  // Result elements
  coverImg: document.getElementById("coverImg"),
  resTitle: document.getElementById("resTitle"),
  resMeta: document.getElementById("resMeta"),
  resPages: document.getElementById("resPages"),
  resTime: document.getElementById("resTime"),
  resDesc: document.getElementById("resDesc"),
  toggleDescBtn: document.getElementById("toggleDescBtn"),
  infoLink: document.getElementById("infoLink"),
  againBtn: document.getElementById("againBtn"),
  anotherBtn: document.getElementById("anotherBtn"),
  fallbackNote: document.getElementById("fallbackNote"),

  // Flipbook root
  flipbook: document.getElementById("flipbook")
};

const state = {
  screen: "home",
  step: 0,
  answers: {},
  isFlipping: false,
  activeOptionIndex: 0,
  lastChosenId: null
};

let pageFlip = null;

function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

function showScreen(name){
  [els.screenHome, els.screenQuiz, els.screenResult].forEach(s => s?.classList.remove("screen--active"));
  if (name === "home") els.screenHome?.classList.add("screen--active");
  if (name === "quiz") els.screenQuiz?.classList.add("screen--active");
  if (name === "result") els.screenResult?.classList.add("screen--active");
  state.screen = name;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function updateTopbar(){
  if (!els.topbarMeta) return;
  if (state.screen === "quiz") els.topbarMeta.textContent = `Question ${state.step+1} of ${QUESTIONS.length}`;
  else if (state.screen === "result") els.topbarMeta.textContent = "Result";
  else els.topbarMeta.textContent = "";
}

function showOnlyQuiz(){
  showScreen("quiz");
  updateTopbar();
}

function showResult(){
  showScreen("result");
  updateTopbar();
}

function initFlip(){
  if (pageFlip || !els.flipbook) return;

  const reduced = prefersReducedMotion();
  pageFlip = new St.PageFlip(els.flipbook, {
    width: 460,
    height: 590,
    size: "stretch",
    minWidth: 320,
    maxWidth: 980,
    minHeight: 430,
    maxHeight: 680,
    drawShadow: !reduced,
    maxShadowOpacity: reduced ? 0.15 : 0.6,
    flippingTime: reduced ? 350 : 900,
    usePortrait: true,
    autoSize: true,
    mobileScrollSupport: true,
    showCover: false,
    startPage: 1
  });

  // ✅ IMPORTANT: load only pages inside the flipbook
  const pages = Array.from(els.flipbook.querySelectorAll(".my-page"));
  pageFlip.loadFromHTML(pages);

  pageFlip.on("flip", () => syncFromPage(pageFlip.getCurrentPageIndex()));
  pageFlip.on("changeState", (e) => {
    state.isFlipping = (e?.data === "flipping");
    updateNav();
  });
}

function syncFromPage(pageIndex){
  state.step = clamp(Math.floor(pageIndex/2), 0, QUESTIONS.length-1);
  updateTopbar();
  updateProgress();
  updateNav();
  refreshTabbables();
  focusQuestion();
}

function buildQuestions(){
  // Quiz pages
  QUESTIONS.forEach((q,i)=>{
    const title = document.getElementById(`q-title-${i}`);
    const group = document.getElementById(`options-${i}`);
    if (!title || !group) return;

    title.textContent = q.text;
    group.innerHTML = "";

    q.options.forEach((label, idx)=>{
      const key = String.fromCharCode(65+idx); // internal A-D
      const btn = document.createElement("button");
      btn.type="button";
      btn.className="option";
      btn.setAttribute("role","radio");
      btn.dataset.step=String(i);
      btn.dataset.index=String(idx);
      btn.dataset.key=key;
      btn.setAttribute("aria-checked","false");
      btn.tabIndex=-1;
      btn.innerHTML = `<span class="option__key">${key}</span> ${label}`;
      btn.addEventListener("click", ()=> setAnswer(i, idx, true));
      group.appendChild(btn);
    });
  });

  // Optional Home preview (if your home has these ids)
  const homeTitle = document.getElementById("home-q-title-0");
  const homeGroup = document.getElementById("home-options-0");
  if (homeTitle && homeGroup) {
    const q0 = QUESTIONS[0];
    homeTitle.textContent = q0.text;
    homeGroup.innerHTML = "";

    q0.options.forEach((label, idx) => {
      const key = String.fromCharCode(65 + idx);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.setAttribute("role", "radio");
      btn.dataset.step = "0";
      btn.dataset.index = String(idx);
      btn.dataset.key = key;
      btn.setAttribute("aria-checked", "false");
      btn.tabIndex = -1;
      btn.innerHTML = `<span class="option__key">${key}</span> ${label}`;

      btn.addEventListener("click", () => {
        state.answers[QUESTIONS[0].id] = key;

        const radios = Array.from(homeGroup.querySelectorAll('[role="radio"]'));
        radios.forEach((el, j) => {
          const checked = j === idx;
          el.setAttribute("aria-checked", checked ? "true" : "false");
          el.tabIndex = checked ? 0 : -1;
        });
      });

      homeGroup.appendChild(btn);
    });
  }
}

function setAnswer(stepIndex, optionIndex, fromMouse){
  const q = QUESTIONS[stepIndex];
  const key = String.fromCharCode(65+optionIndex);
  state.answers[q.id] = key;
  state.activeOptionIndex = optionIndex;

  const group = document.getElementById(`options-${stepIndex}`);
  if (!group) return;
  const radios = Array.from(group.querySelectorAll('[role="radio"]'));

  radios.forEach((el, idx)=>{
    const checked = idx===optionIndex;
    el.setAttribute("aria-checked", checked ? "true" : "false");
    el.tabIndex = checked ? 0 : -1;
  });

  const err = document.getElementById(`error-${stepIndex}`);
  if (err) err.textContent = "";

  updateNav();
  if (!fromMouse) radios[optionIndex]?.focus();
}

function refreshTabbables(){
  for (let i=0;i<QUESTIONS.length;i++){
    const group = document.getElementById(`options-${i}`);
    if (!group) continue;

    const radios = Array.from(group.querySelectorAll('[role="radio"]'));
    const active = i===state.step;

    if (!active){
      radios.forEach(r=>r.tabIndex=-1);
      group.setAttribute("aria-hidden","true");
      continue;
    }

    group.removeAttribute("aria-hidden");
    const selected = state.answers[QUESTIONS[i].id];
    const selectedIdx = selected ? selected.charCodeAt(0)-65 : null;
    const idx = selectedIdx!==null ? selectedIdx : (state.activeOptionIndex || 0);
    radios.forEach((r,j)=>r.tabIndex = (j===idx)?0:-1);
  }
}

function focusQuestion(){
  document.getElementById(`q-title-${state.step}`)?.focus();
}

function updateProgress(){
  if (!els.progressText) return;
  els.progressText.textContent = `${state.step+1}/${QUESTIONS.length}`;
}

function updateNav(){
  if (!els.backBtn || !els.nextBtn) return;

  els.backBtn.disabled = state.step===0 || state.isFlipping;
  els.backBtn.setAttribute("aria-disabled", String(els.backBtn.disabled));

  const q = QUESTIONS[state.step];
  const has = Boolean(state.answers[q.id]);
  els.nextBtn.disabled = state.isFlipping || !has;
  els.nextBtn.setAttribute("aria-disabled", String(els.nextBtn.disabled));
  els.nextBtn.textContent = (state.step===QUESTIONS.length-1) ? "Finish" : "Next";
}

function turnBySpread(delta){
  if (!pageFlip) return;
  const i = pageFlip.getCurrentPageIndex();
  const target = clamp(i + delta, 0, pageFlip.getPageCount() - 1);
  pageFlip.turnToPage(target);
}

function goNext(){
  const q = QUESTIONS[state.step];
  if (!state.answers[q.id]){
    const err = document.getElementById(`error-${state.step}`);
    if (err) err.textContent = "Vali üks vastus.";
    document.querySelector(`#options-${state.step} [role="radio"]`)?.focus();
    return;
  }

  if (state.step < QUESTIONS.length - 1){
    turnBySpread(2);
  } else {
    finishQuiz();
  }
}

function goBack(){
  if (state.step > 0) turnBySpread(-2);
}

function onKeyDown(e){
  if (state.screen!=="quiz") return;
  if (state.isFlipping) return;

  const group = document.getElementById(`options-${state.step}`);
  if (!group) return;

  const radios = Array.from(group.querySelectorAll('[role="radio"]'));
  const inGroup = group.contains(document.activeElement);

  if (e.key>="1" && e.key<="4"){
    e.preventDefault();
    const idx = parseInt(e.key,10)-1;
    if (radios[idx]) setAnswer(state.step, idx, false);
    return;
  }

  if (inGroup && ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
    let idx = state.activeOptionIndex ?? 0;
    if (e.key==="ArrowDown"||e.key==="ArrowRight") idx = (idx+1)%radios.length;
    if (e.key==="ArrowUp"||e.key==="ArrowLeft") idx = (idx-1+radios.length)%radios.length;
    setAnswer(state.step, idx, false);
    return;
  }

  if (e.key==="Enter" && inGroup){
    e.preventDefault();
    goNext();
    return;
  }

  if (e.key==="Backspace" && state.step>0){
    e.preventDefault();
    goBack();
  }
}

/* ---- Scoring ---- */
function answersToTraits(ans){
  const t={calm:0,tense:0,comfort:0,curious:0,low:0,energy:0,real:0,surreal:0,fantasy:0,history:0,language:0,plot:0,characters:0,ideas:0,open:0,hope:0,honest:0};
  if (ans.q1==="A") t.calm+=2;
  if (ans.q1==="B") t.tense+=2;
  if (ans.q1==="C") t.comfort+=2;
  if (ans.q1==="D") t.curious+=2;

  if (ans.q2==="A") t.low+=2;
  if (ans.q2==="B") {t.low+=1; t.energy+=1;}
  if (ans.q2==="C") t.energy+=1;
  if (ans.q2==="D") t.energy+=2;

  if (ans.q3==="A") t.real+=2;
  if (ans.q3==="B") {t.real+=1; t.surreal+=1;}
  if (ans.q3==="C") t.fantasy+=2;
  if (ans.q3==="D") t.history+=2;

  if (ans.q4==="A") t.language+=2;
  if (ans.q4==="B") t.plot+=2;
  if (ans.q4==="C") t.characters+=2;
  if (ans.q4==="D") t.ideas+=2;

  if (ans.q5==="A") t.open+=2;
  if (ans.q5==="B") t.hope+=2;
  if (ans.q5==="C") t.honest+=2;
  if (ans.q5==="D") {t.calm+=1; t.characters+=1;}
  return t;
}

function score(user, book){
  let s=0;
  for (const k in book){
    s += Math.min(user[k]||0, book[k]);
  }
  return s;
}

function pickBook(avoidId=null){
  const u = answersToTraits(state.answers);
  let best=-1e9;
  let ties=[];
  for (const b of SHORTLIST){
    if (avoidId && b.id===avoidId) continue;
    const s = score(u, b.t);
    if (s>best){best=s; ties=[b];}
    else if (s===best) ties.push(b);
  }
  return ties[Math.floor(Math.random()*ties.length)];
}

/* ---- Google Books ---- */
async function fetchBook(query){
  const base="https://www.googleapis.com/books/v1/volumes";
  const params=new URLSearchParams({q:query,maxResults:"1",printType:"books"});
  const res=await fetch(`${base}?${params.toString()}`);
  if (!res.ok) throw new Error(`Google Books error ${res.status}`);
  const data=await res.json();
  const item=data.items && data.items[0];
  if (!item) throw new Error("No book found");
  const v=item.volumeInfo||{};
  return {
    title: v.title || "Untitled",
    author: (v.authors && v.authors[0]) ? v.authors[0] : "Unknown author",
    year: (v.publishedDate||"").slice(0,4) || "—",
    description: v.description || "Kirjeldus puudub.",
    pages: v.pageCount || null,
    cover: (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) || null,
    infoLink: v.infoLink || v.canonicalVolumeLink || null
  };
}

function estimateHours(pages, pagesPerHour=40){
  if (!pages || pages<=0) return null;
  return Math.round((pages/pagesPerHour)*2)/2;
}
function stripHtml(s){ return (s||"").replace(/<[^>]+>/g,""); }
function truncate(s,n){ return s.length>n ? s.slice(0,n).trimEnd()+"…" : s; }

async function finishQuiz(avoidId=null){
  showResult();

  if (els.resTitle) els.resTitle.textContent="Loading…";
  if (els.resMeta) els.resMeta.textContent="";
  if (els.resPages) els.resPages.textContent="—";
  if (els.resTime) els.resTime.textContent="—";
  if (els.resDesc) els.resDesc.textContent="";
  if (els.coverImg){
    els.coverImg.removeAttribute("src");
    els.coverImg.alt="";
  }
  if (els.infoLink){
    els.infoLink.href="#";
    els.infoLink.style.pointerEvents="none";
    els.infoLink.style.opacity=".55";
  }
  if (els.fallbackNote) els.fallbackNote.hidden=true;

  const chosen = pickBook(avoidId);
  state.lastChosenId = chosen.id;

  try{
    const book = await fetchBook(chosen.q);
    renderResult(book);
  } catch (err){
    renderResult({
      title:"We couldn't fetch book data",
      author:"Google Books API",
      year:"—",
      description:`Päring: ${chosen.q}\n\nViga: ${String(err.message||err)}`,
      pages:null, cover:null, infoLink:null
    });
  }
}

function renderResult(book){
  const desc = stripHtml(book.description||"");
  const hours = estimateHours(book.pages);

  if (els.resTitle) els.resTitle.textContent = book.title;
  if (els.resMeta) els.resMeta.textContent = `${book.author}${book.year && book.year!=="—" ? " • "+book.year : ""}`;
  if (els.resPages) els.resPages.textContent = book.pages ? String(book.pages) : "—";
  if (els.resTime) els.resTime.textContent = hours ? `~${hours} h` : "—";

  if (els.resDesc){
    els.resDesc.dataset.full = desc;
    els.resDesc.textContent = truncate(desc, 420);
  }

  if (els.toggleDescBtn){
    els.toggleDescBtn.hidden = desc.length <= 420;
    els.toggleDescBtn.textContent = "Show more";
    els.toggleDescBtn.setAttribute("aria-expanded","false");
  }

  if (els.coverImg && book.cover){
    els.coverImg.src = book.cover;
    els.coverImg.alt = `Book cover of ${book.title}`;
  }

  if (els.infoLink && book.infoLink){
    els.infoLink.href = book.infoLink;
    els.infoLink.style.pointerEvents="auto";
    els.infoLink.style.opacity="1";
  }

  if (els.fallbackNote) els.fallbackNote.hidden=false;

  if (els.resTitle){
    els.resTitle.tabIndex=-1;
    els.resTitle.focus();
  }
}

/* ---- Start / Reset ---- */
function resetQuiz(){
  state.step=0;
  state.answers={};
  state.isFlipping=false;
  state.activeOptionIndex=0;
  state.lastChosenId=null;
  for (let i=0;i<QUESTIONS.length;i++){
    const err=document.getElementById(`error-${i}`);
    if (err) err.textContent="";
  }
}

function applySelections(){
  for (let i=0;i<QUESTIONS.length;i++){
    const sel = state.answers[QUESTIONS[i].id];
    if (!sel) continue;
    setAnswer(i, sel.charCodeAt(0)-65, true);
  }
  refreshTabbables();
  updateNav();
}

function startDirectQuiz(){
  resetQuiz();
  showOnlyQuiz();

  // build then flip
  buildQuestions();
  initFlip();

  // first question page
  pageFlip.turnToPage(1);
  syncFromPage(1);
  applySelections();
}

/* ---- Events ---- */
els.backBtn?.addEventListener("click", goBack);
els.nextBtn?.addEventListener("click", goNext);
document.addEventListener("keydown", onKeyDown);

els.toggleDescBtn?.addEventListener("click", ()=>{
  const full = els.resDesc?.dataset.full || "";
  const expanded = els.toggleDescBtn.getAttribute("aria-expanded")==="true";
  if (expanded){
    if (els.resDesc) els.resDesc.textContent = truncate(full, 420);
    els.toggleDescBtn.textContent="Show more";
    els.toggleDescBtn.setAttribute("aria-expanded","false");
  } else {
    if (els.resDesc) els.resDesc.textContent = full;
    els.toggleDescBtn.textContent="Show less";
    els.toggleDescBtn.setAttribute("aria-expanded","true");
  }
});

els.againBtn?.addEventListener("click", ()=>{
  resetQuiz();
  startDirectQuiz();
});

els.anotherBtn?.addEventListener("click", ()=>finishQuiz(state.lastChosenId));

/* ---- BOOT ---- */
document.addEventListener("DOMContentLoaded", ()=>{
  // Start on Home (cover)
  showScreen("home");
  updateTopbar();

  // If you have a home preview question, this will populate it (safe if not present)
  buildQuestions();

  // Start buttons (safe if not present)
  els.startBtn?.addEventListener("click", startDirectQuiz);
  els.startInlineBtn?.addEventListener("click", startDirectQuiz);

  // Enter starts from Home
  document.addEventListener("keydown", (e)=>{
    if (state.screen !== "home") return;
    if (e.key === "Enter"){
      e.preventDefault();
      startDirectQuiz();
    }
  });
});
