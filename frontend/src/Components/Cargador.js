import React from "react";
export default function Cargador({ text = "Cargando..." }) {
  return <div className="text-center py-4 text-muted">{text}</div>;
}
