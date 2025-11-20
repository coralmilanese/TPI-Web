import React from "react";

export default function FiltrosGaleria({ filters, categorias, onChange }) {
  return (
    <form className="row g-2 mb-3" onSubmit={(e) => e.preventDefault()}>
      <div className="col-md-3">
        <label className="form-label">Categoría</label>
        <select
          name="categoria"
          className="form-select"
          value={filters.categoria}
          onChange={onChange}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Autor</label>
        <input
          name="autor"
          className="form-control"
          value={filters.autor}
          onChange={onChange}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Buscar</label>
        <input
          name="q"
          className="form-control"
          value={filters.q}
          onChange={onChange}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Fecha (desde / hasta)</label>
        <div className="d-flex">
          <input
            type="date"
            name="date_from"
            className="form-control me-2"
            value={filters.date_from}
            onChange={onChange}
          />
          <input
            type="date"
            name="date_to"
            className="form-control"
            value={filters.date_to}
            onChange={onChange}
          />
        </div>
      </div>
    </form>
  );
}
