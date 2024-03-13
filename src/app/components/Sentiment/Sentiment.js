"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const Sentiment = () => {
  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);

  // Create a reference to the worker object.
  const worker = useRef(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("../../worker.js", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "complete":
          setResult(e.data.output[0]);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  return (
    <main>
      <h1>Text Classification</h1>
      <p>
        This page demonstrates how to use a Web Worker to perform text
        classification in the browser. The classification model is loaded in a
        separate thread, so that the main thread is not blocked while the model
        is being loaded.
      </p>
      <p>
        The model used here is a DistilBERT model fine-tuned for sentiment
        analysis on the SST-2 dataset. It is loaded from the Hugging Face model
        hub and transformed into a Web Worker using the @xenova/transformers
        package.
      </p>
      <p>
        The text to be classified is sent to the Web Worker, which then sends
        the result back to the main thread. The result is displayed below.
      </p>
      <h3>
        {ready !== null &&
          (ready === false
            ? "Model not cached. Loading model..."
            : "Model cached, you can classify text now. Also by reloading the page, you don't need to load the model again.")}
      </h3>
      <p>
        <textarea
          placeholder="Enter some text to classify"
          onChange={(e) => classify(e.target.value)}
        />
      </p>

      <h4>
        {result
          ? `The text is ${result.label} (${result.score.toFixed(2)})`
          : null}
      </h4>
    </main>
  );
};
export default Sentiment;
