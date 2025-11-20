import React, { useRef, useEffect, useState } from "react";

export default function Image3DWebGL({ src, alt, style }) {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let renderer, scene, camera, controls, mesh, animationId;

    async function init() {
      setLoading(true);
      try {
        const THREE = await import("three");
        // OrbitControls live in examples; dynamic import path
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls"
        );

        if (!mounted) return;

        const width = mountRef.current.clientWidth || 600;
        const height = Math.max(360, Math.floor(width * 0.6));

        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.outputEncoding = THREE.sRGBEncoding;

        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);

        // scene
        scene = new THREE.Scene();

        // camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 2.2);

        // light
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        hemi.position.set(0, 1, 0);
        scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(0, 1, 1);
        scene.add(dir);

        // geometry - a plane to map the image
        const geometry = new THREE.PlaneGeometry(1.6, 1);

        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";

        loader.load(
          src,
          (texture) => {
            if (!mounted) return;
            texture.encoding = THREE.sRGBEncoding;
            // Use MeshBasicMaterial to show the texture without lighting alterations
            const material = new THREE.MeshBasicMaterial({ map: texture });

            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // adjust plane aspect ratio to image
            const imageAspect =
              texture.image?.width / texture.image?.height || 1.6;
            mesh.scale.set(imageAspect, 1, 1);

            // controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enablePan = false;
            controls.enableZoom = true;
            controls.minDistance = 1.2;
            controls.maxDistance = 4;
            controls.autoRotate = false;

            // animate loop
            const animate = () => {
              animationId = requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            };
            animate();
            setLoading(false);
          },
          undefined,
          (err) => {
            console.error("Error loading texture", err);
            setError("No se pudo cargar la imagen en WebGL.");
            setLoading(false);
          }
        );

        function handleResize() {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth;
          const h = Math.max(360, Math.floor(w * 0.6));
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }

        window.addEventListener("resize", handleResize);

        // cleanup
        return () => {
          mounted = false;
          window.removeEventListener("resize", handleResize);
          if (animationId) cancelAnimationFrame(animationId);
          if (controls) controls.dispose();
          if (mesh) {
            // dispose geometry and material/texture
            try {
              if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
              }
              if (mesh.geometry) mesh.geometry.dispose();
            } catch (e) {
              // ignore dispose errors
            }
            if (scene) scene.remove(mesh);
            mesh = null;
          }
          if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode)
              renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
          scene = null;
        };
      } catch (e) {
        console.error(e);
        setError(
          "La dependencia three.js no está instalada. Ejecutá: npm install three"
        );
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      // nothing else here since init returns cleanup for renderer etc.
    };
  }, [src]);

  return (
    <div style={{ width: "100%", ...style }}>
      {loading && !error && (
        <div style={{ padding: 24, textAlign: "center" }}>
          Cargando vista 3D…
        </div>
      )}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error} <br />
          Para instalar: <code>cd frontend && npm install three</code>
        </div>
      )}
      <div ref={mountRef} style={{ width: "100%" }} />
    </div>
  );
}
