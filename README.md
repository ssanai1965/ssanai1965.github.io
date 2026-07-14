# 나만의 기록 사이트 — 시작 가이드

## 1. GitHub 계정 만들기
https://github.com 에서 무료로 가입합니다.

## 2. 저장소(repository) 만들기
- GitHub 로그인 후 오른쪽 위 `+` → `New repository`
- Repository name을 **반드시** `아이디.github.io` 형식으로 입력
  (예: 아이디가 minji123이면 → minji123.github.io)
- Public으로 설정 → `Create repository`

## 3. 이 파일들 업로드하기
- 방금 만든 저장소 페이지에서 `Add file` → `Upload files` 클릭
- 이 폴더 안의 모든 파일과 폴더를 그대로 드래그해서 올리기
  (`_config.yml`, `index.md`, `diary.md` 등 전부 + `_posts` 폴더 + `assets` 폴더)
- 맨 아래 `Commit changes` 클릭

## 4. GitHub Pages 켜기
- 저장소 상단 `Settings` → 왼쪽 메뉴 `Pages`
- `Build and deployment` → Source를 `Deploy from a branch`로 설정
- Branch를 `main` (또는 `master`), 폴더는 `/ (root)` 선택 후 `Save`
- 1~2분 후 `https://아이디.github.io` 주소로 접속하면 사이트가 보입니다

## 5. 새 글 쓰는 법
`_posts` 폴더 안에 파일을 하나 추가하면 됩니다.

- 파일명 형식: `연도-월-일-제목.md` (예: `2026-07-15-오늘의일기.md`)
- 파일 맨 위에 아래 형식을 반드시 넣어주세요:

```
---
layout: post
title: "글 제목"
categories: diary
---

여기부터 본문 내용을 자유롭게 적으면 됩니다.
```

- `categories:` 부분에 아래 5개 중 하나를 넣으면 해당 탭에 자동으로 나타납니다:
  `diary`(일기) / `hobby`(취미) / `info`(정보) / `study`(학습) / `writing`(글쓰기)
- 새로 쓴 글은 홈 화면의 "최근 업로드"와 상단의 "새 업로드" 탭에 날짜순으로 자동으로 나타납니다. 따로 손댈 필요 없어요.

## 6-1. 카드에 썸네일(대표 이미지) 넣는 법
글 맨 위 설정에 `image:` 한 줄만 추가하면 목록 화면 카드에 사진이 뜹니다:
```
---
layout: post
title: "글 제목"
categories: diary
image: /assets/images/파일명.jpg
---
```
`image:`를 안 넣으면 카테고리 색상의 기본 박스가 대신 표시됩니다.

## 6. 사진 넣는 법
- `assets/images` 폴더에 사진 파일 업로드
- 글 본문에 아래처럼 작성:
```
![사진 설명](/assets/images/파일명.jpg)
```

## 7. 영상 넣는 법
GitHub Pages는 큰 동영상 파일을 직접 올리기엔 적합하지 않습니다.
유튜브에 비공개/일부공개로 올린 뒤, 글에 링크를 걸거나 아래처럼 삽입하는 방식을 권장합니다:
```
<iframe width="560" height="315" src="https://www.youtube.com/embed/영상ID"></iframe>
```

## 8. 사이트 제목/소개 바꾸기
`_config.yml` 파일의 `title:`과 `description:` 부분을 원하는 내용으로 수정하면 됩니다.

---
막히는 부분이 생기면 언제든 다시 물어보세요.

## 9. 관리자 모드 (Netlify + Decap CMS)
사이트 안에서 로그인해서 글을 쓰고 싶다면 `/admin` 설정이 이미 포함되어 있습니다.
자세한 연결 방법은 채팅에서 안내받은 단계를 따라주세요 (Netlify 가입 → 저장소 연결 → Identity/Git Gateway 켜기 → 초대 수락).
