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
  const constraints: MediaTrackConstraints = {
    width: { ideal: QR_SCAN_TARGET_RESOLUTION.width },
    height: { ideal: QR_SCAN_TARGET_RESOLUTION.height },
  };

  if (capabilities.focusMode?.includes('continuous')) {
    constraints.advanced = [{ focusMode: 'continuous' } as MediaTrackConstraintSet];
  }

  try {
    await track.applyConstraints(constraints);
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

export function stopQrCamera(video: HTMLVideoElement): void {
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  video.srcObject = null;
}
