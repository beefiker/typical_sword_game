# 픽셀 RPG React/UI 조사 노트

## Pixelact UI

공식 사이트는 Pixelact UI를 “Pixel-Flavored React Component Library”로 소개하며, 검색 결과와 공개 설명 기준으로 shadcn/ui 구조와 픽셀 아트 스타일을 결합한 React 컴포넌트 라이브러리다. 화면상 네비게이션과 로딩 상태 자체도 1비트에 가까운 픽셀 폰트, 점선 프레임, 단색 아이콘, 날카로운 모서리 문법을 사용한다.

현재 프로젝트에 바로 라이브러리를 도입하기보다는, 이미 커스텀 CSS로 구축한 정적 React 앱이므로 다음 원칙을 차용한다. 첫째, 버튼과 카드에는 둥근 모서리보다 직각·계단식 모서리와 다층 box-shadow를 사용한다. 둘째, 픽셀 UI는 단순한 border가 아니라 밝은 상단 하이라이트, 어두운 하단 그림자, 내부 1px 라인, 반복 그리드/노이즈 레이어를 함께 써야 완성도가 올라간다. 셋째, 배경도 단색 패널이 아니라 작은 타일·꽃·돌·그림자를 반복해 밀도를 높여야 한다.

참고 URL: https://pixelactui.com/

## Pixelact UI GitHub 확인

Pixelact UI 저장소 README는 이 프로젝트를 `shadcn/ui` 위에 구축한 pixel-themed React component registry라고 설명한다. 컴포넌트는 shadcn registry 방식으로 개별 설치되며, Tailwind와 CSS variables를 통해 커스터마이징할 수 있다. 현재 앱 역시 shadcn/Tailwind 기반이므로 직접 도입 가능성은 있으나, 기존 스타일과 배포 흐름을 흔들지 않기 위해 이번 수정에서는 라이브러리 설치보다 CSS 기법을 차용하는 편이 안전하다.

핵심 차용점은 “컴포넌트별로 복사·수정 가능한 구조”, “Tailwind와 CSS 변수 기반 테마”, “retro variant를 버튼에 부여하는 방식”이다. 적용 방향은 `.pixel-action`, `.tab-item`, `.shop-button`, `.equipment-card` 계열에 공통 픽셀 프레임 규칙을 더 강하게 걸고, 주인공 카드는 독립적인 고밀도 장면 패널로 재구성하는 것이다.

참고 URL: https://github.com/pixelact-ui/pixelact-ui

## React Pixel UI 확인

React Pixel UI는 `@react-pixel-ui/react` 패키지를 제공하며, `<Pixel>` 래퍼로 기존 CSS를 픽셀 아트처럼 변환하는 접근을 쓴다. 문서에 따르면 Tailwind, inline style, CSS modules를 지원하고, Canvas 없이 동작한다. 변환 대상은 `background`, `background-image`, `border-radius`, `border`, `box-shadow`이며, 내부적으로 계단형 모서리, 픽셀 그라디언트, hard shadow, `clip-path`와 `drop-shadow` 계열을 활용한다.

이번 앱에는 별도 의존성을 추가하지 않고 같은 원리를 CSS로 직접 구현한다. 특히 목표 스크린샷처럼 UI가 싸우지 않게 하려면 골드 HUD의 top 값을 내리고, 헤더 우측 버튼 수를 줄이며, 주인공 카드에는 단일 큰 일러스트 대신 타일 배경·나무 그림자·꽃 패치·돌 가장자리·캐릭터 접지 그림자를 추가해야 한다.

참고 URL: https://react-pixel-ui.vercel.app/

## Phaser + React 템플릿 확인

Phaser 공식 React 템플릿은 Vite 기반 React 앱 안에서 Phaser 게임 인스턴스를 `PhaserGame` 컴포넌트로 브리지하고, `EventBus`로 React UI와 Phaser Scene 사이의 데이터를 주고받는 구조를 제안한다. 즉, 실제 픽셀 RPG의 지도·캐릭터·스프라이트 애니메이션은 Canvas/WebGL 기반 Phaser가 담당하고, React는 HUD·메뉴·상점 같은 UI 레이어를 맡는 패턴이 흔하다.

