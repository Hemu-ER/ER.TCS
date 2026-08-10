#!/usr/bin/env python3
import json, re, pathlib, requests, sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
ASSET=ROOT/"assets"/"characters"
ASSET.mkdir(parents=True,exist_ok=True)

GAME_DATA="https://raw.githubusercontent.com/pypy-vrc/er-gamedata/refs/heads/master/data/Character.json"
DAK_PAGE="https://dak.gg/er/characters?hl=en"

sess=requests.Session()
sess.headers.update({"User-Agent":"ER.TCS asset sync/1.0"})

chars=sess.get(GAME_DATA,timeout=30).json()
by_name={c["name"]:c for c in chars if c.get("name") and c.get("resource")}

page=sess.get(DAK_PAGE,timeout=30)
page.raise_for_status()
html=page.text

# Current playable roster from character links.
names=[]
for raw in re.findall(r'/er/characters/([^"\'?#/]+)',html):
    name=requests.utils.unquote(raw).replace("+"," ")
    if name in by_name and name not in names:
        names.append(name)

# Current DAK game-asset version.
versions=re.findall(r'/game-assets/([0-9]+(?:\.[0-9]+)+)/CharCommunity_',html)
version=versions[0] if versions else None
if not version:
    # fallback: keep known current branch; edit only if DAK changes its HTML structure
    version="12.0.0"

# If parsing failed, keep all current game-data characters rather than deleting the site roster.
if len(names)<50:
    names=[c["name"] for c in chars if c.get("name") and c.get("resource")]

output=[]
ok=0
for name in names:
    c=by_name[name]
    resource=c["resource"]
    dest=ASSET/f"{resource}.png"
    url=f"https://cdn.dak.gg/assets/er/game-assets/{version}/CharCommunity_{resource}_S000.png"
    try:
        r=sess.get(url,timeout=25)
        if r.ok and r.headers.get("content-type","").startswith("image/") and len(r.content)>1000:
            dest.write_bytes(r.content);ok+=1
    except Exception as e:
        print("image fail",name,e,file=sys.stderr)
    output.append({"name":name,"resource":resource,"image":f"assets/characters/{resource}.png"})

output.sort(key=lambda x:x["name"].lower())
(ROOT/"characters.json").write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"characters={len(output)} images_downloaded={ok} asset_version={version}")
