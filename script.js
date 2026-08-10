const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const STORE='er-tcs-v5';
const MAX_SUBJECTS=5;
const KO_NAMES={'Abigail': '아비게일', 'Adela': '아델라', 'Adina': '아디나', 'Adriana': '아드리아나', 'Aiden': '에이든', 'Alex': '알렉스', 'Alonso': '알론소', 'Arda': '아르다', 'Aya': '아야', 'Barbara': '바바라', 'Bernice': '버니스', 'Bianca': '비앙카', 'Bihyung': '비형', 'Blair': '블레어', 'Camilo': '카밀로', 'Cathy': '캐시', 'Celine': '셀린', 'Charlotte': '샬럿', 'Chiara': '키아라', 'Chloe': '클로에', 'Coraline': '코랄린', 'Craver': '크레이버', 'Daniel': '다니엘', 'Darko': '다르코', 'Debi & Marlene': '데비&마를렌', 'Echion': '에키온', 'Elena': '엘레나', 'Eleven': '일레븐', 'Emma': '엠마', 'Estelle': '에스텔', 'Eva': '이바', 'Felix': '펠릭스', 'Fenrir': '펜리르', 'Fiora': '피오라', 'Garnet': '가넷', 'Hart': '하트', 'Haze': '헤이즈', 'Henry': '헨리', 'Hisui': '히스이', 'Hyejin': '혜진', 'Hyunwoo': '현우', 'Irem': '이렘', 'Isaac': '아이작', 'Isol': '아이솔', 'Istvan': '이스트반', 'Jackie': '재키', 'Jan': '얀', 'Jenny': '제니', 'Johann': '요한', 'Justyna': '유스티나', 'Karla': '칼라', 'Katja': '카티야', 'Kenneth': '케네스', 'Laura': '라우라', 'Leni': '레니', 'Lenore': '르노어', 'Lenox': '레녹스', 'Leon': '레온', 'Li Dailin': '리 다이린', 'Luke': '루크', 'Lucia': '루시아', 'Ly Anh': '리앙', 'Magnus': '매그너스', 'Mai': '마이', 'Markus': '마커스', 'Martina': '마르티나', 'Mirka': '미르카', 'Nadine': '나딘', 'Nathapon': '나타폰', 'NiaH': '니아', 'Nicky': '니키', 'Piolo': '피올로', 'Priya': '프리야', 'Rio': '리오', 'Rozzi': '로지', 'Shoichi': '쇼이치', 'Silvia': '실비아', 'Sissela': '시셀라', 'Sua': '수아', 'Tazia': '타지아', 'Theodore': '테오도르', 'Tia': '띠아', 'Tsubame': '츠바메', 'Vanya': '바냐', 'William': '윌리엄', 'Xiukai': '쇼우', 'Xuelin': '쉐린', 'Yuki': '유키', 'Yumin': '유민', 'Zahir': '자히르'};
function displayName(c){return KO_NAMES[c.sourceName||c.name]||c.name}
const defaults={
 nickname:'',handle:'',headline:'',tier:'',gender:'비공',discord:'',modes:[],
 tags:['이터널 리턴','게임','일상'],traits:['즐겜 위주','멘션 좋아함'],times:[],
 likes:'',dislikes:'',bio:'',avatar:'',
 accentColor:'#7967ff',bgColor:'#302a48',cardColor:'#fffdf7',textColor:'#1e1f28',
 favoriteCharacters:[]
};
let CHARACTERS=[];
let state=load();

function load(){
 try{
   const s=JSON.parse(localStorage.getItem(STORE)||'{}');
   return {...defaults,...s,
    tags:Array.isArray(s.tags)?s.tags:defaults.tags,
    traits:Array.isArray(s.traits)?s.traits:defaults.traits,
    times:Array.isArray(s.times)?s.times:[],
    modes:Array.isArray(s.modes)?s.modes:[],
    favoriteCharacters:Array.isArray(s.favoriteCharacters)?s.favoriteCharacters:[]
   };
 }catch{return structuredClone(defaults)}
}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function esc(s){return String(s??'')}
function imagePath(c){return c.image||`assets/characters/${c.resource}.png`}
function getChar(name){return CHARACTERS.find(c=>c.name===name||c.displayName===name||c.sourceName===name)}
function fallbackLetters(name){return name.replace(/[^A-Za-z0-9가-힣]/g,'').slice(0,2).toUpperCase()||'ER'}

