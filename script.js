'use strict';
const $=s=>document.querySelector(s);
const stages=[['이름','어떤 이름으로 불리고 싶으신가요?','프로필에 표시될 이름과 소개를 작성해 주세요.'],['프로필','나를 나타내는 모습','프로필 이미지와 연락 정보를 설정해 주세요.'],['플레이','루미아 섬에서의 시간','주로 즐기는 게임 모드와 활동 시간을 선택해 주세요.'],['실험체','함께하는 실험체','좋아하는 실험체를 최대 다섯 명 선택해 주세요.'],['이야기','조금 더 들려주세요','관심사와 소개를 자유롭게 작성해 주세요.'],['완성','기록이 완성되었습니다','완성된 트친소를 확인하고 이미지로 저장해 주세요.']];
const defaults={nickname:'',xid:'',oneLine:'',gender:'비공개',discord:'',tier:'',modes:[],time:'',characters:[],interests:'',likes:'',dislikes:'',intro:'',photo:''};
let state={...defaults},step=0,characters=[],photoImage=null,seasonImage=null;const charImages=new Map();
try{const saved=JSON.parse(localStorage.getItem('ertcs_s13_v2')||'null');if(saved&&typeof saved==='object')state={...defaults,...saved,modes:Array.isArray(saved.modes)?saved.modes:[],characters:Array.isArray(saved.characters)?saved.characters:[]}}catch(e){}
const canvas=$('#profileCanvas'),ctx=canvas.getContext('2d');const W=1000,H=1414;
const ko={Aya:'아야',Jackie:'재키',Fiora:'피오라',Hyunwoo:'현우',LiDailin:'리 다이린','Li Dailin':'리 다이린',Yuki:'유키',Hyejin:'혜진',Nadine:'나딘',Hart:'하트',Adriana:'아드리아나',Bianca:'비앙카',Chiara:'키아라',Cathy:'캐시',Daniel:'다니엘',Emma:'엠마',Eleven:'일레븐',Felix:'펠릭스',Irem:'이렘',Jenny:'제니',Laura:'라우라',Lyanh:'이안','Ly Anh':'이안',Martha:'마르타',Nicky:'니키',Rio:'리오',Rozzi:'로지',Sissela:'시셀라',Sua:'수아',Tia:'티아',Vanya:'바냐',William:'윌리엄',Zahir:'자히르',Abigail:'아비게일',Adela:'아델라',Adina:'아디나',Aiden:'에이든',Alex:'알렉스',Alonso:'알론소',Arda:'아르다',Barbara:'바바라',Bernice:'버니스',Blair:'블레어',Camilo:'카밀로',Celine:'셀린',Chloe:'클로에',DebiMarlene:'데비&마를렌','Debi & Marlene':'데비&마를렌',Echion:'에키온',Elena:'엘레나',Estelle:'에스텔',Eva:'에바',Haze:'헤이즈',Isaac:'아이작',Jan:'얀',Johann:'요한',Karla:'칼라',Kenneth:'케네스',Lenox:'레녹스',Leon:'레온',Lidia:'리디아',Luke:'루크',Magnus:'매그너스',Mai:'마이',Markus:'마커스',Martina:'마르티나',Nathapon:'나타폰',Piolo:'피올로',Priya:'프리야',Schoichi:'쇼이치',Silvia:'실비아',Theodore:'테오도르',Tsubame:'츠바메',Xiukai:'쇼우',Yumin:'유민',Seres:'세레스'};
function save(){try{localStorage.setItem('ertcs_s13_v2',JSON.stringify(state))}catch(e){}}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function field(label,key,placeholder='',type='text'){return `<label class="field"><span class="field-label">${label}</span><input type="${type}" data-key="${key}" value="${escapeHtml(state[key])}" placeholder="${escapeHtml(placeholder)}" maxlength="${key==='intro'?300:90}"></label>`}
function area(label,key,placeholder='',max=180){return `<label class="field"><span class="field-label">${label}</span><textarea data-key="${key}" maxlength="${max}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state[key])}</textarea></label>`}
function choices(key,values,multi=false){return `<div class="choice-row">${values.map(v=>`<button type="button" class="choice ${(multi?state[key].includes(v):state[key]===v)?'selected':''}" data-choice="${key}" data-value="${escapeHtml(v)}" data-multi="${multi}">${escapeHtml(v)}</button>`).join('')}</div>`}
function renderNav(){$('#stepNav').innerHTML=stages.map((s,i)=>`<button type="button" class="step-button ${i===step?'active':''} ${i<step?'done':''}" data-step="${i}"><span class="step-num">${String(i+1).padStart(2,'0')}</span><span class="step-text">${s[0]}</span>${i<step?'<span class="step-check">✓</span>':''}</button>`).join('')}
function renderForm(){let html='';if(step===0)html=`<h2 class="form-title">첫 번째 장 · 이름</h2><p class="form-hint">모험가의 첫 번째 기록을 작성해 주세요.</p>${field('닉네임','nickname','예: 라임')}${field('X 아이디','xid','예: @lime_daily')}${field('한 줄 소개','oneLine','예: 랭크도 하고 잡담도 합니다!')}`;
if(step===1)html=`<h2 class="form-title">두 번째 장 · 프로필</h2><p class="form-hint">선택하신 사진은 이 브라우저에 저장됩니다.</p><label class="field"><span class="field-label">프로필 이미지</span><input id="photoUpload" type="file" accept="image/*"></label><div class="field-label">성별 (선택)</div>${choices('gender',['비공개','여성','남성','기타'])}${field('디스코드','discord','예: lime_daily')}<button type="button" class="secondary action" id="clearPhoto">프로필 이미지 제거</button>`;
if(step===2)html=`<h2 class="form-title">세 번째 장 · 플레이</h2><p class="form-hint">즐겨 플레이하는 방식과 시간을 알려 주세요.</p>${field('티어 (자유 입력)','tier','예: 미스릴 312점')}<div class="field-label">선호 게임 모드 (다중 선택)</div>${choices('modes',['일반','랭크','코발트','유니온'],true)}${field('주 활동 시간','time','예: 평일 저녁 / 주말')}`;
if(step===3)html=`<h2 class="form-title">네 번째 장 · 실험체</h2><p class="form-hint">최대 다섯 명까지 선택할 수 있습니다. 선택한 순서대로 카드에 표시됩니다.</p><label class="field"><span class="field-label">실험체 검색</span><input id="charSearch" placeholder="이름 검색 (한글 / 영어)" autocomplete="off"></label><div class="search-info" id="charCount">선택 ${state.characters.length} / 5</div><div class="char-grid" id="charGrid"></div><p class="notice">실험체 목록은 데이터 파일을 기준으로 표시됩니다.</p>`;
if(step===4)html=`<h2 class="form-title">다섯 번째 장 · 이야기</h2><p class="form-hint">함께 게임할 분들에게 전하고 싶은 이야기를 작성해 주세요.</p>${field('관심사 (쉼표로 구분)','interests','예: #이터널리턴, #게임, #일상')}${area('좋아요','likes','예: 같이 랭크, 실험체 얘기, 잡담',100)}${area('싫어요','dislikes','예: 지나친 훈수, 과한 비난',100)}${area('자유 소개','intro','자신을 자유롭게 소개해 주세요.',220)}`;
if(step===5)html=`<h2 class="form-title">여섯 번째 장 · 완성</h2><p class="form-hint">기록이 완성되었습니다. 수정할 내용은 이전 단계에서 변경할 수 있습니다.</p><div class="summary"><b>닉네임</b> · ${escapeHtml(state.nickname||'미입력')}<br><b>티어</b> · ${escapeHtml(state.tier||'미입력')}<br><b>선호 모드</b> · ${escapeHtml(state.modes.join(', ')||'미선택')}<br><b>선호 실험체</b> · ${state.characters.length}명 선택</div><div class="finish-actions"><button type="button" class="primary action" id="downloadBig">PNG 이미지 저장 ↓</button><button type="button" class="secondary action" id="restart">새로 작성하기</button></div><p class="notice">저장 이미지 크기는 1000 × 1414px입니다. 완성 화면의 Canvas에서 출력됩니다.</p>`;
$('#stepFields').innerHTML=html;$('#stepCounter').textContent=`${String(step+1).padStart(2,'0')} / 06 · ${['이름','프로필','플레이','실험체','이야기','완성'][step]}`;$('#stepTitle').textContent=stages[step][1];$('#stepDescription').textContent=stages[step][2];$('#prevBtn').disabled=step===0;$('#nextBtn').textContent=step===5?'작성 완료':'다음 단계 →';$('#nextBtn').disabled=step===5;
if(step===3)renderCharacters('');if(step===5){$('#downloadBig').onclick=download;$('#restart').onclick=()=>{if(confirm('모든 입력 내용을 삭제하고 처음부터 작성하시겠습니까?')){state={...defaults,modes:[],characters:[]};photoImage=null;step=0;save();render()}}}
if(step===1){$('#photoUpload').onchange=uploadPhoto;$('#clearPhoto').onclick=()=>{state.photo='';photoImage=null;save();draw()}};
$('#stepFields').querySelectorAll('[data-key]').forEach(el=>el.addEventListener('input',()=>{state[el.dataset.key]=el.value;save();draw()}));$('#stepFields').querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{let k=el.dataset.choice,v=el.dataset.value;if(el.dataset.multi==='true'){state[k]=state[k].includes(v)?state[k].filter(x=>x!==v):[...state[k],v]}else state[k]=v;save();renderForm();draw()});}
function renderCharacters(filter){const f=filter.trim().toLowerCase();const found=characters.filter(c=>c.name.toLowerCase().includes(f)||(ko[c.name]||'').includes(f)).slice(0,96);$('#charGrid').innerHTML=found.map(c=>`<button type="button" class="char ${state.characters.includes(c.name)?'selected':''}" data-char="${escapeHtml(c.name)}">${c.image?`<img loading="lazy" src="${escapeHtml(c.image)}" alt="">`:``}<span>${escapeHtml(ko[c.name]||c.name)}</span> ${state.characters.includes(c.name)?'✓':''}</button>`).join('')||'<span>검색 결과가 없습니다.</span>';$('#charCount').textContent=`선택 ${state.characters.length} / 5`;$('#charSearch').oninput=e=>renderCharacters(e.target.value);$('#charGrid').querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{const n=b.dataset.char;if(state.characters.includes(n))state.characters=state.characters.filter(x=>x!==n);else if(state.characters.length<5)state.characters.push(n);else{alert('실험체는 최대 다섯 명까지 선택할 수 있습니다.');return}save();const input=$('#charSearch');renderCharacters(input.value);draw()})}
function uploadPhoto(e){const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){alert('8MB 이하 이미지를 선택해 주세요.');return}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=650;const ratio=Math.min(1,max/Math.max(img.width,img.height));const tmp=document.createElement('canvas');tmp.width=Math.round(img.width*ratio);tmp.height=Math.round(img.height*ratio);tmp.getContext('2d').drawImage(img,0,0,tmp.width,tmp.height);state.photo=tmp.toDataURL('image/jpeg',.83);loadPhoto();save()};img.src=reader.result};reader.readAsDataURL(file)}
function loadPhoto(){photoImage=null;if(!state.photo){draw();return}const img=new Image();img.onload=()=>{photoImage=img;draw()};img.onerror=()=>{state.photo='';draw()};img.src=state.photo}
let transitionBusy=false;
async function go(i){
 const target=Math.min(5,Math.max(0,i));if(target===step||transitionBusy)return;
 transitionBusy=true;
 const turning=$('#pageTurn'),panel=$('.form-panel'),backward=target<step;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduce){
  turning.classList.toggle('reverse',backward);
  turning.classList.add('turning');
  try{await panel.animate([{opacity:1,transform:'translateX(0)'},{opacity:.25,transform:`translateX(${backward?16:-16}px)`}],{duration:230,easing:'ease-in',fill:'forwards'}).finished}catch(e){}
 }
 step=target;render();panel.getAnimations().forEach(a=>a.cancel());
 if(!reduce){
  panel.animate([{opacity:.3,transform:`translateX(${backward?-18:18}px)`},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  await new Promise(resolve=>{const anim=turning.animate([{transform:`perspective(1400px) rotateY(${backward?-10:10}deg)`,opacity:.65},{transform:`perspective(1400px) rotateY(${backward?0:0}deg)`,opacity:0}],{duration:300,easing:'ease-out'});anim.finished.then(resolve,resolve)});
  turning.classList.remove('turning');
 }
 transitionBusy=false;window.scrollTo({top:0,behavior:reduce?'instant':'smooth'});
}
function render(){renderNav();renderForm();$('#creationContent').classList.toggle('is-finished',step===5);$('#revealPanel').hidden=step!==5;if(step===5)requestAnimationFrame(draw)}
$('#stepNav').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)go(+b.dataset.step)});$('#prevBtn').onclick=()=>go(step-1);$('#nextBtn').onclick=()=>go(step+1);$('#downloadSmall').onclick=download;
function line(x1,y1,x2,y2,color='#b9a16e',width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function text(s,x,y,size=24,color='#f4eddd',weight=400,font='Heiro',maxWidth){ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.textBaseline='alphabetic';ctx.fillText(String(s),x,y,maxWidth)}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function diamond(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill()}
function fitText(s,maxWidth,size,weight=400,font='Heiro'){ctx.font=`${weight} ${size}px ${font}`;let v=String(s);while(v.length>1&&ctx.measureText(v).width>maxWidth)v=v.slice(0,-2)+'…';return v}
function wrap(s,x,y,maxW,lineH,maxLines=2,size=22,color='#e8e8df',weight=400){ctx.font=`${weight} ${size}px Heiro`;let lineStr='',lines=[];for(const ch of String(s||'')){const next=lineStr+ch;if(ctx.measureText(next).width>maxW&&lineStr){lines.push(lineStr);lineStr=ch}else lineStr=next}if(lineStr)lines.push(lineStr);lines.slice(0,maxLines).forEach((t,i)=>text(i===maxLines-1&&lines.length>maxLines?fitText(t+'…',maxW,size):t,x,y+i*lineH,size,color,weight));}
function cropImage(img,x,y,w,h){const ir=img.width/img.height,ar=w/h;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>ar){sw=img.height*ar;sx=(img.width-sw)/2}else{sh=img.width/ar;sy=(img.height-sh)/2}ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}
// 시즌 13: 한 장의 기록 서책을 Canvas로 직접 조판합니다.
function draw(){
 if(!ctx||step!==5)return;
 ctx.clearRect(0,0,W,H);
 const navy='#142b3b',ink='#253947',gold='#b99b63',paper='#f1ede2',soft='#d9d0bb';
 rect(0,0,W,H,paper);
 // 책의 안쪽 종이 결, 표지와 얇은 이중 테두리
 const page=ctx.createLinearGradient(0,0,W,H);page.addColorStop(0,'#faf6ea');page.addColorStop(.55,'#f1ecdf');page.addColorStop(1,'#e9e1cf');rect(22,22,956,1370,page);
 ctx.strokeStyle='#ad9264';ctx.lineWidth=2;ctx.strokeRect(22,22,956,1370);
 ctx.strokeStyle='rgba(160,133,85,.35)';ctx.lineWidth=1;ctx.strokeRect(35,35,930,1344);
 // 상단 커버: 과거 보고서형 카드 대신 인물 중심의 북커버
 rect(48,48,904,454,navy);
 if(seasonImage?.complete&&seasonImage.naturalWidth){ctx.save();ctx.globalAlpha=.17;cropImage(seasonImage,48,48,904,454);ctx.restore();rect(48,48,904,454,'rgba(10,29,41,.48)')}
 text('ER.TCS',77,111,40,'#f7ead0',700);text('SEASON 13',769,106,19,'#d8bd83');line(78,133,922,133,'rgba(217,191,132,.65)');
 // 세로 인물 창: 단순한 프레임, 장식 최소화
 rect(76,163,273,306,'#294354');
 ctx.save();ctx.beginPath();ctx.rect(83,170,259,292);ctx.clip();
 if(photoImage?.complete&&photoImage.naturalWidth)cropImage(photoImage,83,170,259,292);
 else if(seasonImage?.complete&&seasonImage.naturalWidth){ctx.globalAlpha=.65;cropImage(seasonImage,83,170,259,292)}
 ctx.restore();ctx.strokeStyle='#d3b77c';ctx.lineWidth=2;ctx.strokeRect(76,163,273,306);
 text('나의 기록',391,212,24,'#d4ba85');
 wrap(state.nickname||'이름 미입력',387,289,520,58,2,49,'#fff5df',700);
 text(fitText(state.xid||'@username',490,23),390,341,23,'#d5dfdf');
 line(390,370,910,370,'rgba(217,191,132,.48)');
 wrap(state.oneLine||'한 줄 소개',392,414,505,35,2,25,'#f4e8d4');
 // 요약 정보: 표 대신 서책의 짧은 문장과 여백
 text('PLAY',75,564,21,'#927444',700);line(75,580,925,580,'#c7b998');
 text('티어',82,630,20,'#88724d');text(fitText(state.tier||'미입력',350,25),245,632,25,ink,700);
 text('선호 게임 모드',535,630,20,'#88724d');text(fitText(state.modes.join(' · ')||'미선택',240,23),693,632,23,ink);
 line(75,657,925,657,'#ded3bc');
 text('활동 시간',82,703,20,'#88724d');text(fitText(state.time||'미입력',350,23),245,703,23,ink);
 text('성별',535,703,20,'#88724d');text(state.gender||'비공개',693,703,23,ink);
 if(state.discord)text('Discord  '+fitText(state.discord,600,20),82,744,20,'#627583');
 // 선호 실험체: 작은 초상화와 이름을 앨범처럼 배치
 text('함께하는 실험체',76,811,30,ink,700);line(76,831,924,831,'#bca77c');
 for(let i=0;i<5;i++){
  const x=77+i*173,y=857,w=157,h=151,id=state.characters[i],entry=characters.find(c=>c.name===id),img=entry&&charImages.get(id);
  rect(x,y,w,119,'#d9d4c8');
  if(img?.complete&&img.naturalWidth){ctx.save();ctx.beginPath();ctx.rect(x+3,y+3,w-6,113);ctx.clip();cropImage(img,x+3,y+3,w-6,113);ctx.restore()}
  else{ctx.strokeStyle='#b9a987';ctx.strokeRect(x,y,w,119);text('✧',x+64,y+75,32,'#9f8b63')}
  text(fitText(id?(ko[id]||id):'—',148,19),x+5,y+144,19,id?ink:'#9e9a90');
 }
 // 기록의 마지막 장: 문장 중심, 별도 패널을 반복하지 않음
 line(76,1046,924,1046,'#bca77c');text('나의 이야기',76,1091,30,ink,700);
 text('관심사',77,1137,19,'#937a4c');wrap(state.interests||'—',206,1137,700,28,1,21,ink);
 text('좋아요',77,1181,19,'#937a4c');wrap(state.likes||'—',206,1181,700,27,1,21,ink);
 text('싫어요',77,1225,19,'#937a4c');wrap(state.dislikes||'—',206,1225,700,27,1,21,ink);
 line(77,1248,923,1248,'#ded3bc');wrap(state.intro||'자기소개를 작성하지 않았습니다.',82,1286,834,31,3,22,ink);
 diamond(500,1362,8,gold);line(370,1362,478,1362,'#c8b88e');line(522,1362,630,1362,'#c8b88e');
}
function download(){draw();const a=document.createElement('a');a.download=`ER-TCS-S13-${(state.nickname||'profile').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
async function init(){try{const res=await fetch('characters.json');if(res.ok)characters=await res.json()}catch(e){}if(!characters.length)characters=['Aya','Jackie','Fiora','Yuki','Hyunwoo','Bianca','Rio','Nadine','Hart','Hyejin','Emma','Adriana'].map(name=>({name}));for(const c of characters){if(!c.image)continue;const img=new Image();img.onload=()=>{if(step===5)draw()};img.onerror=()=>{};img.src=c.image;charImages.set(c.name,img)}seasonImage=new Image();seasonImage.onload=()=>{if(step===5)draw()};seasonImage.src='assets/season13.png';if(document.fonts?.ready)document.fonts.ready.then(()=>{if(step===5)draw()});loadPhoto();render()}
init();
