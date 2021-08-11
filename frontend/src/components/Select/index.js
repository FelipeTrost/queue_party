import React, { useState, useEffect } from "react";
import "./styles.css";

export default function Select({ options, setValue, style }) {
  const [selected, setSelected] = useState();

  useEffect(() => setValue && setValue(selected), [selected]);
  console.log(options);

  return (
    <select
      style={style}
      className="cool-select"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      {options.map((op) => (
        <option key={op.id} value={op.id}>
          {op.name}
        </option>
      ))}
    </select>
  );
}
