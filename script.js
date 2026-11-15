'use strict';
const $=s=>document.querySelector(s);
const stages=[['이름','어떤 이름으로 불리고 싶으신가요?','프로필에 표시될 이름과 소개를 작성해 주세요.'],['프로필','나를 나타내는 모습','프로필 이미지와 연락 정보를 설정해 주세요.'],['플레이','루미아 섬에서의 시간','주로 즐기는 게임 모드와 활동 시간을 선택해 주세요.'],['실험체','함께하는 실험체','좋아하는 실험체를 최대 다섯 명 선택해 주세요.'],['이야기','조금 더 들려주세요','관심사와 소개를 자유롭게 작성해 주세요.'],['완성','기록이 완성되었습니다','완성된 트친소를 확인하고 이미지로 저장해 주세요.']];
const defaults={nickname:'',xid:'',oneLine:'',gender:'비공개',discord:'',discordPublic:false,photoCrop:{x:.5,y:.5,zoom:1},tier:'',modes:[],time:'',characters:[],interests:'',likes:'',dislikes:'',intro:'',photo:'',photoCorrection:{enabled:false,sharpness:20,contrast:4,brightness:0}};
let state={...defaults},step=0,characters=[],photoImage=null,seasonImage=null;const charImages=new Map();
try{const saved=JSON.parse(localStorage.getItem('ertcs_s13_v2')||'null');if(saved&&typeof saved==='object')state={...defaults,...saved,modes:Array.isArray(saved.modes)?saved.modes:[],characters:Array.isArray(saved.characters)?saved.characters:[],photoCorrection:{...defaults.photoCorrection,...(saved.photoCorrection||{})}}}catch(e){}
const canvas=$('#profileCanvas'),ctx=canvas.getContext('2d');const W=1000,H=1414;
const ko={Bihyung:'비형',Charlotte:'샬럿',Coraline:'코랄린',Craver:'크레이버',Darko:'다르코',Fenrir:'펜리르',Garnet:'가넷',Henry:'헨리',Hisui:'히스이',Isol:'이솔',Istvan:'이슈트반',Justyna:'유스티나',Katja:'카티야',Leni:'레니',Lenore:'레노어',Lucia:'루시아',Mirka:'미르카',NiaH:'니아',Tazia:'타지아',Xuelin:'쉐린',Shoichi:'쇼이치',Aya:'아야',Jackie:'재키',Fiora:'피오라',Hyunwoo:'현우',LiDailin:'리 다이린','Li Dailin':'리 다이린',Yuki:'유키',Hyejin:'혜진',Nadine:'나딘',Hart:'하트',Adriana:'아드리아나',Bianca:'비앙카',Chiara:'키아라',Cathy:'캐시',Daniel:'다니엘',Emma:'엠마',Eleven:'일레븐',Felix:'펠릭스',Irem:'이렘',Jenny:'제니',Laura:'라우라',Lyanh:'이안','Ly Anh':'이안',Martha:'마르타',Nicky:'니키',Rio:'리오',Rozzi:'로지',Sissela:'시셀라',Sua:'수아',Tia:'티아',Vanya:'바냐',William:'윌리엄',Zahir:'자히르',Abigail:'아비게일',Adela:'아델라',Adina:'아디나',Aiden:'에이든',Alex:'알렉스',Alonso:'알론소',Arda:'아르다',Barbara:'바바라',Bernice:'버니스',Blair:'블레어',Camilo:'카밀로',Celine:'셀린',Chloe:'클로에',DebiMarlene:'데비&마를렌','Debi & Marlene':'데비&마를렌',Echion:'에키온',Elena:'엘레나',Estelle:'에스텔',Eva:'에바',Haze:'헤이즈',Isaac:'아이작',Jan:'얀',Johann:'요한',Karla:'칼라',Kenneth:'케네스',Lenox:'레녹스',Leon:'레온',Lidia:'리디아',Luke:'루크',Magnus:'매그너스',Mai:'마이',Markus:'마커스',Martina:'마르티나',Nathapon:'나타폰',Piolo:'피올로',Priya:'프리야',Schoichi:'쇼이치',Silvia:'실비아',Theodore:'테오도르',Tsubame:'츠바메',Xiukai:'쇼우',Yumin:'유민',Seres:'세레스'};
function charName(id){const c=characters.find(x=>x.name===id);return (c&&(c.nameKo||c.koreanName||c.ko||c.displayName))||ko[id]||id}
function save(){try{localStorage.setItem('ertcs_s13_v2',JSON.stringify(state))}catch(e){}}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function field(label,key,placeholder='',type='text'){return `<label class="field"><span class="field-label">${label}</span><input type="${type}" data-key="${key}" value="${escapeHtml(state[key])}" placeholder="${escapeHtml(placeholder)}" maxlength="${key==='intro'?300:90}"></label>`}
function area(label,key,placeholder='',max=180){return `<label class="field"><span class="field-label">${label}</span><textarea data-key="${key}" maxlength="${max}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state[key])}</textarea></label>`}
function choices(key,values,multi=false){return `<div class="choice-row">${values.map(v=>`<button type="button" class="choice ${(multi?state[key].includes(v):(key==='discordPublic'?(state.discordPublic?'공개':'비공개')===v:state[key]===v))?'selected':''}" data-choice="${key}" data-value="${escapeHtml(v)}" data-multi="${multi}">${escapeHtml(v)}</button>`).join('')}</div>`}
function renderNav(){$('#stepNav').innerHTML=stages.map((s,i)=>`<button type="button" class="step-button ${i===step?'active':''} ${i<step?'done':''}" data-step="${i}"><span class="step-num">${String(i+1).padStart(2,'0')}</span><span class="step-text">${s[0]}</span>${i<step?'<span class="step-check">✓</span>':''}</button>`).join('')}
function renderForm(){let html='';if(step===0)html=`<h2 class="form-title">첫 번째 장 · 이름</h2><p class="form-hint">모험가의 첫 번째 기록을 작성해 주세요.</p>${field('닉네임','nickname','예: 라임')}${field('X 아이디','xid','예: @lime_daily')}${field('한 줄 소개','oneLine','예: 랭크도 하고 잡담도 합니다!')}`;
if(step===1)html=`<h2 class="form-title">두 번째 장 · 프로필</h2><p class="form-hint">사진을 선택한 뒤 보이는 위치를 조정할 수 있습니다.</p><div class="photo-editor"><div class="photo-visual"><canvas id="photoCropCanvas" width="320" height="320" aria-label="프로필 사진 미리보기"></canvas><div class="photo-visual-caption">카드에 표시될 영역</div></div><div class="photo-tools"><label class="photo-upload">사진 선택<input id="photoUpload" type="file" accept="image/*"></label><label class="crop-label">확대 <input type="range" id="cropZoom" min="1" max="3" step="0.05" value="${state.photoCrop?.zoom||1}"></label><p class="crop-hint">사진을 드래그해 중심 위치를 조정할 수 있습니다.</p><button type="button" class="secondary" id="cropReset">위치 초기화</button><button type="button" class="secondary" id="clearPhoto">사진 제거</button></div></div><div class="correction-panel"><label class="correction-switch"><input id="photoCorrectionEnabled" type="checkbox" ${state.photoCorrection?.enabled?'checked':''}><span>사진 간편 보정 사용</span></label><p class="crop-hint">원본은 그대로 보관하고, 보정을 켠 경우에만 저장 이미지에 적용돼.</p><div id="correctionControls" ${state.photoCorrection?.enabled?'':'hidden'}><label class="crop-label">선명도 <input id="photoSharpness" type="range" min="0" max="70" step="5" value="${state.photoCorrection?.sharpness??20}"></label><label class="crop-label">대비 <input id="photoContrast" type="range" min="-20" max="20" step="2" value="${state.photoCorrection?.contrast??4}"></label><label class="crop-label">밝기 <input id="photoBrightness" type="range" min="-20" max="20" step="2" value="${state.photoCorrection?.brightness??0}"></label><button type="button" id="resetCorrection" class="secondary">보정값 초기화</button></div></div><div class="field-label">성별 (선택)</div>${choices('gender',['비공개','여성','남성','기타'])}<div class="field-label">디스코드 공개 여부</div>${choices('discordPublic',['비공개','공개'])}${state.discordPublic?field('디스코드 아이디','discord','예: lime_daily'):''}`;
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
// Lightweight optional photo correction. Applies ONLY to the cropped photo area.
function applyPhotoCorrection(g,x,y,w,h){
 const c=state.photoCorrection||{};if(!c.enabled)return;
 const v=g.getImageData(x,y,w,h),p=v.data,contrast=1+(Number(c.contrast)||0)/100,bright=(Number(c.brightness)||0)*2.55;
 for(let i=0;i<p.length;i+=4){for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,(p[i+k]-127.5)*contrast+127.5+bright))}
 const s=Math.max(0,Math.min(.75,(Number(c.sharpness)||0)/100));
 if(s){const src=new Uint8ClampedArray(p);for(let py=1;py<h-1;py++)for(let px=1;px<w-1;px++){
 const j=(py*w+px)*4;for(let k=0;k<3;k++){
 const blur=(src[j-4+k]+src[j+4+k]+src[j-w*4+k]+src[j+w*4+k])/4;
 p[j+k]=Math.max(0,Math.min(255,src[j+k]+s*(src[j+k]-blur)*1.6))
 }}}
 g.putImageData(v,x,y)
}
function drawPhotoEditor(){const c=$('#photoCropCanvas');if(!c)return;const g=c.getContext('2d');g.fillStyle='#172c3a';g.fillRect(0,0,320,320);if(photoImage?.complete&&photoImage.naturalWidth)g.drawImage(photoImage,...cropParams(photoImage,320,320),0,0,320,320),applyPhotoCorrection(g,0,0,320,320);else{g.fillStyle='#d8c9a9';g.font='24px Heiro';g.textAlign='center';g.fillText('사진을 선택해 주세요',160,165);g.textAlign='left'}}
function installPhotoEditor(){
 $('#photoUpload').onchange=uploadPhoto;$('#clearPhoto').onclick=()=>{state.photo='';photoImage=null;state.photoCrop={x:.5,y:.5,zoom:1};save();drawPhotoEditor()};
 $('#cropReset').onclick=()=>{state.photoCrop={x:.5,y:.5,zoom:1};$('#cropZoom').value=1;save();drawPhotoEditor()};
 $('#cropZoom').oninput=e=>{state.photoCrop={...(state.photoCrop||{x:.5,y:.5}),zoom:Number(e.target.value)};save();drawPhotoEditor()};
 const c=$('#photoCropCanvas');let last=null;c.onpointerdown=e=>{if(!photoImage)return;last={x:e.clientX,y:e.clientY};c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(!last||!photoImage)return;const r=c.getBoundingClientRect(),[sx,sy,sw,sh]=cropParams(photoImage,320,320);state.photoCrop={...(state.photoCrop||{zoom:1}),x:Math.max(0,Math.min(1,(state.photoCrop?.x??.5)-(e.clientX-last.x)/r.width*sw/photoImage.width)),y:Math.max(0,Math.min(1,(state.photoCrop?.y??.5)-(e.clientY-last.y)/r.height*sh/photoImage.height))};last={x:e.clientX,y:e.clientY};drawPhotoEditor()};
 c.onpointerup=c.onpointercancel=()=>{if(last){last=null;save()}};
 const toggle=$('#photoCorrectionEnabled');if(toggle){toggle.onchange=()=>{state.photoCorrection.enabled=toggle.checked;$('#correctionControls').hidden=!toggle.checked;save();drawPhotoEditor()};
 for(const [id,key] of [['photoSharpness','sharpness'],['photoContrast','contrast'],['photoBrightness','brightness']]){$('#'+id).oninput=e=>{state.photoCorrection[key]=Number(e.target.value);save();drawPhotoEditor()}}
 $('#resetCorrection').onclick=()=>{state.photoCorrection={...state.photoCorrection,sharpness:20,contrast:4,brightness:0};for(const [id,key] of [['photoSharpness','sharpness'],['photoContrast','contrast'],['photoBrightness','brightness']])$('#'+id).value=state.photoCorrection[key];save();drawPhotoEditor()}}
 drawPhotoEditor();
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
function cropImage(img,x,y,w,h){
 const temp=document.createElement('canvas');temp.width=Math.ceil(w);temp.height=Math.ceil(h);const g=temp.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,...cropParams(img,w,h),0,0,temp.width,temp.height);
 applyPhotoCorrection(g,0,0,temp.width,temp.height);ctx.drawImage(temp,x,y,w,h)
}
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
 const w=Math.min(385,Math.max(210,measure(label,25,700)+91));
 ctx.fillStyle='#1a2f3c';ctx.beginPath();ctx.moveTo(65,y-32);ctx.lineTo(65+w-24,y-32);ctx.lineTo(65+w,y-12);ctx.lineTo(65+w-24,y+10);ctx.lineTo(65,y+10);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#b79a65';ctx.lineWidth=2;ctx.stroke();
 sacredStar(87,y-11,10,'#cbb07b');text(label,108,y-2,25,'#f4e8cf',700);
 line(65+w+14,y-11,931,y-11,'#b79a65');diamond(931,y-11,4,'#b79a65');
}
function infoValue(value,x,y,width,size=21,weight=400){
 const v=String(value||'—');text(fitText(v,width,size,weight),x,y,size,'#253746',weight);
}
// Official document visuals: each element is a real user-supplied transparent PNG.
const officialFiles={blankLabel:'blank_label.png',wax:'wax_seal.png',lilies:'white_lilies.png',cathedral:'cathedral_crown.png',portrait:'portrait_frame.png',corners:'corner_ornament.png',watermark:'watermark.png',stamp:'ink_stamp.png'};
const officialImages={};
function loadOfficialImages(){for(const [key,file] of Object.entries(officialFiles)){
 const img=new Image();officialImages[key]=img;img.onload=()=>{if(step===5)draw()};img.src='assets/official/'+file;
}}
function official(name,x,y,w,h,opacity=1,mirror=false){const img=officialImages[name];if(!img?.complete||!img.naturalWidth)return false;
 ctx.save();ctx.globalAlpha*=opacity;if(mirror){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(img,0,y,w,h)}else ctx.drawImage(img,x,y,w,h);ctx.restore();return true}
