let tf = null;
let cocoSsd = null;
import {
  MODEL_URL,
  LABEL_TO_CATEGORY,
  CONFIDENCE_THRESHOLD,
} from '../constants/categories';

async function loadTensorFlow() {
  if (!tf) {
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
}

async function loadCocoSsd() {
  if (!cocoSsd) {
    cocoSsd = await import('@tensorflow-models/coco-ssd');
  }
  return cocoSsd;
}

const OBJECT_CONFIDENCE_THRESHOLD = 0.62;

// Map reliable COCO-SSD detected objects to application waste categories.
// These mappings are deliberately conservative.
const OBJECT_TO_CATEGORY = {
  'cell phone': 'ewaste',
  laptop: 'ewaste',
  keyboard: 'ewaste',
  mouse: 'ewaste',
  tv: 'ewaste',
  remote: 'ewaste',
  microwave: 'ewaste',
  oven: 'ewaste',
  toaster: 'ewaste',
  refrigerator: 'ewaste',
  banana: 'organic',
  apple: 'organic',
  sandwich: 'organic',
  orange: 'organic',
  broccoli: 'organic',
  carrot: 'organic',
  'hot dog': 'organic',
  pizza: 'organic',
  donut: 'organic',
  cake: 'organic',
  bottle: 'recyclable',
  cup: 'recyclable',
  'wine glass': 'recyclable',
  book: 'recyclable',
  scissors: 'recyclable',
};

let tmModel = null;
let labelsInstance = null;
let imageSizeInstance = 224;
let cocoModel = null;
let loadPromise = null;

export async function loadModel(onStatus) {
  if (tmModel || cocoModel) return tmModel || cocoModel;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    onStatus?.('loading');
    const results = await Promise.allSettled([
      (async () => {
        await loadTensorFlow();
        const metadataResponse = await fetch(MODEL_URL + 'metadata.json');
        if (!metadataResponse.ok) throw new Error('Failed to load model metadata.');
        const metadata = await metadataResponse.json();
        labelsInstance = Array.isArray(metadata.labels) ? metadata.labels : [];
        imageSizeInstance = Number(metadata.imageSize) || 224;
        const model = await tf.loadLayersModel(MODEL_URL + 'model.json');
        const outputUnits = model.outputs?.[0]?.shape?.[1];
        if (outputUnits && labelsInstance.length && outputUnits !== labelsInstance.length) {
          throw new Error('Model output and label count do not match.');
        }
        tmModel = model;
        return model;
      })(),
      (async () => {
        const module = await loadCocoSsd();
        return module.load();
      })(),
    ]);

    if (results[1].status === 'fulfilled') {
      cocoModel = results[1].value;
    }
    if (results[0].status === 'rejected') {
      if (!cocoModel) {
        loadPromise = null;
        onStatus?.('error');
        throw results[0].reason;
      }
    }
    onStatus?.('ready');
    return tmModel || cocoModel;
  })();
  return loadPromise;
}

export function isModelLoaded() {
  return tmModel !== null || cocoModel !== null;
}

function cropToCanvas(imageElement, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const width =
    imageElement instanceof HTMLVideoElement
      ? imageElement.videoWidth
      : imageElement.width || imageElement.naturalWidth;
  const height =
    imageElement instanceof HTMLVideoElement
      ? imageElement.videoHeight
      : imageElement.height || imageElement.naturalHeight;
  if (!width || !height) throw new Error('Unable to read image dimensions.');
  const min = Math.min(width, height);
  const scale = size / min;
  const scaledW = Math.ceil(width * scale);
  const scaledH = Math.ceil(height * scale);
  const dx = scaledW - size;
  const dy = scaledH - size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    imageElement,
    Math.floor(-dx / 2),
    Math.floor(-dy / 2),
    scaledW,
    scaledH
  );
  return canvas;
}

function runTeachableMachine(imageElement) {
  if (!tmModel || !labelsInstance || !labelsInstance.length) {
    return null;
  }
  const size = imageSizeInstance;
  const canvas = cropToCanvas(imageElement, size);
  const input = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(canvas);
    const cropped = pixels.slice([0, 0, 0], [size, size, 3]);
    const batched = cropped.expandDims(0);
    return batched.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  });
  let predictionTensor = null;
  try {
    predictionTensor = tmModel.predict(input);
    const values = predictionTensor.dataSync();
    if (!values || values.length === 0) return null;
    if (labelsInstance.length !== values.length) return null;
    const cleaned = labelsInstance.map((label, i) => ({
      className: String(label),
      probability: Number(values[i]),
    }));
    cleaned.sort((a, b) => b.probability - a.probability);
    return cleaned;
  } finally {
    tf.dispose(input);
    if (predictionTensor) tf.dispose(predictionTensor);
  }
}

export async function classifyImage(imageElement) {
  await loadModel();
  if (!imageElement) throw new Error('Invalid image for classification.');
  if (
    !(imageElement instanceof HTMLImageElement) &&
    !(imageElement instanceof HTMLCanvasElement) &&
    !(imageElement instanceof HTMLVideoElement)
  ) {
    throw new Error('Invalid image for classification.');
  }
  if (imageElement instanceof HTMLImageElement) {
    if (!imageElement.complete || imageElement.naturalWidth === 0) {
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = () => reject(new Error('Image failed to load.'));
      });
    }
  }

  // Hierarchical classification: first run a supported object detector.
  if (cocoModel) {
    try {
      const detections = await cocoModel.detect(imageElement);
      const mapped = (detections || [])
        .map((d) => ({
          className: d.class,
          category: OBJECT_TO_CATEGORY[d.class],
          confidence: Number(d.score),
        }))
        .filter((d) => d.category && Number.isFinite(d.confidence))
        .sort((a, b) => b.confidence - a.confidence);
      if (mapped.length && mapped[0].confidence >= OBJECT_CONFIDENCE_THRESHOLD) {
        return {
          label: mapped[0].className,
          confidence: mapped[0].confidence,
          category: mapped[0].category,
          all: mapped.map((d) => ({
            className: d.className,
            probability: d.confidence,
          })),
          lowConfidence: false,
          source: 'coco-ssd',
        };
      }
    } catch {
      // Fall through to waste-material model.
    }
  }

  const tmPredictions = runTeachableMachine(imageElement);
  if (!tmPredictions || !tmPredictions.length) {
    if (!tmModel && !cocoModel) {
      throw new Error('AI model is not available.');
    }
    return {
      label: 'Unknown',
      confidence: 0,
      category: 'unknown',
      all: [],
      lowConfidence: true,
      source: 'fallback',
    };
  }

  const top = tmPredictions[0];
  const mapped = LABEL_TO_CATEGORY[top.className] || 'unknown';
  const lowConfidence = top.probability < CONFIDENCE_THRESHOLD;
  return {
    label: top.className,
    confidence: top.probability,
    category: lowConfidence ? 'unknown' : mapped,
    all: tmPredictions,
    lowConfidence,
    source: 'teachable-machine',
  };
}