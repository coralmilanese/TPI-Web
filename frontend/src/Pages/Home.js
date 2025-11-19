// src/Pages/Home.js 
import React, { useEffect, useRef, useState } from "react";
import "./home-advanced.css";


import HERO_MUSEO from "../assets/img/MUSEOPRINCIPAL.jpg";
import OBRA_DESTACADA from "../assets/img/OBRADESTACADA.jpg";

import EXPO_1 from "../assets/img/OBRA1.jpg";
import EXPO_2 from "../assets/img/OBRA2.jpg";
import EXPO_3 from "../assets/img/OBRA3.jpg";

import ARTISTA_1 from "../assets/img/ESCULTORJORGEMARIN.jpg";
import ARTISTA_2 from "../assets/img/PINTORGUILLERMOAROLA.jpg";

import ARTISTA_3 from "../assets/img/PABLOPICASO.webp";

import CAROUSEL_1 from "../assets/img/MUSEO1.webp";
import CAROUSEL_2 from "../assets/img/MUSEO2.webp";
import CAROUSEL_3 from "../assets/img/MUSEO3.webp";

export default function Home() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const carouselImgs = [CAROUSEL_1, CAROUSEL_2, CAROUSEL_3];

  /* ---------------------------
     AUTO-ROTATE CAROUSEL
  ----------------------------*/
  useEffect(() => {
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselImgs.length);
    }, 5000);
    return () => clearInterval(t);
  }, [carouselImgs.length]);

  /* ---------------------------
     ANIMACIONES SCROLL (REVEAL)
  ----------------------------*/
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ---------------------------
     PARTICULAS HERO
  ----------------------------*/
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const count = Math.max(12, Math.floor(w / 120));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.2,
        alpha: 0.08 + Math.random() * 0.12,
      });
    }

    let raf;
    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ---------------------------
     3D CARD INTERACTION
  ----------------------------*/
  const cardRef = useRef(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (y - 0.5) * 8;
      const ry = (x - 0.5) * -12;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    }
    function onLeave() {
      el.style.transform = "rotateX(0) rotateY(0) scale(1)";
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ---------------------------
     BOTÓN SCROLL TOP
  ----------------------------*/
  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* =====================================
          HERO PROFESIONAL
      ====================================== */}
      <header className="home-hero" role="banner">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${HERO_MUSEO})`,
          }}
        />

        <video
          className="hero-video"
          playsInline
          autoPlay
          muted
          loop
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-museums-ongoing-1593?token=eyJhbGciOiJIUzI1NiJ9"
            type="video/mp4"
          />
        </video>

        <canvas className="hero-canvas" ref={canvasRef} />

        <div className="hero-inner container">
          <div className="hero-left reveal">
            <h1 className="hero-title">Museo Digital</h1>
            <p className="hero-sub">
              Arte, historia y tecnología; una experiencia inmersiva y curada.
            </p>
          </div>

          <aside className="hero-card reveal" ref={cardRef}>
            <div className="card-media">
              <img src={OBRA_DESTACADA} alt="Obra destacada" />
            </div>
            <div className="card-body">
              <h3>Obra Destacada</h3>
              <p className="muted">Autor desconocido — c. 1920</p>
              <p className="small">
                Una pieza representativa de la colección, disponible en HD.
              </p>
            </div>
          </aside>
        </div>
      </header>

      {/* NAV LOCAL */}
      <nav className="quick-nav">
        <a href="#exposiciones">Exposiciones</a>
        <a href="#artistas">Artistas</a>
        <a href="#recorrido">Recorrido</a>
        <a href="#visitanos">Visítanos</a>
      </nav>

      {/* BOTÓN SCROLL TOP */}
      <button
        className={`scroll-top-btn ${showScrollButton ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>

      {/* ===================
          EXPOSICIONES
      ==================== */}
      <section id="exposiciones" className="section reveal">
        <div className="container">
          <header className="section-head">
            <h2>Exposiciones actuales</h2>
            <p className="muted">Curaduría seleccionada por expertos</p>
          </header>

          <div className="exhibitions-grid">
            <article className="exhibit-card">
              <div className="exhibit-media">
                <img src={EXPO_1} alt="Exposición 1" />
              </div>
              <div className="exhibit-body">
                <h3>Rostros del Tiempo</h3>
                <p className="small muted">Retratos desde 1800 a la fecha.</p>
              </div>
            </article>

            <article className="exhibit-card">
              <div className="exhibit-media">
                <img src={EXPO_2} alt="Exposición 2" />
              </div>
              <div className="exhibit-body">
                <h3>Figuras Modernas</h3>
                <p className="small muted">Obras icónicas del siglo XX.</p>
              </div>
            </article>

            <article className="exhibit-card">
              <div className="exhibit-media">
                <img src={EXPO_3} alt="Exposición 3" />
              </div>
              <div className="exhibit-body">
                <h3>Digital &amp; Media</h3>
                <p className="small muted">
                  Prácticas experimentales contemporáneas.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===================
          ARTISTAS
      ==================== */}
      <section id="artistas" className="dark-section reveal">
        <div className="container">
          <header className="section-head white">
            <h2>Artistas destacados</h2>
          </header>

          <div className="artists-row">
            <figure className="artist-card">
              <img src={ARTISTA_1} alt="Artista 1" />
              <figcaption>
                <strong>Jorge Marín</strong>
                <span className="muted">Escultor</span>
              </figcaption>
            </figure>

            <figure className="artist-card">
              <img src={ARTISTA_2} alt="Artista 2" />
              <figcaption>
                <strong>Guillermo Marola</strong>
                <span className="muted">Pintor</span>
              </figcaption>
            </figure>

            <figure className="artist-card">
              <img src={ARTISTA_3} alt="Artista 3" />
              <figcaption>
                <strong>Pablo Picasso</strong>
                <span className="muted">Artista legendario</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ===================
          TIMELINE + 3D
      ==================== */}
      <section id="recorrido" className="section reveal">
        <div className="container split-grid">
          <div>
            <h2>Línea del tiempo</h2>
            <ol className="timeline-list">
              <li><strong>1985</strong> Fundación y primeras donaciones.</li>
              <li><strong>1998</strong> Inicio digitalización.</li>
              <li><strong>2010</strong> Primer recorrido 360° web.</li>
              <li><strong>2024</strong> Plataforma interactiva.</li>
            </ol>
          </div>

          <div>
            <h2>Visualización 3D</h2>
            <div className="viewer-card">
              <img src={OBRA_DESTACADA} alt="Vista 3D" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================
          CAROUSEL
      ==================== */}
      <section className="section reveal">
        <div className="container">
          <h2>Recorrido destacado</h2>

          <div className="carousel-wrap">
            <div className="carousel-viewport" aria-roledescription="carousel">
              {carouselImgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Slide ${i}`}
                  className={`carousel-slide ${i === carouselIndex ? "active" : ""}`}
                />
              ))}
            </div>

            <div className="carousel-controls">
              <button onClick={() =>
                setCarouselIndex((i) => (i - 1 + carouselImgs.length) % carouselImgs.length)
              }>‹</button>

              <button onClick={() =>
                setCarouselIndex((i) => (i + 1) % carouselImgs.length)
              }>›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================
          VISÍTANOS + MAPA
      ==================== */}
      <section id="visitanos" className="dark-section reveal">
        <div className="container split-grid">
          <div>
            <h2>Visítanos</h2>
            <p className="muted">Av. Cultura 2145 – Lun a Sab 10:00–19:00</p>
            <p className="muted">Email: contacto@museodigital.ar</p>
          </div>

          <div>
            <iframe
              width="100%"
              height="260"
              style={{ border: 0, borderRadius: 10 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.3202207530057!2d-64.29524142386161!3d-36.61867797229948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c2cd08581d0253%3A0x1f259074626aff70!2sMuseo%20Provincial%20de%20Historia%20Natural!5e0!3m2!1ses-419!2sar!4v1763529134176!5m2!1ses-419!2sar"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <strong>Museo Digital</strong>
            <p className="muted">Proyecto integrador · 2025</p>
          </div>
          <p className="muted small">© 2025 - Todos los derechos reservados</p>
        </div>
      </footer>
    </>
  );
}