function centerText(s,cx,y,size,color,weight=400){text(s,cx-measure(s,size,weight)/2,y,size,color,weight)}
function thinRule(y,x=78,r=922){line(x,y,r,y,'#b7a27f',1);line(x,y+4,r,y+4,'#dfd3bb',1)}
function labelText(s,x,y){text(s,x,y,17,'#8c7557',700)}
function infoText(s,x,y,w,sz=23,bold=400){text(fitText(s||'—',w,sz,bold),x,y,sz,'#263c47',bold)}
// Season XIII document art: independent raster PNG layers, geometry only for content guides.
const docFiles={paper:'paper.png',crest:'01_lily_crest.png',plaque:'02_blank_title_plaque.png',divider:'03_thin_divider.png',frame:'04_portrait_frame.png',stamp:'05_ink_seal_with_stamp.png',seal:'06_sealing_ribbon.png'};
const docImages={};
function loadDocImages(){for(const [k,f] of Object.entries(docFiles)){
 const im=new Image(); docImages[k]=im; im.onload=()=>{if(step===5)draw()}; im.src='assets/season13doc/'+f;
}}
function doc(k,x,y,w,h,alpha=1){let im=docImages[k];if(!im?.complete||!im.naturalWidth)return false;
 ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(im,x,y,w,h);ctx.restore();return true;}
