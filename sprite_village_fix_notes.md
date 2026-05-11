# 캐릭터 색상·용사 검·픽셀 마을 배경 수정 노트

## 현재 렌더링 진단

브라우저 확인 결과, 주인공과 몬스터가 완전히 흰색으로 변한 것은 CSS `filter: brightness()` 전역 적용이 아니라 PixelMotion 스프라이트 프레임 안의 픽셀 렌더링 방식과 스프라이트 데이터 대비가 낮아져, 작은 크기에서 하이라이트가 과도하게 두드러지는 문제로 보인다. computed style 기준으로 `.pixel-adventurer`, `.pixel-monster`, `.hero-sprite-frame`에는 `mix-blend-mode: normal`, `opacity: 1`, 필터는 그림자 중심으로 적용되어 있었다. 따라서 색상 정상화는 SVG 픽셀 데이터의 색상 팔레트를 더 진하고 낮은 명도로 재설계하고, 캐릭터 프레임 배경의 흰색 스캔라인/하이라이트를 줄이는 방식이 적절하다.

## 용사 검 형태 진단

현재 히어로 스프라이트의 검은 여러 픽셀 좌표가 대각선으로 배치되어 작은 화면에서 휘어진 칼처럼 보인다. 첨부 용사 레퍼런스처럼 손잡이에서 아래쪽으로 거의 직선에 가까운 은색 검신과 금색 손잡이를 구성하도록, 검 픽셀을 수직 축 기준으로 정렬해야 한다.

## 픽셀 마을 레퍼런스

이미지 검색에서 확인한 주요 방향은 다음과 같다. CraftPix 계열 마을 타일셋은 파란/회색 지붕, 목재 벽, 울타리, 배럴, 나무 상자, 작은 소품을 오브젝트 시트처럼 분해해 제공한다. Cainos의 Top Down Pixel Art Village는 잔디 타일, 굽은 흙길, 목조 주택, 나무와 표지판, 돌담을 쿼터뷰/탑다운 혼합 구도로 배치한다. Sanctumpixel의 Village Top Down Tileset은 강, 다리, 밭, 돌길, 숲 가장자리로 마을 경계를 구성한다. 따라서 현재 히어로 배경은 큰 산과 큰 도로 중심에서 벗어나, 작은 지붕 집 2~3채, 울타리, 표지판, 배럴, 꽃, 밭, 돌길 타일, 나무 군집을 픽셀 UI 키트처럼 레이어링하는 방향으로 수정한다.

## 공식 페이지 확인 결과

CraftPix의 무료 Village Pixel Tileset 설명은 집, vendor stalls, barrels, boxes, carts, lamp posts, animated doors, security fences, level tiles를 포함한다고 밝힌다. 이 정보는 히어로 배경을 단순 산/도로가 아니라 **마을 오브젝트 키트**처럼 보이게 만드는 근거로 삼는다.[1]

Cainos 문서 홈에는 `Pixel Art Top Down - Village`, `Pixel Art Top Down - Basic`, `Customizable Pixel Character`, `Pixel Art Monster - Dungeon` 같은 에셋 카테고리가 함께 표시된다. 이는 배경 타일, 캐릭터, 몬스터를 같은 픽셀 밀도와 시점으로 맞추는 방식이 자연스럽다는 점을 뒷받침한다.[2]

## References

[1]: https://craftpix.net/freebies/free-village-pixel-tileset-for-top-down-defense/ "Free Village Pixel Tileset for Top-Down Defense - CraftPix.net"
[2]: https://docs.cainos.net/ "HOME | Cainos Asset Documentation"

## 2026-05-11 직접 렌더링 검증

개발 서버 `?v=sprite-village-direct-svg`에서 확인한 결과, 기존에 캐릭터가 하얗게 뜨던 현상은 스프라이트 시트를 외부 컴포넌트 배경 이미지로 스케일링하는 과정에서 프레임 컨테이너와 후처리 스타일이 겹치며 색 보존이 불안정했던 것으로 판단했다. 수정 후에는 `DirectPixelSprite` SVG 렌더러가 각 픽셀 사각형을 직접 그리도록 바꾸어, 주인공 용사와 몬스터 모두 원래 팔레트가 보존된다.

히어로 화면에서 주인공은 붉은 망토, 파란 튜닉, 검정 머리, 금색 장식이 분리되어 보이며 흰 필터처럼 보이는 현상은 사라졌다. 칼은 동일 크기의 대각선 픽셀 블록을 반복하는 방식으로 다시 배치해 이전처럼 휘어 보이는 곡선감을 줄였다. 배경은 CraftPix/Cainos 계열 픽셀 마을 타일셋에서 보이는 요소인 초원 타일, 원근 돌길, 붉은 지붕 주택, 탑형 건물, 가로등, 나무, 작은 대장간 소품을 CSS 레이어로 재구성했다.

필드 전투 카드에서도 초록 슬라임과 몬스터 로스터 칩의 색상이 정상적으로 유지된다. 몬스터 SVG 역시 직접 렌더링으로 전환되어 필터나 반투명 오버레이 없이 보인다.
