# React 픽셀 UI·몬스터 픽셀 아트 조사 기록

Pixelact UI는 shadcn/ui 기반의 픽셀 아트풍 React 컴포넌트 라이브러리로, 버튼·입력·카드·아코디언·커맨드 등 일반 앱 UI를 픽셀풍 테두리와 레트로 타이포그래피로 표현한다. 현재 프로젝트도 React, Tailwind, shadcn/ui 구조이므로 카드와 버튼의 픽셀 테두리, 계단식 그림자, 고대비 레이어를 차용하기 좋다.

RetroUI는 TypeScript와 Tailwind를 지원하는 픽셀풍 React 컴포넌트 모음으로, 카드·버튼·말풍선·진행바 등 전투 카드에 직접 적용 가능한 패턴을 제공한다. 특히 굵은 2~4px 외곽선, 사각 단위 그림자, 밝은 종이색 배경, 말풍선형 설명 UI가 전투 로그와 강화 판단 메시지에 적합하다.

react-pixel-motion은 React에서 스프라이트 시트 이미지를 `PixelMotion` 컴포넌트로 렌더링하는 경량 라이브러리다. `width`, `height`, `frameCount`, `fps`, `scale`, `direction`, `imageRendering` 속성으로 픽셀 스프라이트 애니메이션을 제어한다. 몬스터·주인공을 작은 SVG/PNG 스프라이트 시트로 만들고 `image-rendering: pixelated`를 유지하는 방식에 적합하다.

몬스터 레퍼런스는 고블린, 스켈레톤, 좀비, 뱀파이어, 오크, 귀신, 늑대, 슬라임의 실루엣 차이를 분명히 두는 방향으로 정리했다. 고블린은 녹색 피부와 뾰족귀·작은 단검, 스켈레톤은 뼈대와 검은 관절 여백, 좀비는 초록 피부와 앞으로 뻗은 팔, 뱀파이어는 검은 머리·창백한 얼굴·붉은 날개망토, 오크는 큰 체구·엄니·도끼, 귀신은 반투명 흰 형체와 떠 있는 꼬리, 늑대는 낮은 네발 실루엣과 붉은 눈, 슬라임은 둥근 젤 형태와 하이라이트가 핵심이다.

적용 결정: 실제 패키지는 스프라이트 렌더링에 특화된 `@ga1az/react-pixel-motion`을 사용하고, 카드·버튼·메시지 박스는 Pixelact UI와 RetroUI의 픽셀 테두리 철학을 CSS로 맞춘다. 외부 저작권 이미지를 직접 사용하지 않고, 첨부 이미지와 검색 레퍼런스의 형태적 특징만 코드 기반 SVG/픽셀 셀로 재구성한다.

## References

[1]: https://pixelactui.com/ "Pixelact UI - Pixel art flavored React Component Library"
[2]: https://retroui.io/components "Retro UI - Pixelated React Components"
[3]: https://github.com/ga1az/react-pixel-motion "ga1az/react-pixel-motion"
