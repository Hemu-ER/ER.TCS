const $=s=>document.querySelector(s);const stateKey='trichinso-maker-v2';
const defaults={nickname:'',handle:'',headline:'',tier:'',favoriteCharacters:[],gender:'비공',discord:'',modes:[],likes:'',dislikes:'',bio:'',cardTitle:'이터널 리턴 트친소',accentColor:'#6d5dfc',bgColor:'#eef0f5',cardColor:'#fffdf8',textColor:'#202330',tags:['이터널 리턴','게임','일상'],traits:['즐겜 위주','멘션 좋아함'],times:[],avatar:''};

const CHARACTER_DATA=[{"name": "Abigail", "slug": "Abigail"}, {"name": "Adela", "slug": "Adela"}, {"name": "Adina", "slug": "Adina"}, {"name": "Adriana", "slug": "Adriana"}, {"name": "Aiden", "slug": "Aiden"}, {"name": "Alex", "slug": "Alex"}, {"name": "Alonso", "slug": "Alonso"}, {"name": "Arda", "slug": "Arda"}, {"name": "Aya", "slug": "Aya"}, {"name": "Barbara", "slug": "Barbara"}, {"name": "Bernice", "slug": "Bernice"}, {"name": "Bianca", "slug": "Bianca"}, {"name": "Bihyung", "slug": "Bihyung"}, {"name": "Blair", "slug": "Blair"}, {"name": "Camilo", "slug": "Camilo"}, {"name": "Cathy", "slug": "Cathy"}, {"name": "Celine", "slug": "Celine"}, {"name": "Charlotte", "slug": "Charlotte"}, {"name": "Chiara", "slug": "Chiara"}, {"name": "Chloe", "slug": "Chloe"}, {"name": "Coraline", "slug": "Coraline"}, {"name": "Craver", "slug": "Craver"}, {"name": "Daniel", "slug": "Daniel"}, {"name": "Darko", "slug": "Darko"}, {"name": "Debi & Marlene", "slug": "DebiMarlene"}, {"name": "Echion", "slug": "Echion"}, {"name": "Elena", "slug": "Elena"}, {"name": "Eleven", "slug": "Eleven"}, {"name": "Emma", "slug": "Emma"}, {"name": "Estelle", "slug": "Estelle"}, {"name": "Eva", "slug": "Eva"}, {"name": "Felix", "slug": "Felix"}, {"name": "Fenrir", "slug": "Fenrir"}, {"name": "Fiora", "slug": "Fiora"}, {"name": "Garnet", "slug": "Garnet"}, {"name": "Hart", "slug": "Hart"}, {"name": "Haze", "slug": "Haze"}, {"name": "Henry", "slug": "Henry"}, {"name": "Hisui", "slug": "Hisui"}, {"name": "Hyejin", "slug": "Hyejin"}, {"name": "Hyunwoo", "slug": "Hyunwoo"}, {"name": "Irem", "slug": "Irem"}, {"name": "Isaac", "slug": "Isaac"}, {"name": "Isol", "slug": "Isol"}, {"name": "Istvan", "slug": "Istvan"}, {"name": "Jackie", "slug": "Jackie"}, {"name": "Jan", "slug": "Jan"}, {"name": "Jenny", "slug": "Jenny"}, {"name": "Johann", "slug": "Johann"}, {"name": "Justyna", "slug": "Justyna"}, {"name": "Karla", "slug": "Karla"}, {"name": "Katja", "slug": "Katja"}, {"name": "Kenneth", "slug": "Kenneth"}, {"name": "Laura", "slug": "Laura"}, {"name": "Leni", "slug": "Leni"}, {"name": "Lenore", "slug": "Lenore"}, {"name": "Lenox", "slug": "Lenox"}, {"name": "Leon", "slug": "Leon"}, {"name": "Li Dailin", "slug": "LiDailin"}, {"name": "Luke", "slug": "Luke"}, {"name": "Lucia", "slug": "Lucia"}, {"name": "Ly Anh", "slug": "LyAnh"}, {"name": "Magnus", "slug": "Magnus"}, {"name": "Mai", "slug": "Mai"}, {"name": "Markus", "slug": "Markus"}, {"name": "Martina", "slug": "Martina"}, {"name": "Mirka", "slug": "Mirka"}, {"name": "Nadine", "slug": "Nadine"}, {"name": "Nathapon", "slug": "Nathapon"}, {"name": "NiaH", "slug": "NiaH"}, {"name": "Nicky", "slug": "Nicky"}, {"name": "Piolo", "slug": "Piolo"}, {"name": "Priya", "slug": "Priya"}, {"name": "Rio", "slug": "Rio"}, {"name": "Rozzi", "slug": "Rozzi"}, {"name": "Shoichi", "slug": "Shoichi"}, {"name": "Silvia", "slug": "Silvia"}, {"name": "Sissela", "slug": "Sissela"}, {"name": "Sua", "slug": "Sua"}, {"name": "Tazia", "slug": "Tazia"}, {"name": "Theodore", "slug": "Theodore"}, {"name": "Tia", "slug": "Tia"}, {"name": "Tsubame", "slug": "Tsubame"}, {"name": "Vanya", "slug": "Vanya"}, {"name": "William", "slug": "William"}, {"name": "Xiukai", "slug": "Xiukai"}, {"name": "Xuelin", "slug": "Xuelin"}, {"name": "Yuki", "slug": "Yuki"}, {"name": "Yumin", "slug": "Yumin"}, {"name": "Zahir", "slug": "Zahir"}];
const TIER_DATA=["아이언", "브론즈", "실버", "골드", "플래티넘", "다이아몬드", "미스릴", "데미갓", "이터니티"];
const MAX_SUBJECTS=5;
function charImageUrl(c){return `https://cdn.dak.gg/assets/er/game-assets/12.0.0/CharCommunity_${c.slug}_S000.png`}
function getCharacter(name){return CHARACTER_DATA.find(c=>c.name===name)}
function renderTierPicker(){
  const root=$('#tierEditor');root.innerHTML='';
  TIER_DATA.forEach(t=>{
    const b=document.createElement('button');b.type='button';b.className='tier-choice'+(state.tier===t?' selected':'');b.dataset.tier=t;
    b.innerHTML=`<i class="tier-emblem"></i><span>${t}</span>`;
    b.addEventListener('click',()=>{state.tier=state.tier===t?'':t;renderTierPicker();sync()});
    root.appendChild(b);
  });
}
function renderTierPreview(){
  const root=$('#tierPreview');root.innerHTML='';
  if(!state.tier){root.textContent='미입력';return}
  const s=document.createElement('span');s.className='rank-preview';s.textContent=state.tier;root.appendChild(s);
}
function setBroken(el){el.classList.add('broken')}
function makeSubjectImg(c){
  const img=document.createElement('img');img.alt=c.name;img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';img.src=charImageUrl(c);
  return img;
}
function renderSubjectGrid(){
  const q=($('#subjectSearch')?.value||'').trim().toLowerCase();
  const root=$('#subjectGrid');root.innerHTML='';
  CHARACTER_DATA.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>{
    const b=document.createElement('button');b.type='button';b.className='subject-card'+(state.favoriteCharacters.includes(c.name)?' selected':'');
    const img=makeSubjectImg(c);img.addEventListener('error',()=>setBroken(b));
    const fb=document.createElement('span');fb.className='subject-fallback';fb.textContent=c.name.slice(0,2).toUpperCase();
    const name=document.createElement('b');name.textContent=c.name;
    b.append(img,fb,name);
    b.addEventListener('click',()=>toggleSubject(c.name));
    root.appendChild(b);
  });
  $('#subjectCount').textContent=`${state.favoriteCharacters.length} / ${MAX_SUBJECTS}`;
}
function toggleSubject(name){
  const i=state.favoriteCharacters.indexOf(name);
  if(i>=0)state.favoriteCharacters.splice(i,1);
  else if(state.favoriteCharacters.length<MAX_SUBJECTS)state.favoriteCharacters.push(name);
  else{alert(`선호 실험체는 최대 ${MAX_SUBJECTS}명까지 선택할 수 있습니다.`);return}
  renderSubjectGrid();renderSelectedSubjects();sync();
}
function renderSelectedSubjects(){
  const root=$('#selectedSubjects');root.innerHTML='';
  state.favoriteCharacters.forEach(name=>{
    const c=getCharacter(name);if(!c)return;
    const chip=document.createElement('span');chip.className='selected-subject-chip';
    const img=makeSubjectImg(c);const txt=document.createElement('span');txt.textContent=name;
    const x=document.createElement('button');x.type='button';x.textContent='×';x.addEventListener('click',()=>toggleSubject(name));
    chip.append(img,txt,x);root.appendChild(chip);
  });
}
function renderSubjectPreview(){
  const root=$('#favoriteCharactersPreview');root.innerHTML='';
  if(!state.favoriteCharacters.length){root.textContent='미입력';return}
  state.favoriteCharacters.forEach(name=>{
    const c=getCharacter(name);if(!c)return;
    const item=document.createElement('span');item.className='subject-preview-item';
    const img=makeSubjectImg(c);const lab=document.createElement('span');lab.textContent=name;
    item.append(img,lab);root.appendChild(item);
  });
}

