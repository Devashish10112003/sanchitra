export type Point={x:number,y:number};

export type ElementType=
  |"rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "diamond"
  | "freehand"
  | "text"
  | "hand"
  | "eraser";

export type DrawingElement={
  id:string,
  type:ElementType,
  x:number;
  y:number;

  height?:number;
  width?:number;
  points?:Point[];
  text?:string;
}