async function loadCharacters(){
 try{
   const r=await fetch(`characters.json?v=${Date.now()}`,{cache:'no-store'});
   if(!r.ok)throw new Error('characters.json');
   CHARACTERS=(await r.json()).map(c=>({
     ...c,
     sourceName:c.sourceName||c.name,
     displayName:KO_NAMES[c.sourceName||c.name]||c.name
   }));
 }catch(e){console.warn(e);CHARACTERS=[]}
 renderSubjectGrid();renderSelectedSubjects();renderSubjectPreview();
}

function makeLocalImage(c, cls=''){
 const img=document.createElement('img');img.alt=c.displayName||c.name;img.className=cls;img.src=imagePath(c);
 return img;
}

function renderSubjectGrid(){
 const root=$('#subjectGrid'); if(!root)return;
 const q=$('#subjectSearch').value.trim().toLowerCase();
 root.innerHTML='';
 const filtered=CHARACTERS.filter(c=>(c.displayName+' '+c.sourceName).toLowerCase().includes(q));
 filtered.forEach(c=>{
   const b=document.createElement('button');b.type='button';
   b.className='subject-card'+(state.favoriteCharacters.includes(c.displayName)?' selected':'');
   const img=makeLocalImage(c);
   const fb=document.createElement('span');fb.className='subject-fallback';fb.textContent=fallbackLetters(c.displayName);
   img.addEventListener('error',()=>b.classList.add('broken'));
   const n=document.createElement('b');n.textContent=c.displayName;
   b.append(img,fb,n); b.addEventListener('click',()=>toggleSubject(c.displayName)); root.appendChild(b);
 });
 $('#subjectCount').textContent=`${state.favoriteCharacters.length} / ${MAX_SUBJECTS}`;
}

