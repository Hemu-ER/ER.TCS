const $ = (s) => document.querySelector(s);
const stateKey = 'trichinso-maker-v1';

const defaults = {
  nickname: '', handle: '', headline: '', likes: '', dislikes: '', bio: '', cardTitle: '트친소',
  accentColor: '#7c5cff', bgColor: '#f7f7fb', cardColor: '#ffffff', textColor: '#1e1e26',
  tags: ['게임', '일상', '창작'],
  traits: ['마음 위주', '멘션 좋아함', 'DM 가능'],
  times: [], avatar: ''
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(stateKey) || '{}');
    return { ...defaults, ...saved, tags: saved.tags || defaults.tags, traits: saved.traits || defaults.traits, times: saved.times || [] };
  } catch { return structuredClone(defaults); }
}

function saveState() { localStorage.setItem(stateKey, JSON.stringify(state)); }

function renderEditors() {
  const tagEditor = $('#tagEditor');
  tagEditor.innerHTML = '';
  state.tags.forEach((tag, i) => tagEditor.appendChild(makeTextRow(tag, v => { state.tags[i]=v; sync(); }, () => { state.tags.splice(i,1); renderEditors(); sync(); })));

  const traitEditor = $('#traitEditor');
  traitEditor.innerHTML = '';
  state.traits.forEach((trait, i) => traitEditor.appendChild(makeTextRow(trait, v => { state.traits[i]=v; sync(); }, () => { state.traits.splice(i,1); renderEditors(); sync(); })));
}

function makeTextRow(value, onInput, onDelete) {
  const row = document.createElement('div'); row.className = 'row-item';
  const input = document.createElement('input'); input.type = 'text'; input.value = value; input.maxLength = 24;
  input.addEventListener('input', e => onInput(e.target.value));
  const del = document.createElement('button'); del.type='button'; del.className='icon-btn'; del.textContent='×'; del.title='삭제'; del.addEventListener('click', onDelete);
  row.append(input, del); return row;
}

function hydrateInputs() {
  ['nickname','handle','headline','likes','dislikes','bio','cardTitle','accentColor','bgColor','cardColor','textColor'].forEach(id => {
    const el = $('#'+id); if (el) el.value = state[id] ?? '';
  });
  document.querySelectorAll('#timeEditor input').forEach(cb => cb.checked = state.times.includes(cb.value));
  if (state.avatar) showAvatar(state.avatar);
}

function sync() {
  state.nickname = $('#nickname').value;
  state.handle = $('#handle').value;
  state.headline = $('#headline').value;
  state.likes = $('#likes').value;
  state.dislikes = $('#dislikes').value;
  state.bio = $('#bio').value;
  state.cardTitle = $('#cardTitle').value;
  state.accentColor = $('#accentColor').value;
  state.bgColor = $('#bgColor').value;
  state.cardColor = $('#cardColor').value;
  state.textColor = $('#textColor').value;
  state.times = [...document.querySelectorAll('#timeEditor input:checked')].map(x=>x.value);

  document.documentElement.style.setProperty('--accent', state.accentColor);
  document.documentElement.style.setProperty('--page', state.bgColor);
  document.documentElement.style.setProperty('--card', state.cardColor);
  document.documentElement.style.setProperty('--text', state.textColor);

  $('#nicknamePreview').textContent = state.nickname || '닉네임';
  $('#handlePreview').textContent = state.handle || '@username';
  $('#headlinePreview').textContent = state.headline || '한줄 소개를 입력해보세요.';
  $('#cardTitlePreview').textContent = state.cardTitle || '트친소';
  $('#likesPreview').textContent = state.likes || '미입력';
  $('#dislikesPreview').textContent = state.dislikes || '미입력';
  $('#bioPreview').textContent = state.bio || '편하게 자기소개를 적어보세요.';

  $('#tagPreview').innerHTML = '';
  state.tags.filter(Boolean).forEach(tag => {
    const span = document.createElement('span'); span.className='chip'; span.textContent = '#'+tag; $('#tagPreview').appendChild(span);
  });
  if (!state.tags.some(Boolean)) $('#tagPreview').textContent = '미입력';

  $('#traitPreview').innerHTML = '';
  state.traits.filter(Boolean).forEach(trait => {
    const li = document.createElement('li'); li.textContent = trait; $('#traitPreview').appendChild(li);
  });
  if (!state.traits.some(Boolean)) $('#traitPreview').innerHTML = '<li>미입력</li>';

  const time = $('#timePreview'); time.innerHTML='';
  if (!state.times.length) time.textContent = '미입력';
  else state.times.forEach(t => { const s=document.createElement('span'); s.className='time-pill'; s.textContent=t; time.appendChild(s); });

  saveState();
}

function showAvatar(src) {
  const img = $('#avatarPreview'); img.src = src; img.hidden = false; $('#avatarFallback').hidden = true;
}

['nickname','handle','headline','likes','dislikes','bio','cardTitle','accentColor','bgColor','cardColor','textColor'].forEach(id => $('#'+id).addEventListener('input', sync));
document.querySelectorAll('#timeEditor input').forEach(cb => cb.addEventListener('change', sync));

$('#addTagBtn').addEventListener('click', () => { state.tags.push('새 태그'); renderEditors(); sync(); });
$('#addTraitBtn').addEventListener('click', () => { state.traits.push('새 항목'); renderEditors(); sync(); });

$('#avatarInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { state.avatar = reader.result; showAvatar(state.avatar); saveState(); };
  reader.readAsDataURL(file);
});

$('#resetBtn').addEventListener('click', () => {
  if (!confirm('모든 입력값을 초기화할까요?')) return;
  state = structuredClone(defaults); localStorage.removeItem(stateKey); hydrateInputs(); renderEditors();
  $('#avatarPreview').hidden = true; $('#avatarFallback').hidden = false; $('#avatarInput').value=''; sync();
});

$('#downloadBtn').addEventListener('click', async () => {
  const btn = $('#downloadBtn'); const old = btn.textContent; btn.disabled = true; btn.textContent = '이미지 만드는 중...';
  try {
    const canvas = await html2canvas($('#card'), { scale: 2, backgroundColor: null, useCORS: true });
    const link = document.createElement('a');
    const safe = (state.nickname || 'trichinso').replace(/[\\/:*?"<>|]/g,'_');
    link.download = `${safe}-card.png`; link.href = canvas.toDataURL('image/png'); link.click();
  } catch (err) {
    console.error(err); alert('이미지 저장에 실패했습니다.');
  } finally { btn.disabled = false; btn.textContent = old; }
});

hydrateInputs();
renderEditors();
sync();
