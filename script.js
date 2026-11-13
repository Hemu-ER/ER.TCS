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
function draw(){
 if(!ctx||step!==5)return;
 ctx.clearRect(0,0,W,H);
 const ink='#263846',gold='#b39664',navy='#1c3243';
 // Airy official stationery, NOT a wall of fantasy borders.
 const bg=ctx.createLinearGradient(0,0,W,H);
 bg.addColorStop(0,'#faf6ee');bg.addColorStop(.55,'#f4eddf');bg.addColorStop(1,'#eee3d0');rect(0,0,W,H,bg);
 ctx.save();ctx.globalAlpha=.1;for(let i=0;i<45;i++){const y=45+i*30;line(45,y,955,y,'#ccb892',.35)}ctx.restore();
 ctx.strokeStyle='#ad956c';ctx.lineWidth=2;ctx.strokeRect(27,27,946,1360);
 ctx.strokeStyle='#d2bfa0';ctx.lineWidth=1;ctx.strokeRect(38,38,924,1338);
 // Subtle embossed paper watermarks and original ornament PNGs.
 official('watermark',300,865,410,410,.055);
 official('corners',57,47,135,72,.49);
 official('corners',807,47,135,72,.49,true);
 official('cathedral',337,45,326,112,.95);
 text('LUMIA / SOCIAL ARCHIVE',73,98,16,'#847255',700);
 text('ISSUED • SEASON XIII',763,98,16,'#847255',700);
 centerText('교류 등록 증명서',500,192,53,ink,700);
 centerText('ETERNAL RETURN  ·  THIRTEENTH SEASON',500,226,17,'#937c56',400);
 thinRule(249,76,924);
 // 01 / Registrant. Portrait is the visual anchor, while labels stay quiet.
 official('blankLabel',403,281,233,78,.96);
 text('I. 등록자 정보',449,325,23,ink,700);
 const px=91,py=325,pw=242,ph=242;
 rect(px-7,py-7,pw+14,ph+14,'#d6c8ad');
 if(!portrait(photoImage,px,py,pw,ph)){
  rect(px,py,pw,ph,navy);official('watermark',px+34,py+37,174,174,.27);
  centerText('PROFILE',px+pw/2,py+222,18,'#e1d1b6');
 }
 official('portrait',65,299,293,293,.94);
 text('Nº 01 / APPLICANT',98,611,15,'#957c56',700);
 const nick=state.nickname||'이름 미입력';
 let nsize=Math.min(49,Math.max(31,49*494/Math.max(494,measure(nick,49,700))));
 text(fitText(nick,493,nsize,700),413,388,nsize,ink,700);
 text(fitText(state.xid||'@X_ID',493,23),416,422,23,'#6c7b81');
 if(state.discordPublic&&state.discord)text('DISCORD  '+fitText(state.discord,340,17),416,451,18,'#60747d');
 line(414,468,909,468,'#c6b59a',1);
 wrap(state.oneLine||'함께할 인연을 기다리는 중',414,507,489,31,2,23,ink);
 // Information as typeset lines, not ornate SVG boxes.
 const details=[['티어',state.tier||'—'],['주 활동 시간',state.time||'—'],['선호 모드',state.modes.join(' / ')||'—'],['성별',state.gender||'—']];
 const dpos=[[414,575],[663,575],[414,623],[663,623]];
 details.forEach(([k,v],i)=>{const [x,y]=dpos[i];labelText(k,x,y-19);infoText(v,x,y+9,i%2===0?225:233,21,i===0?700:400)});
 thinRule(665,76,924);
 // 02 / Characters. Five sober archival portrait fields, not sticker tiles.
 text('II. 선호 실험체',83,714,28,ink,700);
 text('PREFERRED SUBJECTS / FIVE MAX',634,714,16,'#917c59');
 for(let i=0;i<5;i++){
   const x=83+i*170,y=749,w=152,h=145,id=state.characters[i],entry=characters.find(c=>c.name===id),img=entry&&charImages.get(id);
   ctx.fillStyle='#ebe3d3';ctx.fillRect(x,y,w,h);
   ctx.strokeStyle='#bcab8c';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
   ctx.strokeStyle='#e7ddc8';ctx.lineWidth=1;ctx.strokeRect(x+5,y+5,w-10,h-10);
   if(img?.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,x+13,y+8,w-26,w-26)}
   else official('watermark',x+28,y+25,96,96,.16);
   rect(x+10,y+122,132,23,'#203747');
   text(String(i+1).padStart(2,'0'),x+18,y+140,17,'#e8d7b5',700);
   if(id)centerText(fitText(charName(id),139,19,700),x+76,y+177,19,ink,700);
   else centerText('미선택',x+76,y+177,18,'#a19a88');
 }
 thinRule(952,76,924);
 // 03 / Written record.
 text('III. 교류 기록',83,1006,29,ink,700);
 text('PERSONAL NOTES',727,1006,16,'#917c59');
 const rows=[['관심사',state.interests],['좋아요',state.likes],['싫어요',state.dislikes]];
 rows.forEach(([k,v],i)=>{
   const y=1053+i*56;labelText(k,91,y);
   text(fitText(v||'—',725,22),213,y,22,ink);
   line(91,y+16,907,y+16,'#dacdb6',1);
 });
 labelText('자유 소개',91,1235);
 wrap(state.intro||'자유 소개를 작성하지 않았습니다.',91,1271,682,34,3,21,ink);
 // Genuine wax and blue ink document stamps from uploaded files.
 official('lilies',764,1219,136,136,.31);
 official('wax',813,1212,131,131,.95);
 official('stamp',784,1065,128,128,.15);
 line(75,1356,925,1356,'#c5b393');
 centerText('이 문서는 작성자의 소개를 기록한 교류용 증명서입니다.',500,1377,15,'#88775d');
}

function measure(s,size,weight=400){ctx.font=`${weight} ${size}px Heiro`;return ctx.measureText(s).width}
function download(){draw();const a=document.createElement('a');a.download=`ER-TCS-S13-${(state.nickname||'profile').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
async function init(){try{const res=await fetch('characters.json');if(res.ok)characters=await res.json()}catch(e){}if(!characters.length)characters=['Aya','Jackie','Fiora','Yuki','Hyunwoo','Bianca','Rio','Nadine','Hart','Hyejin','Emma','Adriana'].map(name=>({name}));for(const c of characters){if(!c.image)continue;const img=new Image();img.onload=()=>{if(step===5)draw()};img.onerror=()=>{};img.src=c.image;charImages.set(c.name,img)}if(document.fonts?.ready)document.fonts.ready.then(()=>{if(step===5)draw()});loadOfficialImages();loadPhoto();render()}
init();
