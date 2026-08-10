# 트친소 메이커

GitHub Pages에 그대로 배포할 수 있는 정적 트친소 카드 생성기입니다.

## 기능
- 닉네임 / 아이디 / 한줄소개 / 프로필 이미지
- 관심사 태그 자유 추가/삭제
- 활동 성향 자유 추가/삭제
- 접속 시간 체크
- 좋아요 / 싫어요 / 자유 소개
- 포인트, 배경, 카드, 글자 색상 변경
- 입력값 localStorage 저장
- html2canvas를 이용한 PNG 저장
- 모바일 대응

## GitHub Pages 배포
1. 새 GitHub 저장소를 만듭니다.
2. `index.html`, `style.css`, `script.js`를 저장소 루트에 업로드합니다.
3. 저장소 Settings → Pages로 이동합니다.
4. Build and deployment에서 `Deploy from a branch`를 선택합니다.
5. Branch를 `main`, 폴더를 `/ (root)`로 지정합니다.
6. 저장하면 잠시 뒤 `https://사용자명.github.io/저장소명/` 주소로 접속할 수 있습니다.

## 참고
이미지 저장 기능은 CDN의 html2canvas를 사용합니다.