let state=loadState();
function loadState(){try{const saved=JSON.parse(localStorage.getItem(stateKey)||'{}');return{...defaults,...saved,tags:saved.tags||defaults.tags,traits:saved.traits||defaults.traits,times:saved.times||[],modes:saved.modes||[],favoriteCharacters:Array.isArray(saved.favoriteCharacters)?saved.favoriteCharacters:(saved.favoriteCharacters?[saved.favoriteCharacters]:[])}}catch{return structuredClone(defaults)}}
function saveState(){localStorage.setItem(stateKey,JSON.stringify(state))}
function renderEditors(){const t=$('#tagEditor');t.innerHTML='';state.tags.forEach((v,i)=>t.appendChild(makeTextRow(v,x=>{state.tags[i]=x;sync()},()=>{state.tags.splice(i,1);renderEditors();sync()})));const r=$('#traitEditor');r.innerHTML='';state.traits.forEach((v,i)=>r.appendChild(makeTextRow(v,x=>{state.traits[i]=x;sync()},()=>{state.traits.splice(i,1);renderEditors();sync()})))}
function makeTextRow(value,onInput,onDelete){const row=document.createElement('div');row.className='row-item';const input=document.createElement('input');input.type='text';input.value=value;input.maxLength=24;input.addEventListener('input',e=>onInput(e.target.value));const del=document.createElement('button');del.type='button';del.className='icon-btn';del.textContent='×';del.title='삭제';del.addEventListener('click',onDelete);row.append(input,del);return row}
function hydrateInputs(){['nickname','handle','headline','likes','dislikes','bio','cardTitle','accentColor','bgColor','cardColor','textColor'].forEach(id=>{const el=$('#'+id);if(el)el.value=state[id]??''});document.querySelectorAll('#timeEditor input').forEach(cb=>cb.checked=state.times.includes(cb.value));document.querySelectorAll('#modeEditor input').forEach(cb=>cb.checked=state.modes.includes(cb.value));document.querySelectorAll('#genderEditor input').forEach(r=>r.checked=r.value===state.gender);document.querySelectorAll('#discordEditor input').forEach(r=>r.checked=r.value===state.discord);if(state.avatar)showAvatar(state.avatar);renderTierPicker();renderSubjectGrid();renderSelectedSubjects()}
function serialFromText(text){let n=0;for(const c of(text||'TCS'))n=(n*31+c.charCodeAt(0))%10000;return String(n).padStart(4,'0')}
function sync(){state.nickname=$('#nickname').value;state.handle=$('#handle').value;state.headline=$('#headline').value;state.gender=document.querySelector('#genderEditor input:checked')?.value||'비공';state.discord=document.querySelector('#discordEditor input:checked')?.value||'';state.modes=[...document.querySelectorAll('#modeEditor input:checked')].map(x=>x.value);state.likes=$('#likes').value;state.dislikes=$('#dislikes').value;state.bio=$('#bio').value;state.cardTitle=$('#cardTitle').value;state.accentColor=$('#accentColor').value;state.bgColor=$('#bgColor').value;state.cardColor=$('#cardColor').value;state.textColor=$('#textColor').value;state.times=[...document.querySelectorAll('#timeEditor input:checked')].map(x=>x.value);
document.documentElement.style.setProperty('--accent',state.accentColor);document.documentElement.style.setProperty('--page',state.bgColor);document.documentElement.style.setProperty('--card',state.cardColor);document.documentElement.style.setProperty('--text',state.textColor);
$('#nicknamePreview').textContent=state.nickname||'닉네임';$('#handlePreview').textContent=state.handle||'@username';$('#headlinePreview').textContent=state.headline||'한줄 소개를 입력해보세요.';renderTierPreview();renderSubjectPreview();$('#genderPreview').textContent=state.gender||'비공';$('#discordPreview').textContent=state.discord||'미입력';const mp=$('#modePreview');mp.innerHTML='';if(!state.modes.length)mp.textContent='미입력';else state.modes.forEach(m=>{const s=document.createElement('span');s.className='mode-pill';s.textContent=m;mp.appendChild(s)});$('#cardTitlePreview').textContent=state.cardTitle||'트친소';$('#likesPreview').textContent=state.likes||'미입력';$('#dislikesPreview').textContent=state.dislikes||'미입력';$('#bioPreview').textContent=state.bio||'편하게 자기소개를 적어보세요.';$('#serialPreview').textContent=serialFromText(state.handle||state.nickname);
$('#tagPreview').innerHTML='';state.tags.filter(Boolean).forEach(tag=>{const s=document.createElement('span');s.className='chip';s.textContent='#'+tag;$('#tagPreview').appendChild(s)});if(!state.tags.some(Boolean))$('#tagPreview').textContent='미입력';
$('#traitPreview').innerHTML='';state.traits.filter(Boolean).forEach(trait=>{const li=document.createElement('li');li.textContent=trait;$('#traitPreview').appendChild(li)});if(!state.traits.some(Boolean))$('#traitPreview').innerHTML='<li>미입력</li>';
const time=$('#timePreview');time.innerHTML='';if(!state.times.length)time.textContent='미입력';else state.times.forEach(t=>{const s=document.createElement('span');s.className='time-pill';s.textContent=t;time.appendChild(s)});saveState()}
function showAvatar(src){const img=$('#avatarPreview');img.src=src;img.hidden=false;$('#avatarFallback').hidden=true}
['nickname','handle','headline','likes','dislikes','bio','cardTitle','accentColor','bgColor','cardColor','textColor'].forEach(id=>$('#'+id).addEventListener('input',sync));document.querySelectorAll('#timeEditor input').forEach(cb=>cb.addEventListener('change',sync));document.querySelectorAll('#modeEditor input,#genderEditor input,#discordEditor input').forEach(el=>el.addEventListener('change',sync));
$('#subjectSearch').addEventListener('input',renderSubjectGrid);
$('#addTagBtn').addEventListener('click',()=>{state.tags.push('새 태그');renderEditors();sync()});$('#addTraitBtn').addEventListener('click',()=>{state.traits.push('새 항목');renderEditors();sync()});
$('#avatarInput').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{state.avatar=reader.result;showAvatar(state.avatar);saveState()};reader.readAsDataURL(file)});
$('#resetBtn').addEventListener('click',()=>{if(!confirm('모든 입력값을 초기화할까요?'))return;state=structuredClone(defaults);localStorage.removeItem(stateKey);hydrateInputs();renderEditors();$('#avatarPreview').hidden=true;$('#avatarFallback').hidden=false;$('#avatarInput').value='';sync()});
$('#downloadBtn').addEventListener('click',async()=>{const btn=$('#downloadBtn'),old=btn.textContent;btn.disabled=true;btn.textContent='이미지 만드는 중...';try{if(document.fonts?.ready)await document.fonts.ready;const canvas=await html2canvas($('#card'),{scale:2,backgroundColor:null,useCORS:true,allowTaint:false});const link=document.createElement('a');const safe=(state.nickname||'trichinso').replace(/[\\/:*?"<>|]/g,'_');link.download=`${safe}-card.png`;link.href=canvas.toDataURL('image/png');link.click()}catch(err){console.error(err);alert('이미지 저장에 실패했습니다.')}finally{btn.disabled=false;btn.textContent=old}});
hydrateInputs();renderEditors();renderTierPicker();renderSubjectGrid();renderSelectedSubjects();sync();