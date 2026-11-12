'use strict';
const $=s=>document.querySelector(s);
const stages=[['이름','어떤 이름으로 불리고 싶으신가요?','프로필에 표시될 이름과 소개를 작성해 주세요.'],['프로필','나를 나타내는 모습','프로필 이미지와 연락 정보를 설정해 주세요.'],['플레이','루미아 섬에서의 시간','주로 즐기는 게임 모드와 활동 시간을 선택해 주세요.'],['실험체','함께하는 실험체','좋아하는 실험체를 최대 다섯 명 선택해 주세요.'],['이야기','조금 더 들려주세요','관심사와 소개를 자유롭게 작성해 주세요.'],['완성','기록이 완성되었습니다','완성된 트친소를 확인하고 이미지로 저장해 주세요.']];
const defaults={nickname:'',xid:'',oneLine:'',gender:'비공개',discord:'',discordPublic:false,photoCrop:{x:.5,y:.5,zoom:1},tier:'',modes:[],time:'',characters:[],interests:'',likes:'',dislikes:'',intro:'',photo:''};
let state={...defaults},step=0,characters=[],photoImage=null,seasonImage=null;const charImages=new Map();
try{const saved=JSON.parse(localStorage.getItem('ertcs_s13_v2')||'null');if(saved&&typeof saved==='object')state={...defaults,...saved,modes:Array.isArray(saved.modes)?saved.modes:[],characters:Array.isArray(saved.characters)?saved.characters:[]}}catch(e){}
const canvas=$('#profileCanvas'),ctx=canvas.getContext('2d');const W=1000,H=1414;
const uiAssets={};for(const key of ['imperial-header','section-plaque','portrait-gothic','slot-frame','footer-crest']){const im=new Image();im.onload=()=>{if(step===5)draw()};im.src=`assets/design/${key}.png`;uiAssets[key]=im;}
function asset(key,x,y,w,h){const im=uiAssets[key];if(im?.complete&&im.naturalWidth){ctx.drawImage(im,x,y,w,h);return true}return false;}
const ko={Bihyung:'비형',Charlotte:'샬럿',Coraline:'코랄린',Craver:'크레이버',Darko:'다르코',Fenrir:'펜리르',Garnet:'가넷',Henry:'헨리',Hisui:'히스이',Isol:'이솔',Istvan:'이슈트반',Justyna:'유스티나',Katja:'카티야',Leni:'레니',Lenore:'레노어',Lucia:'루시아',Mirka:'미르카',NiaH:'니아',Tazia:'타지아',Xuelin:'쉐린',Shoichi:'쇼이치',Aya:'아야',Jackie:'재키',Fiora:'피오라',Hyunwoo:'현우',LiDailin:'리 다이린','Li Dailin':'리 다이린',Yuki:'유키',Hyejin:'혜진',Nadine:'나딘',Hart:'하트',Adriana:'아드리아나',Bianca:'비앙카',Chiara:'키아라',Cathy:'캐시',Daniel:'다니엘',Emma:'엠마',Eleven:'일레븐',Felix:'펠릭스',Irem:'이렘',Jenny:'제니',Laura:'라우라',Lyanh:'이안','Ly Anh':'이안',Martha:'마르타',Nicky:'니키',Rio:'리오',Rozzi:'로지',Sissela:'시셀라',Sua:'수아',Tia:'티아',Vanya:'바냐',William:'윌리엄',Zahir:'자히르',Abigail:'아비게일',Adela:'아델라',Adina:'아디나',Aiden:'에이든',Alex:'알렉스',Alonso:'알론소',Arda:'아르다',Barbara:'바바라',Bernice:'버니스',Blair:'블레어',Camilo:'카밀로',Celine:'셀린',Chloe:'클로에',DebiMarlene:'데비&마를렌','Debi & Marlene':'데비&마를렌',Echion:'에키온',Elena:'엘레나',Estelle:'에스텔',Eva:'에바',Haze:'헤이즈',Isaac:'아이작',Jan:'얀',Johann:'요한',Karla:'칼라',Kenneth:'케네스',Lenox:'레녹스',Leon:'레온',Lidia:'리디아',Luke:'루크',Magnus:'매그너스',Mai:'마이',Markus:'마커스',Martina:'마르티나',Nathapon:'나타폰',Piolo:'피올로',Priya:'프리야',Schoichi:'쇼이치',Silvia:'실비아',Theodore:'테오도르',Tsubame:'츠바메',Xiukai:'쇼우',Yumin:'유민',Seres:'세레스'};
function charName(id){const c=characters.find(x=>x.name===id);return (c&&(c.nameKo||c.koreanName||c.ko||c.displayName))||ko[id]||id}
function save(){try{localStorage.setItem('ertcs_s13_v2',JSON.stringify(state))}catch(e){}}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function field(label,key,placeholder='',type='text'){return `<label class="field"><span class="field-label">${label}</span><input type="${type}" data-key="${key}" value="${escapeHtml(state[key])}" placeholder="${escapeHtml(placeholder)}" maxlength="${key==='intro'?300:90}"></label>`}
function area(label,key,placeholder='',max=180){return `<label class="field"><span class="field-label">${label}</span><textarea data-key="${key}" maxlength="${max}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state[key])}</textarea></label>`}
function choices(key,values,multi=false){return `<div class="choice-row">${values.map(v=>`<button type="button" class="choice ${(multi?state[key].includes(v):(key==='discordPublic'?(state.discordPublic?'공개':'비공개')===v:state[key]===v))?'selected':''}" data-choice="${key}" data-value="${escapeHtml(v)}" data-multi="${multi}">${escapeHtml(v)}</button>`).join('')}</div>`}
function renderNav(){$('#stepNav').innerHTML=stages.map((s,i)=>`<button type="button" class="step-button ${i===step?'active':''} ${i<step?'done':''}" data-step="${i}"><span class="step-num">${String(i+1).padStart(2,'0')}</span><span class="step-text">${s[0]}</span>${i<step?'<span class="step-check">✓</span>':''}</button>`).join('')}
function renderForm(){let html='';if(step===0)html=`<h2 class="form-title">첫 번째 장 · 이름</h2><p class="form-hint">모험가의 첫 번째 기록을 작성해 주세요.</p>${field('닉네임','nickname','예: 라임')}${field('X 아이디','xid','예: @lime_daily')}${field('한 줄 소개','oneLine','예: 랭크도 하고 잡담도 합니다!')}`;
if(step===1)html=`<h2 class="form-title">두 번째 장 · 프로필</h2><p class="form-hint">사진을 선택한 뒤 보이는 위치를 조정할 수 있습니다.</p><div class="photo-editor"><div class="photo-visual"><canvas id="photoCropCanvas" width="320" height="320" aria-label="프로필 사진 미리보기"></canvas><div class="photo-visual-caption">카드에 표시될 영역</div></div><div class="photo-tools"><label class="photo-upload">사진 선택<input id="photoUpload" type="file" accept="image/*"></label><label class="crop-label">확대 <input type="range" id="cropZoom" min="1" max="3" step="0.05" value="${state.photoCrop?.zoom||1}"></label><p class="crop-hint">사진을 드래그해 중심 위치를 조정할 수 있습니다.</p><button type="button" class="secondary" id="cropReset">위치 초기화</button><button type="button" class="secondary" id="clearPhoto">사진 제거</button></div></div><div class="field-label">성별 (선택)</div>${choices('gender',['비공개','여성','남성','기타'])}<div class="field-label">디스코드 공개 여부</div>${choices('discordPublic',['비공개','공개'])}${state.discordPublic?field('디스코드 아이디','discord','예: lime_daily'):''}`;
if(step===2)html=`<h2 class="form-title">세 번째 장 · 플레이</h2><p class="form-hint">즐겨 플레이하는 방식과 시간을 알려 주세요.</p>${field('티어 (자유 입력)','tier','예: 미스릴 312점')}<div class="field-label">선호 게임 모드 (다중 선택)</div>${choices('modes',['일반','랭크','코발트','유니온'],true)}${field('주 활동 시간','time','예: 평일 저녁 / 주말')}`;
if(step===3)html=`<h2 class="form-title">네 번째 장 · 실험체</h2><p class="form-hint">최대 다섯 명까지 선택할 수 있습니다. 선택한 순서대로 카드에 표시됩니다.</p><label class="field"><span class="field-label">실험체 검색</span><input id="charSearch" placeholder="이름 검색 (한글 / 영어)" autocomplete="off"></label><div class="selected-characters" id="selectedCharacters"></div><div class="search-info" id="charCount">선택 ${state.characters.length} / 5</div><div class="char-grid" id="charGrid"></div><p class="notice">실험체 목록은 데이터 파일을 기준으로 표시됩니다.</p>`;
if(step===4)html=`<h2 class="form-title">다섯 번째 장 · 이야기</h2><p class="form-hint">함께 게임할 분들에게 전하고 싶은 이야기를 작성해 주세요.</p>${field('관심사 (쉼표로 구분)','interests','예: #이터널리턴, #게임, #일상')}${area('좋아요','likes','예: 같이 랭크, 실험체 얘기, 잡담',100)}${area('싫어요','dislikes','예: 지나친 훈수, 과한 비난',100)}${area('자유 소개','intro','자신을 자유롭게 소개해 주세요.',220)}`;
if(step===5)html=`<h2 class="form-title">여섯 번째 장 · 완성</h2><p class="form-hint">기록이 완성되었습니다. 수정할 내용은 이전 단계에서 변경할 수 있습니다.</p><div class="summary"><b>닉네임</b> · ${escapeHtml(state.nickname||'미입력')}<br><b>티어</b> · ${escapeHtml(state.tier||'미입력')}<br><b>선호 모드</b> · ${escapeHtml(state.modes.join(', ')||'미선택')}<br><b>선호 실험체</b> · ${state.characters.length}명 선택</div><div class="finish-actions"><button type="button" class="primary action" id="downloadBig">PNG 이미지 저장 ↓</button><button type="button" class="secondary action" id="restart">새로 작성하기</button></div><p class="notice">저장 이미지 크기는 1000 × 1414px입니다. 완성 화면의 Canvas에서 출력됩니다.</p>`;
$('#stepFields').innerHTML=html;$('#stepCounter').textContent=`${String(step+1).padStart(2,'0')} / 06 · ${['이름','프로필','플레이','실험체','이야기','완성'][step]}`;$('#stepTitle').textContent=stages[step][1];$('#stepDescription').textContent=stages[step][2];$('#prevBtn').disabled=step===0;$('#nextBtn').textContent=step===5?'작성 완료':'다음 단계 →';$('#nextBtn').disabled=step===5;
if(step===3)renderCharacters('');if(step===5){$('#downloadBig').onclick=download;$('#restart').onclick=()=>{if(confirm('모든 입력 내용을 삭제하고 처음부터 작성하시겠습니까?')){state={...defaults,modes:[],characters:[]};photoImage=null;step=0;save();render()}}}
if(step===1)installPhotoEditor();;
$('#stepFields').querySelectorAll('[data-key]').forEach(el=>el.addEventListener('input',()=>{state[el.dataset.key]=el.value;save();draw()}));$('#stepFields').querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{let k=el.dataset.choice,v=el.dataset.value;if(el.dataset.multi==='true'){state[k]=state[k].includes(v)?state[k].filter(x=>x!==v):[...state[k],v]}else if(k==='discordPublic')state.discordPublic=v==='공개';else state[k]=v;save();renderForm();draw()});}
function renderCharacters(filter){
 const f=filter.trim().toLowerCase();const found=characters.filter(c=>c.name.toLowerCase().includes(f)||charName(c.name).includes(f));
 $('#charGrid').innerHTML=found.map(c=>`<button type="button" class="char ${state.characters.includes(c.name)?'selected':''}" data-char="${escapeHtml(c.name)}" aria-pressed="${state.characters.includes(c.name)}">${c.image?`<img loading="lazy" src="${escapeHtml(c.image)}" alt="">`:``}<span>${escapeHtml(charName(c.name))}</span>${state.characters.includes(c.name)?'<b class="char-check">✓</b>':''}</button>`).join('')||'<span>검색 결과가 없습니다.</span>';
 $('#charCount').textContent=`선택 ${state.characters.length} / 5`;
 $('#selectedCharacters').innerHTML=`<strong>선택한 실험체 (${state.characters.length}/5)</strong><div class="selected-strip">${state.characters.length?state.characters.map((id,i)=>{const c=characters.find(x=>x.name===id);return `<button type="button" class="selected-chip" data-remove="${escapeHtml(id)}" title="선택 해제">${c?.image?`<img src="${escapeHtml(c.image)}" alt="">`:''}<span>${i+1}. ${escapeHtml(charName(id))}</span><span aria-hidden="true">×</span></button>`}).join(''):'<span class="selected-empty">아직 선택한 실험체가 없습니다.</span>'}</div>`;
 $('#charSearch').oninput=e=>renderCharacters(e.target.value);
 $('#selectedCharacters').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.characters=state.characters.filter(x=>x!==b.dataset.remove);save();renderCharacters($('#charSearch').value)});
 $('#charGrid').querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{const n=b.dataset.char;if(state.characters.includes(n))state.characters=state.characters.filter(x=>x!==n);else if(state.characters.length<5)state.characters.push(n);else{alert('실험체는 최대 다섯 명까지 선택할 수 있습니다.');return}save();renderCharacters($('#charSearch').value)});
}
function uploadPhoto(e){const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){alert('8MB 이하 이미지를 선택해 주세요.');return}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=900;const ratio=Math.min(1,max/Math.max(img.width,img.height));const tmp=document.createElement('canvas');tmp.width=Math.max(1,Math.round(img.width*ratio));tmp.height=Math.max(1,Math.round(img.height*ratio));tmp.getContext('2d').drawImage(img,0,0,tmp.width,tmp.height);state.photo=tmp.toDataURL('image/jpeg',.88);state.photoCrop={x:.5,y:.5,zoom:1};loadPhoto();save();renderForm()};img.src=reader.result};reader.readAsDataURL(file)}
function loadPhoto(){photoImage=null;if(!state.photo){drawPhotoEditor();draw();return}const img=new Image();img.onload=()=>{photoImage=img;drawPhotoEditor();draw()};img.onerror=()=>{photoImage=null;drawPhotoEditor()};img.src=state.photo}
function cropParams(img,w,h){const z=Math.max(1,Math.min(3,Number(state.photoCrop?.zoom)||1)),aspect=w/h,ir=img.width/img.height;let sw=img.width,sh=img.height;if(ir>aspect)sw=img.height*aspect;else sh=img.width/aspect;sw/=z;sh/=z;const cx=Math.max(sw/2,Math.min(img.width-sw/2,(state.photoCrop?.x??.5)*img.width)),cy=Math.max(sh/2,Math.min(img.height-sh/2,(state.photoCrop?.y??.5)*img.height));return [cx-sw/2,cy-sh/2,sw,sh]}
function drawPhotoEditor(){const c=$('#photoCropCanvas');if(!c)return;const g=c.getContext('2d');g.fillStyle='#172c3a';g.fillRect(0,0,320,320);if(photoImage?.complete&&photoImage.naturalWidth)g.drawImage(photoImage,...cropParams(photoImage,320,320),0,0,320,320);else{g.fillStyle='#d8c9a9';g.font='24px Heiro';g.textAlign='center';g.fillText('사진을 선택해 주세요',160,165);g.textAlign='left'}}
function installPhotoEditor(){
 $('#photoUpload').onchange=uploadPhoto;$('#clearPhoto').onclick=()=>{state.photo='';photoImage=null;state.photoCrop={x:.5,y:.5,zoom:1};save();drawPhotoEditor()};
 $('#cropReset').onclick=()=>{state.photoCrop={x:.5,y:.5,zoom:1};$('#cropZoom').value=1;save();drawPhotoEditor()};
 $('#cropZoom').oninput=e=>{state.photoCrop={...(state.photoCrop||{x:.5,y:.5}),zoom:Number(e.target.value)};save();drawPhotoEditor()};
 const c=$('#photoCropCanvas');let last=null;c.onpointerdown=e=>{if(!photoImage)return;last={x:e.clientX,y:e.clientY};c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(!last||!photoImage)return;const r=c.getBoundingClientRect(),[sx,sy,sw,sh]=cropParams(photoImage,320,320);state.photoCrop={...(state.photoCrop||{zoom:1}),x:Math.max(0,Math.min(1,(state.photoCrop?.x??.5)-(e.clientX-last.x)/r.width*sw/photoImage.width)),y:Math.max(0,Math.min(1,(state.photoCrop?.y??.5)-(e.clientY-last.y)/r.height*sh/photoImage.height))};last={x:e.clientX,y:e.clientY};drawPhotoEditor()};
 c.onpointerup=c.onpointercancel=()=>{if(last){last=null;save()}};drawPhotoEditor();
}
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
function fitText(s,maxWidth,size,weight=400,font='Heiro'){
 ctx.font=`${weight} ${size}px ${font}`;let v=String(s??'');if(ctx.measureText(v).width<=maxWidth)return v;
 while(v.length&&ctx.measureText(v+'…').width>maxWidth)v=v.slice(0,-1);return v+'…';
}
function wrapLines(s,maxW,size,weight=400){ctx.font=`${weight} ${size}px Heiro`;const lines=[];for(const para of String(s??'').split('\n')){if(!para){lines.push('');continue}let line='';for(const ch of para){if(line&&ctx.measureText(line+ch).width>maxW){lines.push(line);line=ch}else line+=ch}if(line)lines.push(line)}return lines}
function wrap(s,x,y,maxW,lineH,maxLines=2,size=22,color='#e8e8df',weight=400){const lines=wrapLines(s,maxW,size,weight);lines.slice(0,maxLines).forEach((v,i)=>text(i===maxLines-1&&lines.length>maxLines?fitText(v+'…',maxW,size,weight):v,x,y+i*lineH,size,color,weight))}
function cropImage(img,x,y,w,h){ctx.drawImage(img,...cropParams(img,w,h),x,y,w,h)}
function portrait(img,x,y,w,h){if(img?.complete&&img.naturalWidth){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();cropImage(img,x,y,w,h);ctx.restore();return true}return false}
function separator(y){line(70,y,930,y,'#cbbd9e',1)}
function imperialCorner(x,y,sx,sy){
 ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);ctx.strokeStyle='#a88a54';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,72);ctx.lineTo(0,0);ctx.lineTo(72,0);ctx.stroke();
 ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(9,57);ctx.lineTo(9,9);ctx.lineTo(57,9);ctx.stroke();
 diamond(24,24,5,'#ad915c');ctx.beginPath();ctx.arc(24,24,14,Math.PI,1.5*Math.PI);ctx.stroke();
 ctx.restore();
}
function sacredStar(x,y,r=18,color='#b99a61'){
 ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=1.6;
 ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.2,-r*.2);ctx.lineTo(r,0);ctx.lineTo(r*.2,r*.2);ctx.lineTo(0,r);ctx.lineTo(-r*.2,r*.2);ctx.lineTo(-r,0);ctx.lineTo(-r*.2,-r*.2);ctx.closePath();ctx.stroke();
 diamond(0,0,Math.max(2,r*.14),color);ctx.restore();
}
function laurel(cx,cy,flip=1){
 ctx.save();ctx.translate(cx,cy);ctx.scale(flip,1);ctx.strokeStyle='#b89b63';ctx.fillStyle='#b89b63';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(34,-30,40,-88);ctx.stroke();
 for(let i=0;i<6;i++){let x=8+i*5,y=-9-i*13;ctx.save();ctx.translate(x,y);ctx.rotate(-.58+i*.055);ctx.beginPath();ctx.ellipse(0,0,4.3,11,0,0,Math.PI*2);ctx.fill();ctx.restore()}
 ctx.restore();
}
function sectionBanner(label,y){
 asset('section-plaque',65,y-42,870,64);
 text(label,119,y-2,25,'#f5e9d0',700);
}
function infoValue(value,x,y,width,size=21,weight=400){
 const v=String(value||'—');text(fitText(v,width,size,weight),x,y,size,'#253746',weight);
}
function draw(){
 if(!ctx||step!==5)return;
 ctx.clearRect(0,0,W,H);
 const ink='#243746',gold='#ae8e58',paper='#f8f4ea',navy='#172d3b';
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#fbf8f0');bg.addColorStop(.55,'#f4eee1');bg.addColorStop(1,'#e9deca');rect(0,0,W,H,bg);
 // Crisp imperial design: restrained ink, gold rules, and gothic architectural motifs.
 ctx.strokeStyle='#aa9062';ctx.lineWidth=2;ctx.strokeRect(20,20,960,1374);
 ctx.strokeStyle='#d6c39e';ctx.lineWidth=1;ctx.strokeRect(34,34,932,1346);
 asset('imperial-header',51,41,898,175);
 text('ER.TCS',500-measure('ER.TCS',49,700)/2,139,49,ink,700);
 text('SEASON 13',500-measure('SEASON 13',17,700)/2,173,17,'#94764a',700);
 // Profile: portrait is the focus, framed like a commissioned imperial register.
 rect(73,225,276,295,navy);
 if(!portrait(photoImage,85,237,252,271)){sacredStar(211,366,40,'#d2b986');text('프로필 이미지',151,430,18,'#e3d3b3')}
 asset('portrait-gothic',66,218,290,310);
 rect(376,229,552,38,navy);text('나의 기록',404,256,24,'#f0e2c5',700);sacredStar(897,249,11,'#c9ab72');
 const nick=state.nickname||'이름 미입력';
 const nsize=Math.max(29,Math.min(50,50*515/Math.max(515,measure(nick,50,700))));
 text(fitText(nick,515,nsize,700),388,337,nsize,ink,700);
 text(fitText(state.xid||'X 아이디',510,23),390,377,23,'#677582');
 line(389,397,915,397,'#bca779');
 wrap(state.oneLine||'한 줄 소개',389,440,520,32,2,23,ink);
 // Deliberately separate chapter labels from the old tabular report design.
 sectionBanner('플레이',576);
 const entries=[['티어',state.tier],['선호 게임 모드',state.modes.join(' · ')],['활동 시간',state.time],['성별',state.gender]];
 entries.forEach(([k,v],i)=>{
  const col=i%2,row=Math.floor(i/2),x=82+col*444,y=622+row*57;
  text(k,x,y,19,'#94774d');infoValue(v,x+145,y,290,21,i===0?700:400);
  line(x,y+16,x+398,y+16,'#ded2ba');
 });
 if(state.discordPublic&&state.discord){text('디스코드',82,759,18,'#94774d');infoValue(state.discord,227,759,650,20)}
 sectionBanner('함께하는 실험체',815);
 for(let i=0;i<5;i++){
  const x=81+i*173,y=841,w=150,h=130,id=state.characters[i],entry=characters.find(c=>c.name===id),img=entry&&charImages.get(id);
  rect(x,y,w,h,'#e8dfcd');ctx.strokeStyle='#b8a47c';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);
  if(img?.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=false;const size=Math.min(w-8,h-8);ctx.drawImage(img,x+(w-size)/2,y+(h-size)/2,size,size);ctx.imageSmoothingEnabled=true}
  else sacredStar(x+w/2,y+h/2,17,'#b6a17a');
  asset('slot-frame',x-2,y-2,154,134);
  if(id)text(fitText(charName(id),150,20,700),x+4,y+154,20,ink,700);
 }
 sectionBanner('나의 이야기',1064);
 const notes=[['관심사',state.interests],['좋아요',state.likes],['싫어요',state.dislikes]];
 notes.forEach(([k,v],i)=>{const y=1109+i*42;text(k,84,y,19,'#91754c');infoValue(v,215,y,687,20);line(83,y+12,916,y+12,'#ded2ba')});
 wrap(state.intro||'자기소개를 작성하지 않았습니다.',85,1262,830,31,3,21,ink);
 asset('footer-crest',160,1324,680,58);
}

function measure(s,size,weight=400){ctx.font=`${weight} ${size}px Heiro`;return ctx.measureText(s).width}
function download(){draw();const a=document.createElement('a');a.download=`ER-TCS-S13-${(state.nickname||'profile').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
async function init(){try{const res=await fetch('characters.json');if(res.ok)characters=await res.json()}catch(e){}if(!characters.length)characters=['Aya','Jackie','Fiora','Yuki','Hyunwoo','Bianca','Rio','Nadine','Hart','Hyejin','Emma','Adriana'].map(name=>({name}));for(const c of characters){if(!c.image)continue;const img=new Image();img.onload=()=>{if(step===5)draw()};img.onerror=()=>{};img.src=c.image;charImages.set(c.name,img)}if(document.fonts?.ready)document.fonts.ready.then(()=>{if(step===5)draw()});loadPhoto();render()}
init();
