<script>
/* ---- icon grid ---- */
const ICONS=['bot','sparkles','terminal','file-search','file-pen','file-plus','globe','plug','users','hand',
'activity','history','calendar-clock','list-todo','list-checks','brain','wrench','play','pause','square',
'rotate-ccw','refresh-cw','git-branch','git-pull-request','bug','search','bell','settings','copy','check',
'circle-check','ban','triangle-alert','info','hourglass','loader-circle','clock','zap','gauge','layout-dashboard',
'message-square','message-circle-question','arrow-up','chevron-down','ellipsis','x','sun','moon'];
document.getElementById('icon-grid').innerHTML=ICONS.map(n=>`<div class="ico"><i data-lucide="${n}"></i><small>${n}</small></div>`).join('');
lucide.createIcons();
const icons=()=>lucide.createIcons();

const REDUZ=matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut=t=>1-Math.pow(1-t,3);

/* ---- tema: claro é o padrão; escuro só por escolha explícita ---- */
const root=document.documentElement, tbtn=document.getElementById('theme');
const tbtnTop=document.getElementById('theme-top');
const sysDark=matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark,{persist=true}={}){
  root.classList.toggle('dark',dark);
  [tbtn,tbtnTop].forEach(b=>{ b.setAttribute('aria-pressed',String(dark)); b.setAttribute('aria-label',dark?T('temaClaro'):T('temaEscuro')); b.title=b.getAttribute('aria-label'); });
  if(persist){ try{ localStorage.setItem('hermes-ds-theme',dark?'dark':'light'); }catch(e){} }
}
const I18N={
  'pt-BR':{versao:'Versão 1.0.0',tarja:'Documento vivo: referência do painel do Hermes. Pode mudar sem aviso.',feedback:'Enviar feedback',temaEscuro:'Usar tema escuro',temaClaro:'Usar tema claro',fbTitulo:'Feedback registrado',fbDetalhe:'Obrigado. O relato foi anexado com a tela de origem.'},
  en:{versao:'Version 1.0.0',tarja:'Living document: reference for the Hermes dashboard. May change without notice.',feedback:'Send feedback',temaEscuro:'Use dark theme',temaClaro:'Use light theme',fbTitulo:'Feedback recorded',fbDetalhe:'Thank you. The report was attached with the source screen.'}
};
let LANG='pt-BR';
const T=k=>(I18N[LANG]||I18N['pt-BR'])[k]||k;
function setLang(l){
  LANG=I18N[l]?l:'pt-BR'; root.lang=LANG;
  document.querySelectorAll('#idioma .rd-opcao').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LANG)));
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=T(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-label]').forEach(el=>el.setAttribute('aria-label',T(el.dataset.i18nLabel)));
  setTheme(root.classList.contains('dark'),{persist:false});
  try{ localStorage.setItem('hermes-ds-idioma',LANG); }catch(e){}
}
document.querySelectorAll('#idioma .rd-opcao').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
const savedLang=(()=>{try{return localStorage.getItem('hermes-ds-idioma')}catch(e){return null}})();
setLang(savedLang||'pt-BR');
/* sem escolha salva: segue o sistema e acompanha a mudança; com escolha salva: ela vence */
const savedTheme=(()=>{try{return localStorage.getItem('hermes-ds-theme')}catch(e){return null}})();
setTheme(savedTheme?savedTheme==='dark':sysDark.matches,{persist:false});
sysDark.addEventListener('change',e=>{ let s=null; try{ s=localStorage.getItem('hermes-ds-theme'); }catch(err){} if(!s) setTheme(e.matches,{persist:false}); });
const toggleTheme=()=>setTheme(!root.classList.contains('dark'));
tbtn.onclick=toggleTheme; tbtnTop.onclick=toggleTheme;
document.querySelector('[data-shell-theme]').onclick=toggleTheme;
document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.onclick=toggleTheme);

/* ---- topbar: preta enquanto o hero está na tela, branca depois ---- */
const hero=document.querySelector('.hero');
/* nav ativa por seção */
const navLinks=[...document.querySelectorAll('#nav a')];
const secIO=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)); } }); },{rootMargin:'-40% 0px -55% 0px'});
navLinks.forEach(a=>{ const s=document.querySelector(a.getAttribute('href')); if(s) secIO.observe(s); });

