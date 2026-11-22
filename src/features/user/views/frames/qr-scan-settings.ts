/** 라이브러리 기본(25)에 가깝게 두되, 기존 5fps 스로틀보다 인식 기회를 늘린다. */
export const QR_SCAN_MAX_SCANS_PER_SECOND = 15;

/** getUserMedia/applyConstraints에 요청할 ideal 해상도. */
export const QR_SCAN_TARGET_RESOLUTION = {
  width: 1280,
  height: 720,
} as const;

const MAX_DOWNSCALED_LONG_SIDE = 720;

type FocusCapableCapabilities = MediaTrackCapabilities & {
  focusMode?: string[];
};

/** 전체 프레임을 디코딩하고, 긴 변 기준 720px까지만 다운스케일한다(기본 400²보다 고해상도). */
export function calculateQrScanRegion(video: HTMLVideoElement): {
  x: number;
  y: number;
  width: number;
  height: number;
  downScaledWidth: number;
  downScaledHeight: number;
} {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      downScaledWidth: 0,
      downScaledHeight: 0,
    };
  }

  const longest = Math.max(width, height);
  const scale = Math.min(1, MAX_DOWNSCALED_LONG_SIDE / longest);
  return {
    x: 0,
    y: 0,
    width,
    height,
    downScaledWidth: Math.round(width * scale),
    downScaledHeight: Math.round(height * scale),
  };
}

/** 후면 스트림에 고해상도·연속 포커스를 best-effort로 적용한다. */
export async function improveQrCameraTrack(stream: MediaStream): Promise<void> {
  const [track] = stream.getVideoTracks();
  if (!track) return;

  const capabilities = (track.getCapabilities?.() ?? {}) as FocusCapableCapabilities;
  // 해상도는 getUserMedia에서 이미 요청했다. 다시 적용하면 스트림 비율이 바뀌며 화면이 튄다.
  if (!capabilities.focusMode?.includes('continuous')) return;

  try {
    await track.applyConstraints({
      advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
    });
  } catch {
    // 기기/브라우저가 제약을 거부해도 스캔은 계속한다.
  }
}

/** 후면 카메라 스트림을 video에 연결하고 해상도/포커스를 맞춘다. */
export async function startQrCamera(video: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: QR_SCAN_TARGET_RESOLUTION.width },
      height: { ideal: QR_SCAN_TARGET_RESOLUTION.height },
    },
  });

  video.srcObject = stream;
  video.playsInline = true;
  video.muted = true;
  await video.play();
  await improveQrCameraTrack(stream);
  return stream;
}

/** 영상 크기가 이 프레임 수만큼 연속으로 같아야 안정된 것으로 본다. */
export const QR_CAMERA_STABLE_FRAME_COUNT = 3;

/** 크기가 끝내 안정되지 않아도 이 시간이 지나면 영상을 보여준다. */
export const QR_CAMERA_READY_TIMEOUT_MS = 1000;

type VideoSizeSource = Pick<HTMLVideoElement, 'videoWidth' | 'videoHeight'>;

/**
 * 영상 크기가 몇 프레임 연속으로 같아질 때까지 기다린다.
 * iOS WebView는 카메라 시작 직후 회전 전 크기로 프레임을 그렸다가 바로 크기를 바꾼다.
 * 이때 영상을 보여주면 세로로 늘어난 화면이 잠깐 보인다.
 */
export function waitForStableVideoSize(
  video: VideoSizeSource,
  {
    signal,
    nextFrame,
    stableFrames = QR_CAMERA_STABLE_FRAME_COUNT,
    timeoutMs = QR_CAMERA_READY_TIMEOUT_MS,
  }: {
    signal?: AbortSignal;
    nextFrame: (callback: () => void) => void;
    stableFrames?: number;
    timeoutMs?: number;
  },
): Promise<void> {
  return new Promise((resolve) => {
    let lastWidth = -1;
    let lastHeight = -1;
    let sameCount = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', finish);
      resolve();
    };

    const timer = setTimeout(finish, timeoutMs);
    signal?.addEventListener('abort', finish);
    if (signal?.aborted) finish();

    const check = () => {
      if (done) return;
      const { videoWidth: width, videoHeight: height } = video;
      if (width > 0 && height > 0 && width === lastWidth && height === lastHeight) {
        sameCount += 1;
      } else {
        sameCount = width > 0 && height > 0 ? 1 : 0;
        lastWidth = width;
        lastHeight = height;
      }
      if (sameCount >= stableFrames) finish();
      else nextFrame(check);
    };

    nextFrame(check);
  });
}

/** 실제로 새 영상 프레임이 그려질 때마다 콜백을 부른다. 지원하지 않으면 화면 프레임 단위로 부른다. */
export function nextVideoFrame(video: HTMLVideoElement): (callback: () => void) => void {
  return (callback) => {
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => callback());
    } else {
      requestAnimationFrame(() => callback());
    }
  };
}

export function stopQrCamera(video: HTMLVideoElement): void {
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  video.srcObject = null;
}
