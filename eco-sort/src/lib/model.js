
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

import {
  MODEL_URL,
  LABEL_TO_CATEGORY,
  CONFIDENCE_THRESHOLD,
} from '../constants/categories';

const OBJECT_CONFIDENCE_THRESHOLD = 0.62;

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
let labelsInstance = [];
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
        const metadataResponse = await fetch(
          `${MODEL_URL}metadata.json`
        );

        if (!metadataResponse.ok) {
          throw new Error(
            `Failed to load metadata.json: ${metadataResponse.status}`
          );
        }

        const metadata = await metadataResponse.json();

        labelsInstance = Array.isArray(metadata.labels)
          ? metadata.labels
          : [];

        imageSizeInstance = Number(metadata.imageSize) || 224;

        if (!labelsInstance.length) {
          throw new Error('No labels found in model metadata.');
        }

        const model = await tf.loadLayersModel(
          `${MODEL_URL}model.json`
        );

        const outputUnits = model.outputs?.[0]?.shape?.[1];

        if (
          outputUnits &&
          outputUnits !== labelsInstance.length
        ) {
          model.dispose();
          throw new Error(
            'Model output count does not match metadata labels.'
          );
        }

        tmModel = model;
        return model;
      })(),

      cocoSsd.load(),
    ]);

    if (results[1].status === 'fulfilled') {
      cocoModel = results[1].value;
    }

    if (results[0].status === 'rejected') {
      console.error(
        'Teachable Machine model failed to load:',
        results[0].reason
      );

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

function runTeachableMachine(imageElement) {
  if (!tmModel || !labelsInstance.length) return null;

  const size = imageSizeInstance;

  const input = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(imageElement);
    // const resized = tf.image.resizeBilinear(
    //   pixels,
    //   [size, size]
    // );

    // return resized
    //   .toFloat()
    //   .div(127.5)
    //   .sub(1)
    //   .expandDims(0);
    const resized = tf.image.resizeBilinear(
      pixels,
      [size, size]
    );

    return resized
      .toFloat()
      .div(255)
      .expandDims(0);
  });

  let predictionTensor = null;

  try {
    predictionTensor = tmModel.predict(input);

    if (Array.isArray(predictionTensor)) {
      throw new Error('Unexpected multiple model outputs.');
    }

    const values = predictionTensor.dataSync();

    if (values.length !== labelsInstance.length) {
      throw new Error(
        'Prediction count does not match model labels.'
      );
    }

    return labelsInstance
      .map((label, index) => ({
        className: String(label),
        probability: Number(values[index]),
      }))
      .sort((a, b) => b.probability - a.probability);
  } finally {
    tf.dispose(input);

    if (predictionTensor) {
      tf.dispose(predictionTensor);
    }
  }
}

async function runCocoFallback(imageElement) {
  if (!cocoModel) return null;

  const detections = await cocoModel.detect(imageElement);

  const mapped = (detections || [])
    .map((detection) => ({
      className: detection.class,
      category: OBJECT_TO_CATEGORY[detection.class],
      confidence: Number(detection.score),
    }))
    .filter(
      (item) =>
        item.category &&
        Number.isFinite(item.confidence)
    )
    .sort((a, b) => b.confidence - a.confidence);

  if (
    !mapped.length ||
    mapped[0].confidence < OBJECT_CONFIDENCE_THRESHOLD
  ) {
    return null;
  }

  return {
    label: mapped[0].className,
    confidence: mapped[0].confidence,
    category: mapped[0].category,
    all: mapped.map((item) => ({
      className: item.className,
      probability: item.confidence,
    })),
    lowConfidence: false,
    source: 'coco-ssd',
  };
}

export async function classifyImage(imageElement) {
  await loadModel();

  if (!imageElement) {
    throw new Error('Invalid image for classification.');
  }

  if (
    !(imageElement instanceof HTMLImageElement) &&
    !(imageElement instanceof HTMLCanvasElement) &&
    !(imageElement instanceof HTMLVideoElement)
  ) {
    throw new Error('Invalid image for classification.');
  }

  if (imageElement instanceof HTMLImageElement) {
    if (!imageElement.complete || !imageElement.naturalWidth) {
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = () =>
          reject(new Error('Image failed to load.'));
      });
    }
  }

  // 1. Your trained Teachable Machine model gets priority.
  let predictions = null;

  if (tmModel) {
    try {
      predictions = runTeachableMachine(imageElement);
    } catch (error) {
      console.error('Teachable Machine prediction failed:', error);
    }
  }

  const top = predictions?.[0];
  
  console.table(predictions || []);

  if (top) {
    const mappedCategory = LABEL_TO_CATEGORY[top.className];

    console.info('[EcoSort classifier]', {
      source: 'teachable-machine',
      label: top.className,
      confidence: top.probability,
    });

    if (
      mappedCategory &&
      mappedCategory !== 'unknown' &&
      top.probability >= CONFIDENCE_THRESHOLD
    ) {
      return {
        label: top.className,
        confidence: top.probability,
        category: mappedCategory,
        all: predictions,
        lowConfidence: false,
        source: 'teachable-machine',
      };
    }
  }

  // 2. COCO-SSD is used only when the custom model is uncertain.
  if (cocoModel) {
    try {
      const fallback = await runCocoFallback(imageElement);

      if (fallback) {
        console.info('[EcoSort classifier]', {
          source: 'coco-ssd',
          label: fallback.label,
          confidence: fallback.confidence,
        });

        return fallback;
      }
    } catch (error) {
      console.warn('COCO-SSD fallback failed:', error);
    }
  }

  // 3. Preserve the custom model's prediction as low confidence.
  if (top) {
    return {
      label: top.className,
      confidence: top.probability,
      category: 'unknown',
      all: predictions,
      lowConfidence: true,
      source: 'teachable-machine',
    };
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