/* ---- hero: título palavra a palavra, CTA, fim ---- */
const heroTitle=document.getElementById('hero-title');
function playHero(){
  hero.classList.remove('complete'); heroTitle.classList.remove('enter','exit');
  void heroTitle.offsetWidth;
  requestAnimationFrame(()=>{ heroTitle.classList.add('enter'); hero.classList.add('active'); });
}
playHero();
/* rolar: ao sair da parte sticky, o título encolhe e some (exit-scale-down) */
addEventListener('scroll',()=>{
  const r=hero.getBoundingClientRect(); const h=r.height-innerHeight;
  const p=r.top<0?Math.min(1,-r.top/Math.max(1,h)):0;
  heroTitle.classList.toggle('exit',p>.55);
  hero.classList.toggle('complete',p>=.98);
  document.body.classList.toggle('hero-on',p<.9);
},{passive:true});
dispatchEvent(new Event('scroll'));
/* miniatura: repetir e onda de cor */
const miniTitle=document.querySelector('#hero-mini .hero-title');
document.getElementById('hero-replay').onclick=()=>{ miniTitle.classList.remove('enter'); void miniTitle.offsetWidth; requestAnimationFrame(()=>miniTitle.classList.add('enter')); };
document.getElementById('hero-pulse').onclick=()=>{ window.__sparkMini?.pulse(); };

/* ---- tabs ---- */
const tabBody=document.getElementById('tab-body');
const TABS=['Três tarefas em execução, uma aguardando aprovação.','47 tarefas concluídas nos últimos 7 dias, 1 falhou.','12 na fila: 2 agendadas para hoje, 1 recorrente.'];
document.querySelectorAll('#tabs .tab[data-tab]').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active'); tabBody.textContent=TABS[t.dataset.tab];
});

/* ---- copy hex ---- */
document.querySelectorAll('.swatch').forEach(s=>s.onclick=()=>{
  const hx=s.querySelector('.hx').textContent.split('·')[0].trim();
  navigator.clipboard?.writeText(hx);
  const el=s.querySelector('.nm'), old=el.textContent;
  el.textContent='copiado ✓'; setTimeout(()=>el.textContent=old,1000);
});

/* ---- progresso: do zero ao valor em 650ms ---- */
const DUR=650;
function tomDe(v){ return v>=85?'critico':v>=70?'atencao':'ok'; }
function faixaSaude(v){ return v>=85?'critico':v>=70?'atencao':'brand'; }
function rotulo(v){ return v>0&&v<1?'<1%':Math.round(v)+'%'; }
function animarValor(alvo,aplicar){
  if(REDUZ){ aplicar(alvo,true); return; }
  const ini=performance.now();
  const passo=agora=>{ const p=Math.min(1,(agora-ini)/DUR); const v=alvo*easeOut(p); aplicar(v,p>=1); if(p<1) requestAnimationFrame(passo); };
  requestAnimationFrame(passo);
}
function animarRb(el){
  const alvo=Math.min(100,Math.max(0,parseFloat(el.dataset.alvo)||0));
  const fill=el.querySelector('.rf'), num=el.querySelector('.rp'), tom=el.dataset.tone==='plan'?(alvo>=100?'done':'ok'):tomDe(Math.round(alvo));
  fill.className='rf fill-'+tom; if(num) num.className='rp mono txt-'+tom;
  fill.style.minWidth=alvo>0?'0.25rem':'';
  el.setAttribute('role','progressbar'); el.setAttribute('aria-valuemin','0'); el.setAttribute('aria-valuemax','100'); el.setAttribute('aria-valuenow',String(alvo));
  animarValor(alvo,(v,fim)=>{ fill.style.width=v+'%'; if(num) num.textContent=fim?rotulo(alvo):Math.round(v)+'%'; });
}
function animarRing(el){
  const alvo=Math.min(100,Math.max(0,parseFloat(el.dataset.alvo)||0));
  const arc=el.querySelector('.arc'), num=el.querySelector('.n');
  const r=parseFloat(arc.getAttribute('r')), circ=2*Math.PI*r;
  el.className=el.className.replace(/\bhm-\w+/g,'').trim()+' hm-'+faixaSaude(Math.round(alvo));
  arc.setAttribute('stroke-dasharray',`${circ} ${circ}`);
  el.setAttribute('role','img'); el.setAttribute('aria-label',`Contexto ${Math.round(alvo)}%`);
  animarValor(alvo,(v,fim)=>{ arc.setAttribute('stroke-dashoffset',String(circ*(1-v/100))); num.textContent=String(Math.round(fim?alvo:v)); });
}
function animarBarFill(el){
  const alvo=Math.min(100,Math.max(0,parseFloat(el.dataset.alvoBar)||0));
  if('tom' in el.dataset) el.className='bar-fill fill-'+tomDe(alvo);
  animarValor(alvo,v=>{ el.style.width=v+'%'; });
}
function animarBars(el){ el.querySelectorAll('i').forEach((i,k)=>{ i.style.height='0'; setTimeout(()=>{ i.style.height=i.dataset.h+'%'; },REDUZ?0:40*k); }); }
function animarMeter(el){ el.querySelectorAll('i').forEach(i=>{ i.style.width='0'; requestAnimationFrame(()=>requestAnimationFrame(()=>{ i.style.width=i.dataset.w+'%'; })); }); }
function animarTudo(scope){
  scope.querySelectorAll('.rb[data-alvo]').forEach(animarRb);
  scope.querySelectorAll('[data-ring][data-alvo]').forEach(animarRing);
  scope.querySelectorAll('.bar-fill[data-alvo-bar]').forEach(animarBarFill);
  scope.querySelectorAll('[data-bars]').forEach(animarBars);
  scope.querySelectorAll('[data-meter]').forEach(animarMeter);
}
const vistos=new WeakSet();
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting&&!vistos.has(e.target)){ vistos.add(e.target); animarTudo(e.target); io.unobserve(e.target); } });
},{threshold:.15});
document.querySelectorAll('section, .shell').forEach(s=>io.observe(s));
document.querySelectorAll('[data-replay]').forEach(b=>b.onclick=()=>{ const alvo=document.querySelector(b.dataset.replay); if(alvo) animarTudo(alvo); });

