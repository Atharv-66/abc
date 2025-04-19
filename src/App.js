import React, { createRef, useEffect } from "react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

const App = () => {
  let videoRef = createRef();
  let canvasRef = createRef();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
          },
        })
        .then((stream) => {
          window.stream = stream;
          videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        })
        .catch(() => {
          alert("Kindly allow using your web cam.");
        });

      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then((values) => {
          detectFrame(videoRef.current, values[0]);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const detectFrame = (video, model) => {
    model.detect(video).then((predictions) => {
      renderPredictions(predictions);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
    });
  };

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach((prediction) => {
      const [x, y] = prediction.bbox;
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };

  return (
    <div>
      <h1>Real-time Object Detection</h1>
      <div className="app">
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={canvasRef}
          width="600"
          height="500"
        />
      </div>
    </div>
  );
};

export default App;
