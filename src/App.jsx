import { useCallback, useRef, useState } from "react";
import {
  Excalidraw,
  MainMenu,
  serializeAsJSON,
  loadFromBlob,
} from "@excalidraw/excalidraw";

// Boards autosave to this browser's localStorage, so they persist between
// sessions on the same browser. Use the menu items below to export/import the
// scene as proper JSON (the standard .excalidraw format) for use in Notion,
// code, or other machines.
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
  const [api, setApi] = useState(null);
  const saveTimer = useRef();
  const fileInput = useRef();

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

  // Standard Excalidraw scene JSON string for the current board.
  const currentJSON = useCallback(() => {
    if (!api) return "";
    return serializeAsJSON(
      api.getSceneElements(),
      api.getAppState(),
      api.getFiles(),
      "local"
    );
  }, [api]);

  const copyJSON = useCallback(async () => {
    const json = currentJSON();
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      window.prompt("Copy the JSON below:", json);
    }
  }, [currentJSON]);

  const downloadJSON = useCallback(() => {
    const blob = new Blob([currentJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "envio-board.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [currentJSON]);

  const onImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = ""; // allow re-importing the same file
      if (!file || !api) return;
      try {
        const scene = await loadFromBlob(file, null, null);
        api.updateScene(scene);
        if (scene.files) api.addFiles(Object.values(scene.files));
        api.scrollToContent();
      } catch (err) {
        window.alert("Could not import: not a valid Excalidraw JSON file.");
      }
    },
    [api]
  );

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <input
        ref={fileInput}
        type="file"
        accept=".excalidraw,.json,application/json"
        style={{ display: "none" }}
        onChange={onImportFile}
      />
      <Excalidraw
        initialData={initialData}
        onChange={onChange}
        excalidrawAPI={setApi}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.Separator />
          <MainMenu.Item onSelect={copyJSON}>Copy as JSON</MainMenu.Item>
          <MainMenu.Item onSelect={downloadJSON}>Download .json</MainMenu.Item>
          <MainMenu.Item onSelect={() => fileInput.current?.click()}>
            Import JSON…
          </MainMenu.Item>
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