/* ---- skeleton ---- */
const skBtn=document.getElementById('sk-toggle');
let skCarregando=true;
function skRender(){
  document.querySelectorAll('#sk-stage [data-sk]').forEach(el=>el.hidden=!skCarregando);
  document.querySelectorAll('#sk-stage [data-sk-content]').forEach(el=>{ el.hidden=skCarregando; el.setAttribute('aria-busy',String(skCarregando)); });
  if(!skCarregando) animarTudo(document.getElementById('sk-stage'));
}
skRender(); setTimeout(()=>{ skCarregando=false; skRender(); },1800);
skBtn.onclick=()=>{ skCarregando=true; skRender(); setTimeout(()=>{ skCarregando=false; skRender(); },1400); };

/* ---- toasts ---- */
const TOAST_ICON={ok:'circle-check',err:'ban',warn:'triangle-alert',info:'info',ask:'hand'};
const pilha=document.getElementById('toasts');
function toast({id,tom='ok',titulo,operacao,detalhe,corpo,persistente,acao}){
  id=id||('t'+Date.now()+Math.random());
  let el=pilha.querySelector(`[data-id="${id}"]`);
  const fixo=persistente??(tom==='err'||tom==='warn'||tom==='ask');
  const html=`<span class="tic"><i data-lucide="${TOAST_ICON[tom]}"></i></span><div class="tbody"><p class="ttl">${titulo}</p>${operacao?`<p class="top">${operacao}</p>`:''}${detalhe?`<p class="tsb">${detalhe}</p>`:''}${corpo||''}${acao?`<button class="btn ${tom==='ask'?'primary':'ghost'} xs" data-ops>${acao}</button>`:''}</div><button class="btn ghost xs tx" aria-label="Dispensar aviso" data-x><i data-lucide="x"></i></button>`;
  if(!el){ el=document.createElement('div'); el.className='toast'; el.dataset.id=id; pilha.appendChild(el); }
  el.dataset.tom=tom; el.innerHTML=html; icons();
  el.querySelector('[data-x]').onclick=()=>el.remove();
  const ops=el.querySelector('[data-ops]'); if(ops) ops.onclick=()=>{ el.remove(); location.hash='#agente'; };
  clearTimeout(el._t);
  if(!fixo && !(corpo&&corpo.includes('data-state="atual"'))) el._t=setTimeout(()=>el.remove(),8000);
  return el;
}
function trilhaHtml(a,b,c,d){
  const ic={ok:'circle-check',atual:'loader-circle',pendente:'circle',erro:'ban',ask:'hand'}, tx={ok:'concluída',atual:'em andamento',pendente:'pendente',erro:'falhou',ask:'aguarda você'};
  const li=(nome,st)=>`<li class="etapa" data-state="${st}"><span class="ei"><i data-lucide="${ic[st]}" class="${st==='atual'?'spin':''}"></i></span>${nome}<span class="es">${tx[st]}</span></li>`;
  const sts=[a,b,c,d];
  return `<div class="trilha"><ol>${li('Planejado',a)}${li('Executando',b)}${li('Revisando',c)}${li('Concluído',d)}</ol>${sts.includes('atual')?'<div class="bar indet" role="progressbar" aria-label="Progresso" aria-valuetext="em andamento"><span class="bar-fill"></span></div>':''}</div>`;
}
const EX={
  ok:{tom:'ok',titulo:'PR #43 aberto',operacao:'Migrar testes para vitest · #128',detalhe:'6 passos concluídos, suíte verde em 8,2 s.'},
  info:{tom:'info',titulo:'Sessão 14 retomada',detalhe:'3 tarefas em execução recuperadas do histórico.'},
  ask:{tom:'ask',titulo:'Hermes precisa da sua aprovação',operacao:'Limpar artefatos de build · #126',detalhe:'Quer executar rm -rf build/ dist/ .cache/',acao:'Ver pedido'},
  warn:{tom:'warn',titulo:'Contexto em 86%',detalhe:'O agente vai começar a resumir a conversa.',acao:'Compactar'},
  err:{tom:'err',titulo:'A tarefa foi interrompida',operacao:'Atualizar dependências · #125',detalhe:'3 pacotes têm mudanças incompatíveis.',acao:'Ver na linha do tempo'},
};
document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.toast;
  if(k==='feedback'){ toast({tom:'ok',titulo:T('fbTitulo'),detalhe:T('fbDetalhe')}); return; }
  if(k==='run'){
    const id='task-'+Math.floor(Math.random()*1e6), n=130+Math.floor(Math.random()*20);
    toast({id,tom:'info',titulo:'Tarefa iniciada',operacao:`Escrever testes do parser · #${n}`,detalhe:'O Hermes montou um plano de 4 passos.',corpo:trilhaHtml('ok','atual','pendente','pendente')});
    setTimeout(()=>{
      const r=Math.random();
      if(r<0.4) toast({id,tom:'ok',titulo:'Tarefa concluída',operacao:`Escrever testes do parser · #${n}`,detalhe:'18 testes novos, todos verdes.',corpo:trilhaHtml('ok','ok','ok','ok')});
      else if(r<0.75) toast({id,tom:'ask',titulo:'Hermes precisa da sua aprovação',operacao:`Escrever testes do parser · #${n}`,detalhe:'Quer instalar fast-check como dependência de dev.',corpo:trilhaHtml('ok','ask','pendente','pendente'),acao:'Ver pedido'});
      else toast({id,tom:'err',titulo:'A tarefa foi interrompida',operacao:`Escrever testes do parser · #${n}`,detalhe:'O parser lança em entrada vazia; precisa de decisão sua.',corpo:trilhaHtml('ok','erro','pendente','pendente'),acao:'Ver na linha do tempo'});
    },4000);
    return;
  }
  toast(EX[k]);
});
document.querySelectorAll('[data-trilha]').forEach(b=>b.onclick=()=>{
  const m={ok:['ok','ok','ok','ok'],ask:['ok','ask','pendente','pendente'],erro:['ok','erro','pendente','pendente'],andamento:['ok','atual','pendente','pendente']}[b.dataset.trilha];
  document.getElementById('trilha-demo').innerHTML=trilhaHtml(...m).replace(/^<div class="trilha">|<\/div>$/g,''); icons();
});

