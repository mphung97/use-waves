import * as React from "react";
const { useMemo, useRef } = React;
import { useWavesurfer } from "@wavesurfer/react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

const App = () => {
  const containerRef = useRef(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedUrl, setRecordedUrl] = React.useState("");
  console.log(recordedUrl);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    plugins: useMemo(() => [RecordPlugin.create()], []),
  });

  const record = useMemo(() => {
    return wavesurfer?.getActivePlugins()[0] as RecordPlugin;
  }, [wavesurfer]);

  const onRecord = React.useCallback(async () => {
    if (!record) return;

    if (record?.isRecording() || record?.isPaused()) {
      record?.stopRecording();
      setIsRecording(false);
      console.log("stop recording");
      return;
    }

    const devices = await RecordPlugin.getAvailableAudioDevices();
    const deviceId = devices[0]?.deviceId;

    if (deviceId) {
      await record?.startRecording({ deviceId });
      setIsRecording(true);
      console.log("recording");
    }
  }, [record]);

  React.useEffect(() => {
    if (!record) return;

    const unsubscribeFns = [
      record?.on("record-end", (blob) => {
        const recordedUrl = URL.createObjectURL(blob);
        console.log("recorded");

        setRecordedUrl(recordedUrl);
      }),
    ];

    return () => {
      unsubscribeFns.forEach((fn) => fn());
    };
  }, [record]);

  return (
    <>
      <div ref={containerRef} />

      <div style={{ margin: "1em 0", display: "flex", gap: "1em" }}>
        <button onClick={onRecord} style={{ minWidth: "5em" }}>
          {isRecording ? "Stop record" : "Start record"}
        </button>
      </div>
    </>
  );
};

export default App;
