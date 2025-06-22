"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClassifierData, Connection } from "./types";
import { Classifier } from "./classifier";
import { MouseEvent, KeyboardEvent } from "react";
import { bezier, clamp, onKeysPressed } from "@/lib/utils";
import { Vec } from "./types";
import { Arrow } from "./arrow";


const initClassifiers: ClassifierData[] = [
  {
    id: 0,
    type: "interface",
    name: "Vector",
  }, {
    id: 1,
    type: "class",
    name: "Vector2D"
  }, {
    id: 2,
    type: "class",
    name: "Vector3D"
  }, {
    id: 3,
    type: "enumeration",
  }, {
    id: 4,
    type: "abstract class",
    name: "ImplementerExtender"
  }
];

const initConnections: Connection[] = [
  { from: 1, to: 0, type: "implementation", path: <Arrow from={1} to={0} type="implementation" key={0} /> },
  { from: 2, to: 1, type: "extension", path: <Arrow from={2} to={1} type="extension" key={1} /> },
  { from: 4, to: 1, type: "extension", path: <Arrow from={4} to={1} type="extension" key={2} /> },
]

export default function App() {
  const gridsize = 40;
  const lastposition = useRef<Vec | null>(null);
  const [classifiers, setClassifiers] = useState<ClassifierData[]>(initClassifiers);
  const [connections, setConnections] = useState<Connection[]>(initConnections);
  const [dragging, setDragging] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const offset = useRef<Vec>({ x: 0, y: 0 });
  const reference = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  

  const updateClassifier = useCallback((id: number, updates: Partial<ClassifierData>) => {
    setClassifiers((prev) => {
      const newClassifiers = [...prev];
      newClassifiers[id] = { ...newClassifiers[id], ...updates };
      return newClassifiers;
    });
  }, []);

  const updateTranslationScaleBackground = (translation?: Vec) => {
    if (!container.current || !reference.current) return;

    // Update scale and translation
    const sc = scale;
    const tf = container.current.style.transform;
    const style = container.current.style;

    if (tf.includes("scale")) {
      style.transform = tf.replace(/scale\(.*?\)/g, `scale(${sc})`); // Replace old scale
    } else {
      style.transform += `scale(${sc})`; // Add scale
    }

    if (translation) {
      if (tf.includes("translate")) {
        style.transform = tf.replace(/translate\(.*?\)/g, `translate(${translation.x}px, ${translation.y}px)`);
      } else {
        style.transform += `translate(${translation.x}px, ${translation.y}px)`;
      }
    }

    // Update background
    reference.current.style.backgroundSize = `${gridsize }px ${gridsize }px`;
    reference.current.style.backgroundPosition = `${offset.current.x % (gridsize )}px ${offset.current.y % (gridsize )}px`;

    // Update arrows
    updateArrows();
  }

  const updateArrows = () => {
    for (const connection of connections) {
      const datakey = `${connection.from}-${connection.to}-${connection.type.substring(0, 3)}`
      const path = document.querySelector(`path[data-key="${datakey}"]`) as SVGPathElement;
      const start = classifiers[connection.from].ref?.current;
      const end = classifiers[connection.to].ref?.current;

      if (!start || !end) continue;

      // Calculate the new bezier curve between the two cards
      const p = bezier(start, end, { x: 0, y: 0 });
      const d = `M${p[0].x},${p[0].y} C${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${p[3].x},${p[3].y}`;
      path.setAttribute("d", d);

      // Update the box bounds that hide the arrow underneath text
      const rect = document.querySelector(`rect[data-key="${datakey}"]`) as SVGRectElement;
      const textpath = document.querySelector(`textpath[data-key="${datakey}"]`) as SVGTextPathElement;
      const bbox = textpath.getBoundingClientRect();
      rect.setAttribute("width", String(bbox.width + 8));
      rect.setAttribute("height", String(bbox.height + 8));
      rect.setAttribute("x", String(bbox.x - 4));
      rect.setAttribute("y", String(bbox.y - 4));

      // Rotate the box around the center if the text would otherwise be upside down
      const text = document.querySelector(`text[data-key="text-${datakey}"]`) as SVGTextElement;
      const textbox = text.getBBox(); // Get the LOCAL coordinates
      if (p[0].x > p[3].x) {
        text.setAttribute("transform", `rotate(180, ${textbox.x + textbox.width / 2}, ${textbox.y + textbox.height / 2})`);
      } else {
        text.removeAttribute("transform");
      }
    }
  }

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setScale(clamp(0.5, scale - e.deltaY / 500, 3.0));
    console.log(scale);
  }

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    lastposition.current = { x: e.clientX, y: e.clientY };

    setDragging(e.button == 1 ? true : dragging);
  };

  const onMouseUp = () => setDragging(false);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging || !reference.current || !container.current) return;

    if (lastposition.current) {
      const dx = e.clientX - lastposition.current.x;
      const dy = e.clientY - lastposition.current.y;

      offset.current = { x: offset.current.x + dx / scale, y: offset.current.y + dy / scale };

      updateTranslationScaleBackground(offset.current);
    }

    lastposition.current = { x: e.clientX, y: e.clientY };
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey) e.preventDefault();

    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    onKeysPressed(e, "alt a", () => setClassifiers(prev => [...prev, { id: prev.length, type: "abstract class", position: center }]))
    onKeysPressed(e, "alt c", () => setClassifiers(prev => [...prev, { id: prev.length, type: "class", position: center }]))
    onKeysPressed(e, "alt i", () => setClassifiers(prev => [...prev, { id: prev.length, type: "interface", position: center }]))
    onKeysPressed(e, "alt e", () => setClassifiers(prev => [...prev, { id: prev.length, type: "enumeration", position: center }]))
  };

  useEffect(() => {
    updateArrows();
  })

  useEffect(() => {
    updateTranslationScaleBackground();
  }, [scale]);



  return (
    <div
      ref={reference} onWheel={onWheel}
      onKeyDown={onKeyDown} tabIndex={0} className="absolute w-screen h-screen outline-none "
      onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove} onMouseLeave={onMouseUp}
      style={{
        backgroundImage: `linear-gradient(to right, #101014 2px, transparent 2px), linear-gradient(to bottom, #101014 2px, transparent 2px)`,
        backgroundSize: `${gridsize * scale}px ${gridsize * scale}px`,
        cursor: dragging ? "grabbing" : "default",
      }}
    >

      <svg className="absolute w-screen h-screen pointer-events-none">
        <defs>
          <marker id="directed-arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            {/* Directed Association (filled arrowhead) */} <path d="M0,0 L10,5 L0,10 Z" fill="white" />
          </marker>

          <marker id="hollow-arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            {/* Inheritance / Realization (hollow arrowhead) */} <path d="M0,0 L10,5 L0,10 Z" fill="black" stroke="white" strokeWidth="1" />
          </marker>

          <marker id="composition-diamond" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto" markerUnits="strokeWidth">
            {/* Composition (filled diamond) */} <path d="M0,6 L6,0 L12,6 L6,12 Z" fill="white" />
          </marker>

          <marker id="aggregation-diamond" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto" markerUnits="strokeWidth">
            {/* Aggregation(hollow diamond) */} <path d="M0,6 L6,0 L12,6 L6,12 Z" fill="black" stroke="white" strokeWidth="1" />
          </marker>
        </defs>

        {connections.map((connection) => connection.path)}
      </svg>

      <div ref={container}>
        {classifiers.map((classifier, index) => (
          <Classifier key={index} scale={scale} offset={offset.current} setConnections={setConnections} updateClassifier={updateClassifier} updateArrows={updateArrows} connections={connections} classifiers={classifiers} {...classifier} />
        ))}
      </div>
    </div>
  );
}
