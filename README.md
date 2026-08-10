# ER.TCS v5

이터널 리턴 전용 트친소 메이커.

## v5 변경점
- 프로필 사진의 대표색을 브라우저에서 추출해 페이지 배경/포인트색 자동 연동
- 티어 자유 입력
- 실험체 이미지를 `assets/characters/` 로컬 애셋으로 사용
- GitHub Actions가 실험체 목록과 초상화를 매일 자동 갱신
- 카드 오른쪽 위 일련번호 삭제 → 사이트 QR
- LIKE / NOPE / ABOUT ME 등 카드 영문 표기를 한글화
- 8비트 게임 UI 느낌 추가
- CSS/JS `?v=5` 캐시 버스터 적용

## 최초 1회 해야 할 것
1. ZIP의 **폴더 구조를 유지한 채** 저장소 루트에 업로드합니다.
2. GitHub 저장소 → Actions → `실험체 데이터 자동 갱신` → `Run workflow`를 한 번 실행합니다.
3. 만약 push 권한 오류가 뜨면 Settings → Actions → General → Workflow permissions에서
   `Read and write permissions`를 허용한 뒤 다시 실행합니다.
4. 성공하면 `assets/characters/`에 초상화가 자동으로 커밋됩니다.

그 뒤에는 매일 04:20(KST) 새 실험체/이미지를 확인합니다.

데이터 출처:
- 게임 데이터: pypy-vrc/er-gamedata (공식 Eternal Return 개발자 데이터 기반)
- 현재 플레이 가능 실험체/초상화 탐색: DAK.GG 공개 페이지/CDN

게임 및 이미지의 권리는 각 원저작권자에게 있습니다.
