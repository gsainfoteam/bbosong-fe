# QR 스캔 바텀시트 구현 가이드

Main 화면에서 버튼을 누르면 `QrScanScreen`이 화면 밑에서 올라와 하단에 고정되도록 구현하는 방법입니다.
애니메이션은 이미 설치된 `motion`(v12)을 사용합니다.

## 전체 구조

```
MainFrame (열림/닫힘 상태 보유)
├─ MainScreen        ← 버튼 클릭 시 onOpenQrScan 호출
└─ AnimatePresence
   └─ (isOpen일 때만) 화면 하단 고정 motion.div
      └─ QrScanFrame → QrScanScreen
```

## 1. 상태는 Frame에서 관리

- `MainScreen`은 UI만 그리고, props로 `onOpenQrScan: () => void`를 추가로 받습니다. 버튼을 누르면 이 함수를 호출합니다.
- 열림/닫힘 상태(`useState`)와 시트 렌더링은 `MainFrame`이 맡습니다.
- 이렇게 나누면 Screen과 Storybook이 카메라 로직과 분리됩니다.

## 2. 열려 있을 때만 마운트

```tsx
import { AnimatePresence, motion } from 'motion/react';

<AnimatePresence>
  {isQrOpen && (
    <>
      {/* 배경 클릭 시 닫기 */}
      <motion.div
        className="fixed inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsQrOpen(false)}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <QrScanFrame />
      </motion.div>
    </>
  )}
</AnimatePresence>
```

- **`fixed inset-x-0 bottom-0`**: 시트를 화면 하단에 고정합니다. 높이는 `QrScanScreen`의 `h-[80dvh]`가 정합니다.
- **`initial` → `animate` → `exit`**: 화면 밖(`y: 100%`)에서 올라오고, 닫을 때는 다시 내려갑니다.
- **`AnimatePresence`**: 이게 감싸고 있어야 언마운트될 때도 `exit` 애니메이션이 재생됩니다.
- **카메라와의 관계**: `QrScanFrame`은 마운트될 때 카메라를 켜고 언마운트될 때 `scanner.destroy()`로 끕니다. 따라서 시트가 열릴 때만 카메라가 켜지고, 닫히면 자동으로 꺼집니다.

## 3. 선택 사항

- **드래그로 닫기**: 시트에 `drag="y"`, `dragConstraints={{ top: 0, bottom: 0 }}`, `onDragEnd`를 주고, 일정 거리나 속도 이상 끌어내리면 닫히게 합니다.
- **뒤로가기로 닫기**: `useState` 대신 TanStack Router의 search param(`?qr=true`)으로 상태를 관리합니다. 모바일 뒤로가기로 시트가 닫히고, 시트를 연 상태로 링크를 공유할 수도 있습니다. 해당 라우트에 `validateSearch`를 정의해야 합니다.
- **배경 스크롤 막기**: 시트가 열려 있는 동안 `body`에 `overflow-hidden`을 줍니다.

## 참고

- 현재 `/_auth-required/_user/` 라우트는 `<>Main</>`만 렌더링하고 있어 `MainScreen`을 쓰는 `MainFrame`이 없습니다. 위 구조를 쓰려면 `MainFrame`을 먼저 만들어 라우트에 연결해야 합니다.
- `QrScanScreen`은 그대로 쓸 수 있습니다. 다만 바깥에서 넘기는 `className`이 기본 클래스보다 먼저 들어가서, 같은 속성을 바깥에서 덮어쓸 수 없습니다. 덮어써야 한다면 `cn('...기본', className)` 순서로 바꿉니다.
