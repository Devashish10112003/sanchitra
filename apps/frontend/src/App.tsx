import { useState } from "react";
import Canvas from "./canvas/Canvas";
import { Toolbar } from "./component/Toolbar";
import type { ElementTypeSchema } from "@repo/schemas/types";
function App() {

  const [activeTool, setActiveTool] = useState<ElementTypeSchema>("rect");
  return (
    <>
      <Toolbar onSelectTool={setActiveTool} />
      <Canvas activeTool={activeTool} />
    </>
  );
}

export default App
