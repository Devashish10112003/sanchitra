import { useState } from "react";
import type { ElementType } from "./canvas/types/canvas";
import Canvas from "./canvas/Canvas";
import { Toolbar } from "./component/Toolbar";

function App() {

   const[activeTool,setActiveTool]=useState<ElementType>("rect");
  return (
      <>
        <Toolbar onSelectTool={setActiveTool}/>
        <Canvas activeTool={activeTool} />
      </>
  );
}

export default App
