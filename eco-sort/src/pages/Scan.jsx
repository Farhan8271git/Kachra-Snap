import { useEffect, useRef, useState } from 'react';
import {
  Camera as CameraIcon,
  Upload,
  X,
  RotateCw,
  AlertCircle,
  Video,
  Save,
} from 'lucide-react';
import {
  initializeClassifier as loadModel,
  classifyImage,
} from '../services/classifier/classifierService';
import { addRecord, generateId } from '../lib/storage';
import { validateImageFile, createThumbnail } from '../lib/image';
import {
  CONFIDENCE_THRESHOLD,
  CATEGORY_LABEL,
  DISPOSAL_STREAM,
} from '../constants/categories';
import { DISPOSAL_GUIDE } from '../constants/disposalGuide';
import CategoryBadge from '../components/CategoryBadge';
import Reveal from '../components/Reveal';
import { usePreferences } from '../context/PreferencesContext';
import { t } from '../i18n/translations';

export default function Scan({ onNavigate }) {
  const { prefs } = usePreferences();
  const tr = (key) => t(prefs.language, key);
  const categoryLabel = (id) => {
    const key = 'category_' + id;
    const value = t(prefs.language, key);
    return value === key ? (CATEGORY_LABEL[id] || id) : value;
  };
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState('idle');
  const [liveOpen, setLiveOpen] = useState(false);
  const [liveStream, setLiveStream] = useState(null);
  const [liveAuto, setLiveAuto] = useState(true);
  const [liveBusy, setLiveBusy] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveError, setLiveError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const liveVideoRef = useRef(null);
  const liveCanvasRef = useRef(null);
  const liveBusyRef = useRef(false);

  // Preload model
  useEffect(() => {
    loadModel((s) => setModelStatus(s)).catch(() => setModelStatus('error'));
  }, []);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (cameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOpen, stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      liveStream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream, liveStream]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (f) => {
    const err = validateImageFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setResult(null);
    setResultSaved(false);
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreview(url);
  };

  const openCamera = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(s);
      setCameraOpen(true);
    } catch {
      setError('Camera access was denied or is unavailable.');
    }
  };

  const closeCamera = () => {
    setCameraOpen(false);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Failed to capture image.');
          return;
        }
        const f = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        handleFile(f);
        closeCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const classify = async () => {
    if (!file || scanning || !imgRef.current) return;
    setScanning(true);
    setError('');
    try {
      const img = imgRef.current;
      if (!img.complete) {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Image failed to load.'));
        });
      }
      const r = await classifyImage(img);
      setResult(r);
      setResultSaved(false);
    } catch (e) {
      setError(e?.message || 'Classification failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const saveResult = async () => {
    if (!result || !file || resultSaved || savingResult) return;
    setSavingResult(true);
    setError('');
    try {
      const thumb = await createThumbnail(file);
      addRecord({
        id: generateId(),
        category: result.category,
        modelLabel: result.label,
        confidence: result.confidence,
        createdAt: new Date().toISOString(),
        thumbnail: thumb,
      });
      setResultSaved(true);
    } catch (e) {
      setError(e?.message || 'Failed to save scan result.');
    } finally {
      setSavingResult(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setResult(null);
    setResultSaved(false);
    setError('');
  };

  const liveBusySetter = (value) => {
    liveBusyRef.current = value;
    setLiveBusy(value);
  };

  const scanLiveFrame = async () => {
    const video = liveVideoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return;
    if (liveBusyRef.current) return;
    liveBusySetter(true);
    setLiveError('');
    try {
      const r = await classifyImage(video);
      setLiveResult(r);
    } catch (e) {
      setLiveError(e?.message || 'Live classification failed.');
    } finally {
      liveBusySetter(false);
    }
  };

  const startLiveCamera = async () => {
    setLiveError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveError('Camera is not supported in this browser.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setLiveStream(s);
      setLiveOpen(true);
      setLiveResult(null);
    } catch {
      setLiveError('Camera access was denied or is unavailable.');
    }
  };

  const stopLiveCamera = () => {
    liveStream?.getTracks().forEach((t) => t.stop());
    setLiveStream(null);
    setLiveOpen(false);
    setLiveResult(null);
    liveBusySetter(false);
  };

  const saveLiveResult = async () => {
    if (!liveResult || !liveVideoRef.current) return;
    setLiveError('');
    try {
      const video = liveVideoRef.current;
      const canvas = liveCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      );
      if (!blob) throw new Error('Failed to capture live frame.');
      const f = new File([blob], 'live-scan.jpg', { type: 'image/jpeg' });
      const thumb = await createThumbnail(f);
      addRecord({
        id: generateId(),
        category: liveResult.category,
        modelLabel: liveResult.label,
        confidence: liveResult.confidence,
        createdAt: new Date().toISOString(),
        thumbnail: thumb,
      });
    } catch (e) {
      setLiveError(e?.message || 'Failed to save live scan.');
    }
  };

  useEffect(() => {
    if (liveOpen && liveVideoRef.current && liveStream) {
      liveVideoRef.current.srcObject = liveStream;
    }
  }, [liveOpen, liveStream]);

  useEffect(() => {
    return () => {
      liveStream?.getTracks().forEach((t) => t.stop());
    };
  }, [liveStream]);

  useEffect(() => {
    if (!liveOpen || !liveAuto) return undefined;
    const id = setInterval(() => {
      if (!liveBusyRef.current) scanLiveFrame();
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveOpen, liveAuto]);

  useEffect(() => {
    if (!liveOpen) return undefined;
    const t = setTimeout(() => {
      if (!liveBusyRef.current) scanLiveFrame();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveOpen]);

  const guide = result ? DISPOSAL_GUIDE[result.category] || DISPOSAL_GUIDE.unknown : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-charcoal">{tr('scanTitle')}</h1>
      <p className="text-sm text-secondary">
        {tr('scanSubtitle')}
      </p>

      {modelStatus === 'error' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#F1D6D6] bg-[#FBECEC] p-3 text-sm text-error">
          <span>The AI model could not be loaded. Check your connection and try again.</span>
          <button
            type="button"
            onClick={() => {
              setModelStatus('loading');
              loadModel((s) => setModelStatus(s)).catch(() => setModelStatus('error'));
            }}
            className="rounded-md border border-[#F1D6D6] bg-white px-3 py-1.5 text-sm text-error hover:bg-[#FBECEC]"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={
                  'flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 text-center transition-colors ' +
                  (dragging ? 'border-forest bg-sage' : 'border-border bg-white')
                }
              >
                <Upload className="h-8 w-8 text-secondary" aria-hidden="true" />
                <p className="mt-3 text-sm text-charcoal font-medium">
                  {tr('dragDrop')}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  {tr('supportedFormats')}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-deep"
                  >
                    {tr('chooseFile')}
                  </button>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-offwhite"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CameraIcon className="h-4 w-4" aria-hidden="true" />
                      {tr('useCamera')}
                    </span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-white p-3">
                <img
                  ref={imgRef}
                  src={preview}
                  alt="Selected waste item"
                  className="h-64 w-full rounded object-contain bg-offwhite"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite"
                  >
                    <span className="inline-flex items-center gap-2">
                      <X className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
            )}

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {error}
              </p>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={classify}
                disabled={!file || scanning || modelStatus !== 'ready'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {tr('analyzing')}
                  </>
                ) : (
                  tr('classify')
                )}
              </button>
              {modelStatus !== 'ready' && modelStatus !== 'error' && (
                <p className="mt-2 text-xs text-secondary">{tr('loadingModel')}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <h2 className="text-sm font-semibold text-charcoal">{tr('howItWorks')}</h2>
            <ol className="mt-2 list-decimal pl-5 text-sm text-secondary space-y-1">
              <li>{tr('howItWorks1')}</li>
              <li>{tr('howItWorks2')}</li>
              <li>{tr('howItWorks3')}</li>
              <li>{tr('howItWorks4')}</li>
            </ol>
            <p className="mt-4 text-xs text-secondary">
              Predictions are not 100% accurate. Low-confidence results are marked as
              unknown.
            </p>
          </div>
        </div>

      {result && (
        <section className="mt-6 rounded-lg border border-border bg-white p-4">
          <div className="grid gap-6 md:grid-cols-2">
            <img
              src={preview}
              alt="Scanned waste item"
              className="h-72 w-full rounded object-contain bg-offwhite"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={result.category} />
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                    streamToneClass(result.category)
                  }
                >
                  {DISPOSAL_STREAM[result.category]?.label || 'Unknown'}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-charcoal">
                {result.lowConfidence
                  ? 'Unable to classify confidently'
                  : categoryLabel(result.category)}
              </h2>
              <p className="text-xs text-secondary">
                {tr('disposalStream')}: {DISPOSAL_STREAM[result.category]?.label || 'Unknown'}
              </p>
              <p className="text-sm text-secondary">
                {tr('detectedItem')}: {result.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-forest">
                {Math.round(result.confidence * 100)}%
              </p>
              <p className="text-xs text-secondary">
                {tr('confidenceThreshold')} {Math.round(CONFIDENCE_THRESHOLD * 100)}%
              </p>

              {result.lowConfidence && (
                <p className="mt-3 text-sm text-warning">
                  Confidence is below the configured threshold. Keep this as
                  Unknown / Low Confidence, retry with a clearer image, and verify
                  with local guidance.
                </p>
              )}

              {guide && (
                <Reveal as="div" className="mt-4 space-y-3" delay={60}>
                  <GuideBlock title="Recommended disposal action" items={guide.disposal} />
                  <GuideBlock title="Common examples" items={guide.examples} />
                  <GuideBlock title="Preparation" items={guide.preparation} />
                  <GuideBlock title="Avoid contamination" items={guide.contamination} />
                  {guide.safety?.length ? (
                    <GuideBlock title="Safety tips" items={guide.safety} />
                  ) : null}
                </Reveal>
              )}

              <p className="mt-4 text-xs text-secondary">
                <strong>Where to dispose:</strong>{' '}
                {DISPOSAL_GUIDE[result.category]?.local || DISPOSAL_GUIDE.unknown.local}
              </p>

              {resultSaved && (
                <p className="mt-3 text-sm text-forest font-medium">
                  Result saved to local scan history.
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('guide')}
                  className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-deep"
                >
                  View Disposal Guide
                </button>
                <button
                  type="button"
                  onClick={saveResult}
                  disabled={resultSaved || savingResult}
                  className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingResult ? 'Saving...' : resultSaved ? 'Saved' : 'Save Result'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-offwhite"
                >
                  {tr('scanAnother')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-charcoal">{tr('capturePhoto')}</h3>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-md p-1 text-secondary hover:bg-offwhite"
                aria-label="Close camera"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mt-3 h-64 w-full rounded bg-black object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={capture}
                className="flex-1 rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-deep"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-md border border-border bg-white px-4 py-2 text-sm text-charcoal hover:bg-offwhite"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-6 rounded-lg border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">{tr('liveScanTitle')}</h2>
            <p className="text-xs text-secondary">
              {tr('liveScanSubtitle')}
            </p>
          </div>
          {!liveOpen ? (
            <button
              type="button"
              onClick={startLiveCamera}
              className="inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-deep"
            >
              <Video className="h-4 w-4" aria-hidden="true" />
              {tr('startLiveScan')}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopLiveCamera}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-offwhite"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {tr('stopLiveScan')}
            </button>
          )}
        </div>

        {liveError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-error">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {liveError}
          </p>
        )}

        {liveOpen && (
          <div className="mt-4 space-y-3">
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="h-72 w-full rounded bg-black object-cover"
            />
            <canvas ref={liveCanvasRef} className="hidden" />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveAuto((value) => !value)}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite"
              >
                {tr('autoScan')} {liveAuto ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={scanLiveFrame}
                disabled={liveBusy}
                className="rounded-md bg-forest px-3 py-2 text-sm font-medium text-white hover:bg-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {liveBusy ? tr('scanning') : tr('scanNow')}
              </button>
              <button
                type="button"
                onClick={saveLiveResult}
                disabled={!liveResult}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm text-charcoal hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {tr('saveResult')}
              </button>
            </div>

            {liveResult && (
              <div className="rounded-md border border-border bg-offwhite p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={liveResult.category} />
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                      streamToneClass(liveResult.category)
                    }
                  >
                    {DISPOSAL_STREAM[liveResult.category]?.label || 'Unknown'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-charcoal">
                  {categoryLabel(liveResult.category)}
                </p>
                <p className="text-xs text-secondary">
                  {tr('disposalStream')}: {DISPOSAL_STREAM[liveResult.category]?.label}
                </p>
                <p className="text-xs text-secondary">
                  {tr('modelOutput')}: {liveResult.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-forest">
                  {Math.round(liveResult.confidence * 100)}%
                </p>
                {liveResult.lowConfidence && (
                  <p className="mt-2 text-xs text-warning">
                    {tr('lowConfidenceMessage')}
                  </p>
                )}
                <p className="mt-2 text-xs text-secondary">
                  {DISPOSAL_GUIDE[liveResult.category]?.local ||
                    DISPOSAL_GUIDE.unknown.local}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function streamToneClass(category) {
  const tone = DISPOSAL_STREAM[category]?.tone;
  if (tone === 'recyclable' || tone === 'textiles') return 'bg-sage text-forest';
  if (tone === 'organic') return 'bg-[#EAF2E5] text-[#4A6B3A]';
  if (tone === 'ewaste') return 'bg-[#E8EEF5] text-[#365A7A]';
  if (tone === 'hazardous') return 'bg-[#F5E6E0] text-error';
  if (tone === 'residual') return 'bg-offwhite text-secondary';
  return 'bg-[#F5EDE3] text-warning';
}

function GuideBlock({ title, items }) {
  return (
    <div>
      <p className="text-xs font-semibold text-charcoal">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-xs text-secondary space-y-0.5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}