function toggleSubject(name){
 const i=state.favoriteCharacters.indexOf(name);
 if(i>=0)state.favoriteCharacters.splice(i,1);
 else if(state.favoriteCharacters.length<MAX_SUBJECTS)state.favoriteCharacters.push(name);
 else return alert(`선호 실험체는 최대 ${MAX_SUBJECTS}명까지 선택할 수 있습니다.`);
 renderSubjectGrid();renderSelectedSubjects();sync();
}
function renderSelectedSubjects(){
 const root=$('#selectedSubjects');root.innerHTML='';
 state.favoriteCharacters.forEach(name=>{
   const c=getChar(name);if(!c)return;
   const chip=document.createElement('span');chip.className='selected-subject-chip';
   const img=makeLocalImage(c);const t=document.createElement('span');t.textContent=name;
   const x=document.createElement('button');x.type='button';x.textContent='×';x.onclick=()=>toggleSubject(name);
   chip.append(img,t,x);root.appendChild(chip);
 });
}
function renderSubjectPreview(){
 const root=$('#favoriteCharactersPreview');root.innerHTML='';
 if(!state.favoriteCharacters.length){root.textContent='미입력';return}
 state.favoriteCharacters.forEach(name=>{
   const c=getChar(name);if(!c)return;
   const item=document.createElement('span');item.className='subject-preview-item';
   const img=makeLocalImage(c);const t=document.createElement('span');t.textContent=name;
   item.append(img,t);root.appendChild(item);
 });
}
function makeRow(value,onInput,onDelete){
 const row=document.createElement('div');row.className='row-item';
 const input=document.createElement('input');input.type='text';input.maxLength=24;input.value=value;input.oninput=e=>onInput(e.target.value);
 const del=document.createElement('button');del.type='button';del.className='icon-btn';del.textContent='×';del.onclick=onDelete;
 row.append(input,del);return row;
}
function renderEditors(){
 const t=$('#tagEditor');t.innerHTML='';
 state.tags.forEach((v,i)=>t.appendChild(makeRow(v,x=>{state.tags[i]=x;sync()},()=>{state.tags.splice(i,1);renderEditors();sync()})));
 const r=$('#traitEditor');r.innerHTML='';
 state.traits.forEach((v,i)=>r.appendChild(makeRow(v,x=>{state.traits[i]=x;sync()},()=>{state.traits.splice(i,1);renderEditors();sync()})));
}
function hydrate(){
 ['nickname','handle','headline','tier','likes','dislikes','bio','accentColor','bgColor','cardColor','textColor'].forEach(id=>$('#'+id).value=state[id]??'');
 $$('#timeEditor input').forEach(x=>x.checked=state.times.includes(x.value));
 $$('#modeEditor input').forEach(x=>x.checked=state.modes.includes(x.value));
 $$('#genderEditor input').forEach(x=>x.checked=x.value===state.gender);
 $$('#discordEditor input').forEach(x=>x.checked=x.value===state.discord);
 if(state.avatar)showAvatar(state.avatar);
}
function showAvatar(src){
 const img=$('#avatarPreview');img.src=src;img.hidden=false;$('#avatarFallback').hidden=true;
}
function setCss(){
 document.documentElement.style.setProperty('--accent',state.accentColor);
 document.documentElement.style.setProperty('--accent2',lighten(state.accentColor,.28));
 document.documentElement.style.setProperty('--page',state.bgColor);
 document.documentElement.style.setProperty('--page-dark',darken(state.bgColor,.48));
 document.documentElement.style.setProperty('--card',state.cardColor);
 document.documentElement.style.setProperty('--text',state.textColor);
 document.querySelector('meta[name="theme-color"]').content=state.bgColor;
}
function sync(){
 state.nickname=$('#nickname').value;state.handle=$('#handle').value;state.headline=$('#headline').value;state.tier=$('#tier').value;
 state.likes=$('#likes').value;state.dislikes=$('#dislikes').value;state.bio=$('#bio').value;
 state.accentColor=$('#accentColor').value;state.bgColor=$('#bgColor').value;state.cardColor=$('#cardColor').value;state.textColor=$('#textColor').value;
 state.gender=$('#genderEditor input:checked')?.value||'비공';
 state.discord=$('#discordEditor input:checked')?.value||'';
 state.times=$$('#timeEditor input:checked').map(x=>x.value);
 state.modes=$$('#modeEditor input:checked').map(x=>x.value);
 setCss();
 $('#nicknamePreview').textContent=state.nickname||'닉네임';
 $('#handlePreview').textContent=state.handle||'@username';
 $('#headlinePreview').textContent=state.headline||'한줄 소개를 입력해보세요.';
 $('#tierPreview').textContent=state.tier||'미입력';
 $('#genderPreview').textContent=state.gender||'비공';
 $('#discordPreview').textContent=state.discord||'미입력';
 $('#likesPreview').textContent=state.likes||'미입력';
 $('#dislikesPreview').textContent=state.dislikes||'미입력';
 $('#bioPreview').textContent=state.bio||'편하게 자기소개를 적어보세요.';
 renderSubjectPreview();
 const tp=$('#tagPreview');tp.innerHTML='';state.tags.filter(Boolean).forEach(v=>{const s=document.createElement('span');s.className='chip';s.textContent='#'+v;tp.appendChild(s)});if(!state.tags.some(Boolean))tp.textContent='미입력';
 const tr=$('#traitPreview');tr.innerHTML='';state.traits.filter(Boolean).forEach(v=>{const li=document.createElement('li');li.textContent=v;tr.appendChild(li)});if(!state.traits.some(Boolean))tr.innerHTML='<li>미입력</li>';
 const times=$('#timePreview');times.innerHTML='';if(!state.times.length)times.textContent='미입력';else state.times.forEach(v=>{const s=document.createElement('span');s.className='time-pill';s.textContent=v;times.appendChild(s)});
 const modes=$('#modePreview');modes.innerHTML='';if(!state.modes.length)modes.textContent='미입력';else state.modes.forEach(v=>{const s=document.createElement('span');s.className='mode-pill';s.textContent=v;modes.appendChild(s)});
 save();
}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('')}
function hexToRgb(hex){const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix(hex,target,amount){const a=hexToRgb(hex),b=hexToRgb(target);return rgbToHex(...a.map((v,i)=>Math.round(v+(b[i]-v)*amount)))}
function lighten(hex,a){return mix(hex,'#ffffff',a)}
function darken(hex,a){return mix(hex,'#000000',a)}
function perceived([r,g,b]){return .2126*r+.7152*g+.0722*b}

function dominantColor(img){
 const c=document.createElement('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});c.width=48;c.height=48;
 ctx.drawImage(img,0,0,48,48);
 const d=ctx.getImageData(0,0,48,48).data, bins=new Map();
 for(let i=0;i<d.length;i+=4){
   if(d[i+3]<200)continue;
   const rgb=[d[i],d[i+1],d[i+2]];
   const lum=perceived(rgb); if(lum<28||lum>238)continue;
   // 32-step color quantization: near-identical pixels count together.
   const q=rgb.map(v=>Math.min(255,Math.round(v/32)*32));
   const sat=Math.max(...q)-Math.min(...q); if(sat<18)continue;
   const key=q.join(',');
   bins.set(key,(bins.get(key)||0)+1);
 }
 let best=null,count=-1;
 for(const [k,v] of bins){if(v>count){count=v;best=k}}
 if(!best)return '#7967ff';
 return rgbToHex(...best.split(',').map(Number));
}
function applyAvatarPalette(img){
 try{
   const main=dominantColor(img);
   // Keep enough saturation/contrast for a page background.
   state.accentColor=main;
   state.bgColor=mix(main, perceived(hexToRgb(main))>150?'#171923':'#ffffff', .30);
   if(perceived(hexToRgb(state.bgColor))>150)state.bgColor=darken(state.bgColor,.48);
   $('#accentColor').value=state.accentColor;$('#bgColor').value=state.bgColor;
   $('#colorStatus').textContent=`대표색 ${main} 감지 → 배경과 포인트 색상에 적용했습니다.`;
   sync();
 }catch(e){console.warn('색상 추출 실패',e)}
}

['nickname','handle','headline','tier','likes','dislikes','bio','accentColor','bgColor','cardColor','textColor'].forEach(id=>$('#'+id).addEventListener('input',sync));
$$('#timeEditor input,#modeEditor input,#genderEditor input,#discordEditor input').forEach(x=>x.addEventListener('change',sync));
$('#subjectSearch').addEventListener('input',renderSubjectGrid);
$('#addTagBtn').onclick=()=>{state.tags.push('새 태그');renderEditors();sync()};
$('#addTraitBtn').onclick=()=>{state.traits.push('새 항목');renderEditors();sync()};
$('#avatarInput').addEventListener('change',e=>{
 const file=e.target.files?.[0];if(!file)return;
 const rd=new FileReader();
 rd.onload=()=>{
   state.avatar=rd.result;showAvatar(state.avatar);save();
   const img=new Image();img.onload=()=>applyAvatarPalette(img);img.src=state.avatar;
 };rd.readAsDataURL(file);
});
$('#resetBtn').onclick=()=>{
 if(!confirm('모든 입력값을 초기화할까요?'))return;
 state=structuredClone(defaults);localStorage.removeItem(STORE);hydrate();renderEditors();renderSelectedSubjects();renderSubjectGrid();
 $('#avatarPreview').hidden=true;$('#avatarFallback').hidden=false;$('#avatarInput').value='';$('#colorStatus').textContent='프로필 이미지를 올리면 가장 많이 쓰인 색을 자동으로 추출합니다.';sync();
};
$('#downloadBtn').onclick=async()=>{
 const btn=$('#downloadBtn'),old=btn.textContent;btn.disabled=true;btn.textContent='이미지 생성 중...';
 try{
   if(document.fonts?.ready)await document.fonts.ready;
   await Promise.all($$('#card img').map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r})));
   const canvas=await html2canvas($('#card'),{scale:2,backgroundColor:null,useCORS:true,allowTaint:false});
   const a=document.createElement('a');a.download=`${(state.nickname||'ER-TCS').replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');a.click();
 }catch(e){console.error(e);alert('이미지 저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.\n\n오류: '+(e?.message||e))}
 finally{btn.disabled=false;btn.textContent=old}
};

hydrate();renderEditors();setCss();sync();loadCharacters();
