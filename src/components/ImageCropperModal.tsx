import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Crop, RotateCcw, RotateCw, ZoomIn, ZoomOut,
  Maximize2, Minimize2, FlipHorizontal, RefreshCcw
} from 'lucide-react';
import getCroppedImg from '../lib/cropImage';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
}

const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: 'حر', value: undefined },
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio: defaultAspect = 1,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeAspect, setActiveAspect] = useState(defaultAspect);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setActiveAspect(defaultAspect);
    }
  }, [isOpen, defaultAspect]);

  // Fullscreen API
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_: any, pixels: any) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      // If flip applied, pass that info
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: flipH, vertical: false }
      );
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      onClose();
    }
  };

  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.min(10, Math.max(1, +(z + delta).toFixed(1))));
  };

  const adjustRotation = (delta: number) => {
    setRotation((r) => (r + delta + 360) % 360);
  };

  const cropperHeight = isFullscreen ? 'calc(100vh - 200px)' : '340px';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
          dir="rtl"
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen
                ? 'fixed inset-0 rounded-none w-full h-full max-w-none'
                : 'w-full max-w-2xl max-h-[95vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crop className="w-5 h-5 text-indigo-400" />
                ضبط وقص الصورة
              </h3>
              <div className="flex items-center gap-2">
                {/* Fullscreen toggle */}
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-90"
                >
                  {isFullscreen
                    ? <Minimize2 className="w-4 h-4" />
                    : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-rose-900/50 hover:bg-rose-800/70 text-rose-400 hover:text-rose-200 transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aspect Ratio Picker */}
            <div className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900/50 border-b border-zinc-800/60 shrink-0">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setActiveAspect(r.value as number)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                    activeAspect === r.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  title="قلب أفقي"
                  className={`p-2 rounded-xl text-sm transition-all active:scale-90 ${
                    flipH
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); setFlipH(false); }}
                  title="إعادة تعيين"
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all active:scale-90"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cropper canvas area */}
            <div
              className="relative flex-1 bg-zinc-900 overflow-hidden"
              style={{ height: cropperHeight, minHeight: '200px' }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={activeAspect}
                maxZoom={10}
                zoomWithScroll
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteHandler}
                onZoomChange={onZoomChange}
                objectFit="contain"
                style={{
                  containerStyle: { backgroundColor: '#18181b' },
                  cropAreaStyle: {
                    border: '2px solid #6366f1',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  },
                }}
              />
              {/* Zoom % badge */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-lg pointer-events-none backdrop-blur">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 py-4 space-y-4 bg-zinc-900/80 backdrop-blur shrink-0">

              {/* Zoom row */}
              <div className="flex items-center gap-3">
                <ZoomOut className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={10}
                  step={0.05}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-zinc-700 touch-none"
                  dir="ltr"
                  style={{ WebkitAppearance: 'none' }}
                />
                <ZoomIn className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => adjustZoom(-0.5)}
                    className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center active:scale-90 transition-all text-lg"
                  >－</button>
                  <button
                    type="button"
                    onClick={() => adjustZoom(0.5)}
                    className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center active:scale-90 transition-all text-lg"
                  >＋</button>
                </div>
              </div>

              {/* Rotation row */}
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-zinc-700 touch-none"
                  dir="ltr"
                  style={{ WebkitAppearance: 'none' }}
                />
                <RotateCw className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => adjustRotation(-15)}
                    className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center active:scale-90 transition-all text-sm"
                  >-15°</button>
                  <button
                    type="button"
                    onClick={() => adjustRotation(15)}
                    className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center active:scale-90 transition-all text-sm"
                  >+15°</button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-bold transition-all active:scale-95"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-600/30 min-w-[160px]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Crop className="w-4 h-4" />
                      قص واعتماد الصورة
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
