import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConnectionType } from "./types";
import { motion } from "framer-motion";

export function Arrow({ from, to, type }: { from: number, to: number, type: ConnectionType }) {
  const marker = type == "implementation" || "extension" ? "hollow-arrow" : "";
  const dashed = type == "implementation" ? "5, 5" : "0, 0";
  const text = type == "implementation" ? "implements" : type == "extension" ? "extends" : null;
  const datakey = `${from}-${to}-${type.substring(0, 3)}`; // e.g. 10-34-imp

  return (
    <>
      <defs>
        <mask id={"mask-" + datakey}>
          <rect width="100%" height="100%" fill="white" />
          <rect fill="black" data-key={datakey} />
        </mask>
      </defs>

      <motion.path
        id={datakey}
        data-key={datakey}
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeDasharray={dashed}
        markerEnd={`url(#${marker})`}
        mask={`url(#mask-${datakey})`}

        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeIn" }}
      />

      {text && (
        <motion.text
          data-key={"text-" + datakey}
          fill="#fff"
          dominantBaseline="middle"
          textAnchor="middle"
          strokeWidth="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeIn" }}
        >
          <textPath href={`#${datakey}`} startOffset="50%" data-key={datakey}>{text}</textPath>
        </motion.text>
      )}
    </>
  )
}