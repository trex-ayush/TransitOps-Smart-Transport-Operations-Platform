import { useState } from "react";

export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-xl bg-forest px-3 py-2 text-[11px] font-normal normal-case leading-snug tracking-normal text-white shadow-medium">
          {text}
          <span className="absolute left-1/2 top-full -ml-1 border-4 border-transparent border-t-forest" />
        </span>
      )}
    </span>
  );
}
