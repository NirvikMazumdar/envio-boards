import { useCallback, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

// Boards autosave to this browser's localStorage, so they persist between
// sessions on the same browser. Use the in-app menu to export/import
// .excalidraw files to move boards between machines.
const STORAGE_KEY = "envio-boards:scene";

function loadScene() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const { elements, appState } = JSON.parse(raw);
    return { elements: elements ?? [], appState: { ...appState, collaborators: [] } };
  } catch {
    return undefined;
  }
}

export default function App() {
  const [initialData] = useState(loadScene);
  const saveTimer = useRef();

  const onChange = useCallback((elements, appState) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { collaborators, ...persistable } = appState;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ elements, appState: persistable })
        );
      } catch {
        // Ignore quota/serialization errors; drawing stays usable.
      }
    }, 400);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw initialData={initialData} onChange={onChange} />
    </div>
  );
}
