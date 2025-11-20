import React from "react";
import Image3DWebGL from "./Image3DWebGL";
import { QRCodeSVG } from "qrcode.react";

export default function ModalDetalleImagen({
  img,
  show3D,
  onToggle3D,
  onClose,
  children,
}) {
  // Crear el JSON de la imagen
  const imageJSON = JSON.stringify(img, null, 2);

  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{img.titulo}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {!show3D && (
              <img src={img.url} alt={img.titulo} className="img-fluid mb-3" />
            )}
            {show3D && (
              <div className="mb-3 d-flex justify-content-center">
                <Image3DWebGL
                  src={img.url}
                  alt={img.titulo}
                  style={{ width: "100%", maxWidth: 920 }}
                />
              </div>
            )}
            <p>
              <strong>Autor:</strong> {img.autor}
            </p>
            <p>
              <strong>Categoría:</strong> {img.categoria}
            </p>
            <p>
              <strong>Descripción:</strong> {img.descripcion}
            </p>
            <p>
              <strong>Palabras clave:</strong> {img.palabras_clave}
            </p>
            <hr />
            <div className="mb-3 d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={onToggle3D}
              >
                {show3D ? "Volver a 2D" : "Ver en 3D"}
              </button>
              <small className="text-muted align-self-center">
                (Interacción: mover el cursor sobre la imagen)
              </small>
            </div>

            {/* Código QR con el JSON de la imagen */}
            <div className="mt-3 p-3 bg-light rounded text-center">
              <div className="d-flex justify-content-center">
                <QRCodeSVG
                  value={imageJSON}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            {children}
          </div>
          <div className="modal-footer">
            {/* Los botones de navegación y cerrar se pasan desde el padre si se desea */}
          </div>
        </div>
      </div>
    </div>
  );
}