// Five-slice: do not stretch the central lily or the two ornate end caps.
function drawPlaque5(x,y,w,h){let im=docImages.plaque;if(!im?.naturalWidth)return;
 const cuts=[0,575,790,1382,1597,2172];
 const widths=[w*.22,w*.115,w*.33,w*.115,w*.22];let dest=x;
 for(let i=0;i<5;i++){const sw=cuts[i+1]-cuts[i];ctx.drawImage(im,cuts[i],0,sw,724,dest,y,widths[i],h);dest+=widths[i];}
}
// Three-slice portrait: immutable decorated crown/footer, extend only the side rails.
function drawFrame3(x,y,w,h){let im=docImages.frame;if(!im?.naturalWidth)return;
 let tops=355,bottoms=345,src=1254,srcMid=src-tops-bottoms;
 let ht=h*.295,hb=h*.285,hm=h-ht-hb;
 ctx.drawImage(im,0,0,src,tops,x,y,w,ht);
 ctx.drawImage(im,0,tops,src,srcMid,x,y+ht,w,hm);
 ctx.drawImage(im,0,src-bottoms,src,bottoms,x,y+ht+hm,w,hb);
}
function docRule(y){let im=docImages.divider;
 if(im?.naturalWidth){ // crop to the painted horizontal region; no excess transparent margins
  ctx.save();ctx.globalAlpha=.68;ctx.drawImage(im,30,180,2110,330,88,y-18,824,48);ctx.restore();
 }else line(84,y,916,y,'#c6b896',1)}
