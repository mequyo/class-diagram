import { RefObject, SVGProps } from "react"

export type Vec<T = number> = {x: T, y: T};

export type Scope = "public" | "private" | "protected"

export type Variable = {scope: Scope, name: string, type: string, static: boolean, final: boolean}

export type Method = {scope: Scope, name: string, static: boolean}

export type ClassifierType = "abstract class" | "class" | "interface" | "enumeration"

export type ClassifierData = {
  id: number,
  type: ClassifierType,
  name?: string,
  ref?: RefObject<HTMLDivElement>,
}

export type ConnectionType = "extension" | "implementation" | "association"

export type Connection = {
  from: number,
  to: number,
  type: ConnectionType,
  path?: React.ReactElement
}