import { classifierConfig } from './config';
import { PREDICTION_STATUSES } from './types';
import currentModelAdapter from './modelAdapter';

let status = PREDICTION_STATUSES.IDLE;
let initializationPromise = null;

export async function initializeClassifier(onStatus) {
  if (!classifierConfig.enabled) {
    status = PREDICTION_STATUSES.UNAVAILABLE;
    onStatus?.(status);
    return false;
  }

  if (status === PREDICTION_STATUSES.READY) {
    onStatus?.(status);
    return true;
  }

  if (initializationPromise) {
    const ready = await initializationPromise;
    onStatus?.(status);
    return ready;
  }

  status = PREDICTION_STATUSES.INITIALIZING;
  onStatus?.(status);

  initializationPromise = (async () => {
    try {
      const ready = await currentModelAdapter.initialize(onStatus);
      status = ready ? PREDICTION_STATUSES.READY : PREDICTION_STATUSES.UNAVAILABLE;
      return ready;
    } catch (error) {
      status = PREDICTION_STATUSES.ERROR;
      initializationPromise = null;
      onStatus?.(status);
      throw error;
    }
  })();

  try {
    return await initializationPromise;
  } catch (error) {
    return false;
  }
}

export async function classifyImage(image) {
  if (status !== PREDICTION_STATUSES.READY) {
    throw new Error('Classifier is not ready.');
  }
  status = PREDICTION_STATUSES.CLASSIFYING;
  try {
    const result = await currentModelAdapter.classifyImage(image);
    status = PREDICTION_STATUSES.READY;
    return result;
  } catch (error) {
    if (getClassifierStatus() === PREDICTION_STATUSES.CLASSIFYING) {
      try {
        const adapterStatus = currentModelAdapter.getStatus();
        status = adapterStatus === 'ready' ? PREDICTION_STATUSES.READY : PREDICTION_STATUSES.ERROR;
      } catch {
        status = PREDICTION_STATUSES.READY;
      }
    }
    throw error;
  }
}

export function getClassifierStatus() {
  return status;
}

export function resetClassifierStatus() {
  status = PREDICTION_STATUSES.IDLE;
  initializationPromise = null;
}

export function disposeClassifier() {
  status = PREDICTION_STATUSES.IDLE;
  initializationPromise = null;
}