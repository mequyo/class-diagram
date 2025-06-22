"use client"

import { ClassifierData, ClassifierType, Connection, Variable, Vec } from "./types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FormEvent, useRef, useState, useEffect, RefObject, Dispatch, SetStateAction, useLayoutEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ClassifierDropdown } from "./classifier-dropdown";
import { Button } from "@/components/ui/button";



interface Props {
  updateClassifier: (id: number, updates: Partial<ClassifierData>) => void,
  connections: Connection[],
  setConnections: Dispatch<SetStateAction<Connection[]>>,
  classifiers: ClassifierData[],
  updateArrows: () => void,
  id: number,
  type: ClassifierType
  name?: string,
  ref?: RefObject<HTMLDivElement>
  offset: Vec
  scale: number
}

export function Classifier({ updateClassifier, updateArrows, connections, setConnections, scale, classifiers, id, type, name, offset }: Props) {
  const reference = useRef<HTMLDivElement>(null);
  const position = useRef<Vec>({ x: 0, y: 0 });
  const lastposition = useRef<Vec>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [variables, setVariables] = useState<Variable[]>([]);

  const extensions = connections.filter(c => c.type == "extension" && c.from == id);
  const implementations = connections.filter(c => c.type == "implementation" && c.from == id);
  


  const changeName = (e: FormEvent<HTMLInputElement>) => {
    updateClassifier(id, { name: e.currentTarget.value });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    setDragging(true);
    lastposition.current = { x: e.clientX, y: e.clientY };
  };

  const addVariable = () => {
    setVariables(prev => [...prev, { name: "", type: "", scope: "public", final: false, static: false }]);
  }

  const onVariableChange = (e: FormEvent<HTMLInputElement>, index: number) => {
    const match = e.currentTarget.value.match(/^(\w+):\s*(\w+)$/); // Matches "identifier: type"

    if (!match) return;

    const [_, name, type] = match;
    setVariables((prev) => {
      const v = [...prev];
      v[index] = { ...v[index], name, type };
      return v;
    });
  }



  useLayoutEffect(() => {
    if (!reference.current) return;

    const rect = reference.current.getBoundingClientRect();

    position.current = {
      x: window.innerWidth / 2 - rect.width / 2 - offset.x,
      y: window.innerHeight / 2 - rect.height / 2 - offset.y
    }
  }, []);

  useEffect(() => {
    updateArrows();
  }, [variables]);

  useEffect(() => {
    updateClassifier(id, { ref: reference });
    updateArrows();
  }, []);

  useEffect(() => {
    const mousemove = (e: MouseEvent) => {
      if (!dragging || !lastposition.current || !reference.current) return;

      const dx = e.clientX - lastposition.current.x;
      const dy = e.clientY - lastposition.current.y;

      if (dx == 0 && dy == 0) return; // No movement

      position.current.x += dx / scale;
      position.current.y += dy / scale;

      reference.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
      lastposition.current = { x: e.clientX, y: e.clientY };

      updateArrows();
    };

    const mouseup = () => setDragging(false);

    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

    return () => {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    }
  }, [dragging]);



  return (
    <Card className="w-[400px] absolute select-none place-items-center" ref={reference} style={{ transform: `translate(${position.current.x}px, ${position.current.y}px)` }}>

      <CardHeader className="pt-2 pb-4 w-full gap-2 flex items-center">
        <div className="w-4/5 h-1.5 rounded-full bg-muted mx-auto cursor-move" onMouseDown={onMouseDown} />
        <Badge className="w-fit rounded-full" variant="secondary">{type}</Badge>
        <div className="w-full flex justify-center items-center">
          <Input defaultValue={name} onChange={(e) => changeName(e)} placeholder="Enter name..." className="font-bold w-11/12 text-center border-none" />
          <ClassifierDropdown id={id} classifiers={classifiers} connections={connections} setConnections={setConnections} />
        </div>

        {/* Render extensions and implementations, if there are any */}
        {extensions.length > 0 && (
          <CardDescription>extends {extensions.map(c => classifiers[c.to].name).join(", ")}</CardDescription>
        )}

        {implementations.length > 0 && (
          <CardDescription>implements {implementations.map(c => classifiers[c.to].name).join(", ")}</CardDescription>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="w-full flex flex-col items-center p-2 gap-2">
        <CardDescription>Variables</CardDescription>
        {variables.map((e, i) => (
          <div key={i} className="w-full flex items-center gap-2">
            <Button variant="secondary" className="rounded-full h-7 w-[100px] min-w-[100px]">public</Button>
            <Input className="rounded-full h-7" onChange={e => onVariableChange(e, i)} />
            <Badge className="rounded-full h-7 w-7 min-w-7 justify-center">s</Badge>
            <Badge className="rounded-full h-7 w-7 min-w-7 justify-center">f</Badge>
          </div>
        ))}
        <Button onClick={addVariable} className="w-full h-6 rounded-full">+</Button>
      </CardContent>

      <Separator />

      <CardContent>
        <CardDescription>Methods</CardDescription>
      </CardContent>

    </Card>
  );
}