현재 프로젝트는 정적 React UI 중심 게임이므로 Phaser를 즉시 도입하면 구조 변경이 크다. 이번 수정에서는 Phaser식 사고방식만 차용한다. 배경은 하나의 카드 배경이 아니라 타일 맵처럼 잔디, 꽃, 바위, 절벽, 나무 그림자를 레이어링하고, 캐릭터는 해당 타일 위에 발 그림자와 접지감을 갖도록 배치한다.

참고 URL: https://github.com/phaserjs/template-react

## Pxlkit 확인

Pxlkit은 React용 retro UI kit와 픽셀 아트 SVG 아이콘 라이브러리를 함께 제공한다. README는 40개 이상의 retro UI components, 226개 이상의 pixel art SVG icons, 16×16 문자 그리드 기반 아이콘 구조, 그리고 Three.js/React Three Fiber 기반 voxel 엔진까지 포함한다고 설명한다. UI 관점에서 중요한 점은 픽셀 아이콘을 단순 이미지가 아니라 작은 그리드 시스템으로 구성하고, 버튼·카드·알림 등 컴포넌트를 한 세트의 시각 언어로 맞춘다는 것이다.

현재 프로젝트에는 외부 아이콘 패키지를 추가하지 않고, 같은 원리를 CSS와 기존 JSX 구조에 적용한다. 즉, 주인공 장비 카드는 16×16 아이콘식 단순 캐릭터만 크게 늘리는 방식이 아니라, 프레임·타일 배경·접지 그림자·장비 스탯 바·작은 픽셀 배지까지 하나의 RPG 카드 세트로 다시 구성한다.

참고 URL: https://github.com/joangeldelarosa/pxlkit

## 보강 검색 요약

검색 결과에서 반복적으로 확인된 React 픽셀 UI 접근은 크게 세 가지다. 첫째, Pixelact UI처럼 shadcn/ui 구조를 기반으로 픽셀 아트 스타일을 입힌 React 컴포넌트 라이브러리를 쓰는 방식이다. 둘째, React Pixel UI처럼 Canvas 없이 CSS `clip-path`, PNG식 그라디언트, `drop-shadow`를 활용해 SSR 친화적인 픽셀 UI를 만드는 방식이다. 셋째, RetroUI나 Pxlkit처럼 Tailwind/TypeScript 기반 컴포넌트와 픽셀 아이콘 팩을 함께 제공해 버튼, 카드, 탭, 배지까지 일관된 레트로 UI 시스템을 구성하는 방식이다.

픽셀 RPG 게임 화면 쪽에서는 Phaser가 가장 직접적인 선택지로 확인된다. React 앱 안에 Phaser 캔버스를 넣고 React는 메뉴·HUD·상점 UI를 담당하는 구조가 일반적이다. 다만 이번 프로젝트의 목표는 기존 정적 React 앱을 유지하면서 목표 스크린샷에 가까운 시각 품질을 올리는 것이므로, 대규모 엔진 교체 대신 CSS 기반 픽셀 타일 레이어, 다중 그림자, 프레임, 작은 장식 픽셀, 타일형 배경 패턴을 적용하는 편이 적절하다.

적용 방향은 다음과 같다. 상단 UI는 Pixelact/RetroUI 계열처럼 불필요한 버튼을 줄이고 정보 위계를 명확히 한다. 주인공 카드는 React Pixel UI의 CSS 픽셀 기법처럼 `box-shadow`, `clip-path`, 반복 그라디언트, 절단된 코너, 내부 하이라이트를 사용한다. 배경은 Phaser 타일맵 감각을 CSS 레이어로 흉내 내어 잔디·꽃·돌·절벽·숲 그림자가 촘촘히 쌓인 장면으로 바꾼다.