function docSection(s,y){
 const x=88, size=27, baseline=y;
 text(s,x,baseline,size,'#172632',700);
 const start=Math.max(250,x+measure(s,size,700)+28);
 line(start,baseline-11,914,baseline-11,'#b7a98c',1);
 // Only the section header's reserved trailing space receives ornamentation.
 const im=docImages.divider;
 if(im?.naturalWidth && 914-start>220){
   ctx.save();ctx.globalAlpha=.72;
   ctx.drawImage(im,875,170,460,340,Math.floor(start+(914-start)*.53)-35,baseline-28,70,36);
   ctx.restore();
 }
}
function docField(k,v,x,y,max=225){text(k,x,y,17,'#536F7D',700);text(fitText(v||'—',max,22),x,y+31,22,'#172632')}
// Single finished layout: sacred-imperial archival dossier. Form UI remains unchanged.
const documentFont='DocSerif';
function dt(s,x,y,size=23,color='#172632',weight=400,maxWidth){
 ctx.save();ctx.font=`${weight} ${size}px ${documentFont}, serif`;
 ctx.fillStyle=color;ctx.textBaseline='alphabetic';
 if(maxWidth)ctx.fillText(String(s),x,y,maxWidth);else ctx.fillText(String(s),x,y);
 ctx.restore();
}
function dmeasure(s,size=23,weight=400){ctx.save();ctx.font=`${weight} ${size}px ${documentFont}, serif`;const m=ctx.measureText(String(s)).width;ctx.restore();return m;}
function dfit(s,w,size=23,weight=400){let a=String(s??'');if(dmeasure(a,size,weight)<=w)return a;while(a&&dmeasure(a+'…',size,weight)>w)a=a.slice(0,-1);return a+'…'}
function dwlines(s,width,size=23,weight=400){const result=[];for(const para of String(s??'').split('\n')){let l='';for(const ch of para){if(l&&dmeasure(l+ch,size,weight)>width){result.push(l);l=ch}else l+=ch}result.push(l)}return result;}
function dw(s,x,y,width,size=23,lineHeight=31,maxLines=2,color='#172632',weight=400){const lines=dwlines(s,width,size,weight);lines.slice(0,maxLines).forEach((a,i)=>dt(i===maxLines-1&&lines.length>maxLines?dfit(a+'…',width,size,weight):a,x,y+i*lineHeight,size,color,weight))}
function dline(x,y,r,color='#b5aea2',lw=1){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(r,y);ctx.stroke()}
function dlabel(s,x,y,w=132){rect(x,y,w,37,'#365363');rect(x,y,w,2,'#67818b');dt(s,x+16,y+26,21,'#F3F0E6',400,w-26)}
function dcorner(x,y,sx,sy){ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);ctx.strokeStyle='#375264';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,51);ctx.lineTo(0,0);ctx.lineTo(51,0);ctx.stroke();ctx.strokeStyle='#d6c29a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,40);ctx.lineTo(8,8);ctx.lineTo(40,8);ctx.stroke();ctx.restore()}
function dphoto(img,x,y,w,h){
 ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.clip();rect(x,y,w,h,'#203342');
 if(img?.complete&&img.naturalWidth)cropImage(img,x,y,w,h);
 else {ctx.fillStyle='#7a8a90';ctx.beginPath();ctx.arc(x+w/2,y+h*.34,w*.19,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+w/2,y+h*.88,w*.36,h*.35,0,0,Math.PI*2);ctx.fill()}
 ctx.restore();
 ctx.strokeStyle='#425c67';ctx.lineWidth=7;ctx.strokeRect(x-2,y-2,w+4,h+4);
 ctx.strokeStyle='#D6C29A';ctx.lineWidth=3;ctx.strokeRect(x-6,y-6,w+12,h+12);
 for(const [xx,yy,rx,ry] of [[x-7,y-7,1,1],[x+w+7,y-7,-1,1],[x-7,y+h+7,1,-1],[x+w+7,y+h+7,-1,-1]]){
  ctx.save();ctx.translate(xx,yy);ctx.scale(rx,ry);ctx.fillStyle='#E8D9BB';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(26,0);ctx.lineTo(0,26);ctx.closePath();ctx.fill();ctx.restore();
 }
}
function dseal(){
 // Object center deliberately outside the document. Only the upper-left portion is visible.
 const im=docImages.seal;
 if(!im?.naturalWidth)return;
 ctx.save();ctx.translate(946,1326);ctx.rotate(-0.20);
 // crop the existing image to its wax medallion, partially outside the page
 ctx.drawImage(im,310,185,600,610,-116,-116,234,234);
 ctx.restore();
}
function dslot(i,id,x,y,w,h){
 const navy='#172632',gold='#D6C29A';
 const entry=characters.find(c=>c.name===id),im=entry&&charImages.get(id);
 ctx.fillStyle='#ebe8de';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#abb0ac';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
 const ih=h-36;
 if(im?.complete&&im.naturalWidth){
  ctx.save();ctx.beginPath();ctx.rect(x+4,y+4,w-8,ih-6);ctx.clip();
  // Original portraits are typically square; fill width without aspect distortion.
  const rw=(w-8),rh=ih-6;
  const scale=Math.max(rw/im.naturalWidth,rh/im.naturalHeight);
  const iw=im.naturalWidth*scale,hh=im.naturalHeight*scale;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x+(w-iw)/2,y+4+(rh-hh)/2,iw,hh);ctx.restore();
 }else{
  ctx.fillStyle='#d9d7cd';ctx.font='54px serif';ctx.textAlign='center';ctx.fillText('⚜',x+w/2,y+ih*.57);ctx.textAlign='left';
 }
 rect(x+1,y+ih,w-2,34,'#f1eee5');dline(x+6,y+ih,x+w-6,'#b8ac92');
 const name=id?charName(id):'—';const size=id?20:24;
 dt(dfit(name,w-10,size,400),x+(w-dmeasure(dfit(name,w-10,size,400),size))/2,y+h-10,size,navy);
 // Quiet archival corner notches, no thick fantasy card frames.
 ctx.strokeStyle=gold;ctx.lineWidth=2;for(const [xx,yy,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){ctx.beginPath();ctx.moveTo(xx+sx*15,yy);ctx.lineTo(xx,yy);ctx.lineTo(xx,yy+sy*15);ctx.stroke()}
}
// Template-first final card. Visual positions are driven by saved editable rectangles.
const layoutDefaults={
 portrait:[78,264,380,427],nickname:[672,262,260,51],xid:[672,328,260,45],discord:[672,384,260,38],oneLine:[672,434,260,54],tier:[672,503,260,40],modes:[672,553,260,42],time:[672,603,260,42],gender:[672,655,260,42],
 char0:[78,828,155,168],char1:[253,828,155,168],char2:[428,828,155,168],char3:[603,828,155,168],char4:[778,828,155,168],
 charName0:[78,1006,155,31],charName1:[253,1006,155,31],charName2:[428,1006,155,31],charName3:[603,1006,155,31],charName4:[778,1006,155,31],
 interests:[255,1121,675,41],likes:[255,1178,675,41],dislikes:[255,1235,675,41],intro:[255,1292,675,72]
};
const regionTitles={portrait:'프로필 사진',nickname:'이름',xid:'X ID',discord:'DISCORD',oneLine:'한 줄 소개',tier:'티어',modes:'선호 모드',time:'활동 시간',gender:'성별',interests:'관심사',likes:'좋아요',dislikes:'싫어요',intro:'자유 소개'};
for(let i=0;i<5;i++){regionTitles['char'+i]='실험체 '+(i+1)+' 사진';regionTitles['charName'+i]='실험체 '+(i+1)+' 이름'}
const layoutKey='ertcs_s13_final_layout_v1';
function storedLayout(){try{const v=JSON.parse(localStorage.getItem(layoutKey)||'{}');const o={};for(const [k,rect] of Object.entries(layoutDefaults)){const r=v[k];o[k]=Array.isArray(r)&&r.length===4&&r.every(Number.isFinite)?r.slice():rect.slice()}return o}catch(e){return structuredClone(layoutDefaults)}}
let layout=storedLayout(),editing=false,activeRegion='portrait',pointerStart=null;
const sampleAssets={};for(const [k,f] of Object.entries({paper:'holy-empire-paper.jpg',portrait:'sample-portrait.jpg',char0:'sample-char-1.jpg',char1:'sample-char-2.jpg'})){const im=new Image();im.onload=()=>draw();im.src='assets/season13/'+f;sampleAssets[k]=im}
function isDemoCard(){return ![state.nickname,state.xid,state.oneLine,state.photo,state.tier,state.time,state.interests,state.likes,state.dislikes,state.intro].some(Boolean)&&!(state.modes||[]).length&&!(state.characters||[]).length}
const demo={nickname:'테스트',xid:'@test_test',discord:'공개 안 함',oneLine:'테스트 용입니다',tier:'미래의 이터니티',modes:'일반 · 랭크 · 코발트',time:'언제나',gender:'남성',interests:'이터널 리턴, 게임',likes:'함께 게임하기',dislikes:'지나친 비난',intro:'편하게 이야기 걸어줘!'};
function val(k){if(k==='modes')return state.modes?.length?state.modes.join(' · '):(isDemoCard()?demo.modes:'—');if(k==='discord')return state.discordPublic?(state.discord||'—'):'공개 안 함';return state[k]||(isDemoCard()?demo[k]:'—')||'—'}
function blit(img,r){if(!img?.complete||!img.naturalWidth)return false;ctx.save();ctx.beginPath();ctx.rect(...r);ctx.clip();const [x,y,w,h]=r,sc=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=img.naturalWidth*sc,sh=img.naturalHeight*sc;ctx.drawImage(img,x+(w-sw)/2,y+(h-sh)/2,sw,sh);ctx.restore();return true}
function frame(r){const [x,y,w,h]=r;ctx.save();ctx.strokeStyle='#ae8d4c';ctx.lineWidth=4;ctx.strokeRect(x-4,y-4,w+8,h+8);ctx.strokeStyle='#274252';ctx.lineWidth=5;ctx.strokeRect(x-8,y-8,w+16,h+16);ctx.strokeStyle='#dcc797';ctx.lineWidth=2;ctx.strokeRect(x-13,y-13,w+26,h+26);for(let [sx,sy,dx,dy] of [[x-13,y-13,1,1],[x+w+13,y-13,-1,1],[x-13,y+h+13,1,-1],[x+w+13,y+h+13,-1,-1]]){ctx.beginPath();ctx.moveTo(sx+dx*28,sy);ctx.lineTo(sx,sy);ctx.lineTo(sx,sy+dy*28);ctx.stroke()}ctx.restore()}
function printText(v,r,size=23,weight=400,align='left',maxLines=2){const [x,y,w,h]=r;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='#1e3039';ctx.font=`${weight} ${size}px DocSerif, Georgia, serif`;ctx.textBaseline='top';ctx.textAlign=align;const lines=dwlines(String(v||'—'),w,size,weight);const lh=size*1.32;for(let i=0;i<Math.min(maxLines,lines.length,Math.floor(h/lh)||1);i++){let t=lines[i];if(i===maxLines-1&&lines.length>maxLines)t=dfit(t+'…',w,size,weight);ctx.fillText(t,align==='center'?x+w/2:x,y+i*lh,w)}ctx.restore()}
function navyLabel(s,x,y,w=160){ctx.save();ctx.fillStyle='#213b50';ctx.fillRect(x,y,w,34);ctx.strokeStyle='#c8ae73';ctx.strokeRect(x,y,w,34);ctx.fillStyle='#f5efdb';ctx.font='20px DocSerif, serif';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(s,x+w/2,y+17,w-15);ctx.restore()}
function rule(x,y,w){ctx.save();ctx.strokeStyle='#a89674';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();ctx.restore()}
function draw(){
 if(!ctx||step!==5)return;
 ctx.clearRect(0,0,W,H);if(!blit(sampleAssets.paper,[0,0,W,H]))rect(0,0,W,H,'#F3F0E6');
 // All ornamental borders and the main heraldic crest remain pixels of the approved background.
 dt('S E A S O N   X I I I   ·   E T E R N A L   R E T U R N',210,236,17,'#263c4c',700);
 // Portrait, under its fixed foreground frame.
 const pr=layout.portrait;ctx.fillStyle='#e7e3d8';ctx.fillRect(...pr);
 blit(photoImage||(isDemoCard()?sampleAssets.portrait:null),pr);frame(pr);
 const fields=[['nickname','이름',34,700],['xid','ID',25,400],['discord','DISCORD',21,400],['oneLine','한 줄 소개',22,400],['tier','티어',23,400],['modes','선호 모드',21,400],['time','활동 시간',22,400],['gender','성별',22,400]];
 for(const [key,label,size,weight] of fields){const r=layout[key];navyLabel(label,505,r[1]+Math.max(0,(r[3]-34)/2),153);printText(val(key),r,size,weight);rule(503,r[1]+r[3]+5,433)}
 rule(75,740,855);dt('선호 실험체',77,786,31,'#25394b',700);rule(280,780,652);
 const ids=state.characters||[];
 for(let i=0;i<5;i++){const r=layout['char'+i];const img=ids[i]?charImages.get(ids[i]):isDemoCard()&&i<2?sampleAssets['char'+i]:null;ctx.fillStyle='#e8e2d5';ctx.fillRect(...r);blit(img,r);frame(r);const name=ids[i]?charName(ids[i]):isDemoCard()?(i===0?'이안':i===1?'제니':'미지정'):'미지정';printText(name,layout['charName'+i],21,400,'center',1)}
 rule(72,1082,865);
 for(const [k,label] of [['interests','관심사'],['likes','좋아요'],['dislikes','싫어요'],['intro','자유 소개']]){const r=layout[k];navyLabel(label,75,r[1]+3,163);printText(val(k),r,k==='intro'?21:23,400,'left',k==='intro'?3:2);if(k!=='intro')rule(75,r[1]+r[3]+4,860)}
 drawEditor();
}
function drawEditor(){const c=$('#editOverlay');if(!c||!editing||step!==5)return;const g=c.getContext('2d');g.clearRect(0,0,1000,1414);for(const [k,r] of Object.entries(layout)){const [x,y,w,h]=r;const selected=k===activeRegion;g.fillStyle=selected?'rgba(41,139,184,.13)':'rgba(25,95,125,.025)';g.fillRect(x,y,w,h);g.strokeStyle=selected?'#e2a644':'rgba(39,106,144,.6)';g.lineWidth=selected?4:1.4;g.setLineDash(selected?[]:[6,5]);g.strokeRect(x,y,w,h);g.setLineDash([]);if(selected){g.fillStyle='#e2a644';g.fillRect(x+w-12,y+h-12,22,22);g.fillStyle='#182e3c';g.font='bold 17px sans-serif';g.fillText(regionTitles[k]||k,x+4,Math.max(20,y-8))}}}
function saveLayout(){try{localStorage.setItem(layoutKey,JSON.stringify(layout))}catch(e){console.warn(e)}}
function editorControls(){const toolbar=$('#cardEditorToolbar'),overlay=$('#editOverlay'),select=$('#editSelect');if(!toolbar||!overlay)return;
 select.innerHTML=Object.keys(layoutDefaults).map(k=>`<option value="${k}">${regionTitles[k]||k}</option>`).join('');
 function sync(){select.value=activeRegion;['X','Y','W','H'].forEach((v,i)=>$('#edit'+v).value=Math.round(layout[activeRegion][i]));}
 function activate(key){activeRegion=key;sync();drawEditor()}
 function toggle(){editing=!editing;overlay.hidden=!editing;const b=$('#editToggle');b.textContent=editing?'영역 후조정 끄기':'영역 후조정 켜기';b.classList.toggle('active',editing);if(editing){sync();drawEditor()}}
 $('#editToggle').onclick=toggle;
 $('#editReset').onclick=()=>{if(confirm('영역을 처음 배치로 되돌릴까?')){layout=structuredClone(layoutDefaults);saveLayout();sync();draw()}};
 $('#editSave').onclick=()=>{const a=document.createElement('a'),blob=new Blob([JSON.stringify({canvas:[1000,1414],regions:layout},null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='ER-TCS-S13-layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 select.onchange=e=>activate(e.target.value);
 ['X','Y','W','H'].forEach((k,i)=>$('#edit'+k).oninput=e=>{const r=layout[activeRegion];r[i]=Math.round(Number(e.target.value)||0);if(i>1)r[i]=Math.max(20,r[i]);saveLayout();draw()});
 function coords(e){const r=overlay.getBoundingClientRect();return [(e.clientX-r.left)*1000/r.width,(e.clientY-r.top)*1414/r.height]}
 overlay.addEventListener('pointerdown',e=>{const [px,py]=coords(e);let key=Object.keys(layout).reverse().find(k=>{const [x,y,w,h]=layout[k];return px>=x-10&&px<=x+w+10&&py>=y-10&&py<=y+h+10});if(!key)return;activate(key);const rect=layout[key],resize=px>rect[0]+rect[2]-25&&py>rect[1]+rect[3]-25;pointerStart={px,py,r:rect.slice(),resize,key};overlay.setPointerCapture(e.pointerId)});
 overlay.addEventListener('pointermove',e=>{if(!pointerStart)return;const [px,py]=coords(e),p=pointerStart,r=layout[p.key],dx=px-p.px,dy=py-p.py;if(p.resize){r[2]=Math.max(20,Math.round(p.r[2]+dx));r[3]=Math.max(20,Math.round(p.r[3]+dy))}else{r[0]=Math.round(p.r[0]+dx);r[1]=Math.round(p.r[1]+dy)}sync();draw()});
 const stop=()=>{if(pointerStart){pointerStart=null;saveLayout()}};overlay.addEventListener('pointerup',stop);overlay.addEventListener('pointercancel',stop);
 sync();
}

function measure(s,size,weight=400){ctx.font=`${weight} ${size}px Heiro`;return ctx.measureText(s).width}
function download(){draw();const a=document.createElement('a');a.download=`ER-TCS-S13-${(state.nickname||'profile').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
async function init(){try{const res=await fetch('characters.json');if(res.ok)characters=await res.json()}catch(e){}if(!characters.length)characters=['Aya','Jackie','Fiora','Yuki','Hyunwoo','Bianca','Rio','Nadine','Hart','Hyejin','Emma','Adriana'].map(name=>({name}));for(const c of characters){if(!c.image)continue;const img=new Image();img.onload=()=>{if(step===5)draw()};img.onerror=()=>{};img.src=c.image;charImages.set(c.name,img)}if(document.fonts?.ready)document.fonts.ready.then(()=>{if(step===5)draw()});loadOfficialImages();loadDocImages();loadPhoto();render();editorControls();loadDocumentFont()}
init();

async function loadDocumentFont(){
 try{
  await Promise.all([400,700].map(async weight=>{
   const face=new FontFace('DocSerif',`url(assets/fonts/DocSerif-${weight}.woff2)`,{weight:String(weight),style:'normal'});
   document.fonts.add(face);await face.load();
  }));
 }catch(e){console.warn('Document font unavailable, falling back to serif',e)}
 if(step===5)draw();
}