/* ---- notas de versão ---- */
const notes=document.getElementById('notes'); let notesTrigger=null;
function abrirNotas(ev){ notesTrigger=ev.currentTarget; notes.hidden=false; notes.querySelector('[role=dialog]').focus(); }
function fecharNotas(){ notes.hidden=true; notesTrigger?.focus({preventScroll:true}); }
document.querySelectorAll('[data-open-notes]').forEach(b=>b.onclick=abrirNotas);
document.querySelectorAll('[data-close-notes]').forEach(b=>b.onclick=fecharNotas);
document.addEventListener('keydown',e=>{
  if(notes.hidden) return;
  if(e.key==='Escape'){ fecharNotas(); return; }
  if(e.key!=='Tab') return;
  const f=[...notes.querySelectorAll('button,[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
  if(!f.length) return; const first=f[0], last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
});

/* ---- registro de execução: novas linhas chegando ---- */
const termBody=document.getElementById('term-body');
const TERM_LINES=[['ok','✓ src/api (3 tests) 1.1s'],['think','4 de 7 arquivos convertidos; os três restantes usam o mesmo padrão'],['call','edit  src/api/client.test.ts  (+5 −3)'],['call','edit  src/api/cache.test.ts  (+4 −4)'],['cmd','npx vitest run --reporter=dot'],['ok','✓ 41 tests passed (8.2s)'],['think','suíte verde; próximo passo é abrir o PR e perguntar sobre remover o jest']];
let termI=0;
function termTick(){
  if(REDUZ||document.hidden){ return; }
  const live=termBody.querySelector('.cursor'); if(live) live.remove();
  const [k,t]=TERM_LINES[termI%TERM_LINES.length]; termI++;
  const d=new Date(); const hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  const el=document.createElement('div'); el.className='ln '+k; el.innerHTML=`<span class="t">${k==='ok'||k==='dim'?'':hh}</span><span>${t}${k==='cmd'?'<span class="cursor"></span>':''}</span>`;
  termBody.appendChild(el); termBody.scrollTop=termBody.scrollHeight;
  while(termBody.children.length>14) termBody.firstElementChild.remove();
}
setInterval(termTick,2600);
</script>
