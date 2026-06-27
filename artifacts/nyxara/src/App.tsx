import { useState, useEffect, useRef } from "react";
import introImg from "@assets/Intro_Nyxara_1782602425752.jpeg";
import logoImg from "@assets/Logo_Nyxara_1782602425752.jpeg";
import womenImg from "@assets/Foto_Atraer_Mujeres_1782602425751.jpg";
import menImg from "@assets/Foto_Atraer_Hombres_1782602425751.jpg";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoCard {
  id: number;
  title: string;
  views: string;
  ago: string;
  duration: string;
  gradient: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const VIDEOS: VideoCard[] = [
  { id: 1, title: "Noche de pasión intensa", views: "2.3M", ago: "hace 1 día", duration: "12:34", gradient: "from-red-900 via-black to-red-950" },
  { id: 2, title: "Encuentro secreto en el hotel", views: "1.8M", ago: "hace 3 días", duration: "08:15", gradient: "from-rose-900 via-black to-gray-900" },
  { id: 3, title: "Seducción en la penumbra", views: "975K", ago: "hace 5 horas", duration: "05:47", gradient: "from-red-800 via-gray-900 to-black" },
  { id: 4, title: "Deseo en la madrugada", views: "3.1M", ago: "hace 2 semanas", duration: "20:01", gradient: "from-gray-900 via-red-900 to-black" },
  { id: 5, title: "Juego de miradas", views: "540K", ago: "hace 1 hora", duration: "04:22", gradient: "from-black via-red-950 to-rose-900" },
  { id: 6, title: "El ritual de la seducción", views: "1.1M", ago: "hace 4 días", duration: "15:09", gradient: "from-red-950 via-black to-gray-900" },
  { id: 7, title: "Placer sin límites", views: "2.7M", ago: "hace 1 semana", duration: "18:44", gradient: "from-gray-900 via-red-800 to-black" },
  { id: 8, title: "La última tentación", views: "880K", ago: "hace 6 horas", duration: "09:58", gradient: "from-rose-950 via-gray-900 to-red-900" },
];

const NAV_LINKS = [
  { label: "INICIO", href: "#inicio" },
  { label: "LO MEJOR", href: "#mejor" },
  { label: "CATEGORÍAS", href: "#categorias" },
  { label: "IMÁGENES", href: "#imagenes" },
  { label: "SUBIR VIDEO", href: "#subir" },
  { label: "LEGAL", href: "#legal" },
  { label: "PRIVACIDAD", href: "#privacidad" },
  { label: "COOKIES", href: "#cookies" },
];

// ─── Age Gate ─────────────────────────────────────────────────────────────────

function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-[#111] rounded-lg text-center p-8 animate-modal-in"
        style={{ boxShadow: "0 0 30px rgba(204,0,0,0.5)" }}
      >
        <img src={introImg} alt="Nyxara" className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-2 border-red-700" />
        <h1 className="text-xl font-bold text-white mb-3 uppercase tracking-widest">
          Solo para mayores de 18 años
        </h1>
        <p className="text-sm text-gray-300 leading-relaxed mb-6">
          Este sitio contiene contenido erótico dirigido exclusivamente a personas adultas.
          Al continuar declaras que eres mayor de edad en tu país y aceptas nuestra política
          de privacidad y de cookies.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onEnter}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded transition-all hover:-translate-y-0.5 text-sm"
          >
            Soy mayor de 18
          </button>
          <button
            onClick={() => (window.location.href = "https://www.google.com")}
            className="px-6 py-2.5 bg-[#333] hover:bg-[#444] text-white font-semibold rounded transition-all text-sm"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "El correo es obligatorio.";
    else if (!email.includes("@")) newErrors.email = "Introduce un correo válido.";
    if (!password) newErrors.password = "La contraseña es obligatoria.";
    else if (password.length < 6) newErrors.password = "Mínimo 6 caracteres.";
    setErrors(newErrors);
    if (!Object.keys(newErrors).length) {
      alert("Demo: aquí se conectará el sistema real de autenticación.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] bg-black/85 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#111] rounded-lg p-6 animate-modal-in relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-700 text-white rounded-full w-7 h-7 text-lg flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          ×
        </button>
        <h2 className="text-lg font-bold text-white mb-4">Accede a Nyxara</h2>

        <div className="flex flex-col gap-2 mb-4">
          <button className="w-full py-2 px-4 rounded border border-red-700 bg-[#111] text-white text-sm hover:bg-red-700/20 transition-colors">
            Continuar con Google
          </button>
          <button className="w-full py-2 px-4 rounded border border-gray-600 bg-[#111] text-white text-sm hover:bg-white/5 transition-colors">
            Continuar con otra cuenta
          </button>
        </div>

        <div className="relative text-center text-xs text-gray-500 my-4">
          <span className="bg-[#111] px-3 relative z-10">o con correo</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#333]" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@example.com"
              className={`w-full px-3 py-2 bg-[#050505] border rounded text-white text-sm outline-none focus:border-red-600 transition-colors ${errors.email ? "border-red-500" : "border-[#444]"}`}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={`w-full px-3 py-2 bg-[#050505] border rounded text-white text-sm outline-none focus:border-red-600 transition-colors ${errors.password ? "border-red-500" : "border-[#444]"}`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-sm transition-colors mt-1"
          >
            Entrar / Crear cuenta
          </button>
          <p className="text-xs text-gray-500 text-center">
            Formulario de demostración visual.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Image Modal ──────────────────────────────────────────────────────────────

function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[900] bg-black/85 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-sm w-full animate-modal-in">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-700 text-white rounded-full w-7 h-7 text-lg flex items-center justify-center hover:bg-red-600 transition-colors z-10"
        >
          ×
        </button>
        <img src={src} alt={alt} className="w-full h-auto rounded-lg block" />
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<{ title?: string; desc?: string; file?: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    const file = fileRef.current?.files?.[0];
    if (!title.trim()) newErrors.title = "El título es obligatorio.";
    if (desc.length > 500) newErrors.desc = "Máximo 500 caracteres.";
    if (!file) {
      newErrors.file = "Selecciona un archivo de video.";
    } else {
      const allowed = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowed.includes(file.type)) newErrors.file = "Formato no permitido. Usa MP4, WEBM u OGG.";
      else if (file.size > 500 * 1024 * 1024) newErrors.file = "El archivo es demasiado grande (máx. 500 MB).";
    }
    setErrors(newErrors);
    if (!Object.keys(newErrors).length) {
      alert("Demo: el formulario es válido.");
      setTitle("");
      setDesc("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section id="subir" className="px-4 py-8 border-t border-red-950 bg-black">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-red-600 mb-5 uppercase tracking-wide">Subir Video</h2>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Título del video</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="Escribe un título atractivo"
              className={`w-full px-3 py-2 bg-[#050505] border rounded text-white text-sm outline-none focus:border-red-600 transition-colors ${errors.title ? "border-red-500" : "border-[#444]"}`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Descripción</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Describe tu video (máx. 500 caracteres)"
              className={`w-full px-3 py-2 bg-[#050505] border rounded text-white text-sm outline-none focus:border-red-600 transition-colors resize-none ${errors.desc ? "border-red-500" : "border-[#444]"}`}
            />
            {errors.desc && <p className="text-xs text-red-400 mt-1">{errors.desc}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Archivo de video</label>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              className="w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-red-700 file:text-white file:text-sm file:cursor-pointer hover:file:bg-red-600"
            />
            {errors.file && <p className="text-xs text-red-400 mt-1">{errors.file}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Miniatura (opcional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#333] file:text-white file:text-sm file:cursor-pointer hover:file:bg-[#444]"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-sm transition-all hover:-translate-y-0.5 border border-red-700"
            >
              Simular subida
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Esta es una versión de prueba: el archivo no se envía a ningún servidor, solo se valida en tu navegador.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [entered, setEntered] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [imageModal, setImageModal] = useState<{ src: string; alt: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filteredVideos, setFilteredVideos] = useState(VIDEOS);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFilteredVideos(q ? VIDEOS.filter((v) => v.title.toLowerCase().includes(q)) : VIDEOS);
  }, [search]);

  const year = new Date().getFullYear();

  return (
    <>
      {!entered && <AgeGate onEnter={() => setEntered(true)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {imageModal && (
        <ImageModal src={imageModal.src} alt={imageModal.alt} onClose={() => setImageModal(null)} />
      )}

      <div className={`min-h-screen flex flex-col transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

        {/* ── Topbar ── */}
        <header className="flex items-center justify-between px-4 py-2 bg-black border-b-2 border-red-700 sticky top-0 z-50">
          <a href="#inicio" className="flex-shrink-0">
            <img src={introImg} alt="Nyxara" className="h-10 w-10 rounded-full object-cover border border-red-700" />
          </a>

          <form
            className="flex flex-1 max-w-lg mx-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar videos…"
              className="flex-1 px-3 py-1.5 bg-black border border-red-700 rounded-l text-white text-sm outline-none focus:border-red-500 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded-r transition-colors"
            >
              Buscar
            </button>
          </form>

          <button
            onClick={() => setShowAuth(true)}
            className="flex-shrink-0 px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded transition-colors"
          >
            Iniciar sesión
          </button>
        </header>

        {/* ── Nav ── */}
        <nav className="flex flex-wrap bg-[#111] border-b border-red-700 px-2 py-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <main className="flex-1">

          {/* ── Hero ── */}
          <section id="inicio" className="text-center py-8 px-4">
            <img
              src={logoImg}
              alt="Nyxara"
              className="max-w-[220px] w-full mx-auto mb-5 rounded-lg"
            />
            <h1 className="text-3xl font-bold uppercase tracking-widest text-red-600 mb-3">
              Nyxara
            </h1>
            <p className="max-w-2xl mx-auto text-gray-300 leading-relaxed text-sm">
              Donde tus sueños más eróticos se hacen realidad y tus parafilias no serán juzgadas,
              solo con un click de tu dedo, bienvenida o bienvenido a Nyxara.
            </p>
          </section>

          {/* ── Video Feed ── */}
          <section id="mejor" className="px-4 pb-8">
            <h2 className="text-lg font-bold text-red-600 mb-4 uppercase tracking-wide">
              {search.trim() ? `Resultados para "${search}"` : "Videos recomendados"}
            </h2>
            {filteredVideos.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No se encontraron videos.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredVideos.map((video) => (
                  <article
                    key={video.id}
                    className="bg-[#111] rounded overflow-hidden cursor-pointer group transition-all hover:-translate-y-1"
                    style={{ boxShadow: "0 0 0 0 rgba(204,0,0,0)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px rgba(204,0,0,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 rgba(204,0,0,0)";
                    }}
                  >
                    <div className={`relative h-28 bg-gradient-to-br ${video.gradient}`}>
                      <span className="absolute bottom-1.5 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400">{video.views} vistas · {video.ago}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Image CTA ── */}
          <section id="imagenes" className="text-center px-4 py-8 border-t border-red-950">
            <h2 className="text-lg font-bold text-red-600 mb-5 uppercase tracking-wide">Explora tus deseos</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setImageModal({ src: womenImg, alt: "Atraer Mujeres" })}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded border border-red-700 text-sm transition-all hover:-translate-y-0.5"
              >
                Atraer Mujeres
              </button>
              <button
                onClick={() => setImageModal({ src: menImg, alt: "Atraer Hombres" })}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded border border-red-700 text-sm transition-all hover:-translate-y-0.5"
              >
                Atraer Hombres
              </button>
            </div>
          </section>

          {/* ── Upload ── */}
          <UploadForm />

          {/* ── Legal ── */}
          <section id="legal" className="px-4 py-6 border-t border-red-950 bg-black">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wide">Aviso Legal</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Aquí debes incluir tus datos como responsable del sitio y las condiciones de uso del contenido para adultos.
              </p>
            </div>
          </section>

          <section id="privacidad" className="px-4 py-6 border-t border-red-950 bg-black">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wide">Política de Privacidad</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Describe qué datos recoges, con qué finalidad, plazo de conservación y cómo ejercer derechos sobre los datos.
              </p>
            </div>
          </section>

          <section id="cookies" className="px-4 py-6 border-t border-red-950 bg-black">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wide">Política de Cookies</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Indica qué cookies usas, su finalidad, duración y cómo el usuario puede gestionarlas o revocar su consentimiento.
              </p>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="text-center px-4 py-4 border-t border-red-950 bg-black text-xs text-gray-400">
          <p className="mb-1">
            &copy; {year} Nyxara. Todos los derechos reservados. Solo para mayores de 18 años.
          </p>
          <p className="flex justify-center gap-3 flex-wrap">
            <a href="#legal" className="hover:text-red-500 transition-colors">Aviso legal</a>
            <span>·</span>
            <a href="#privacidad" className="hover:text-red-500 transition-colors">Privacidad</a>
            <span>·</span>
            <a href="#cookies" className="hover:text-red-500 transition-colors">Cookies</a>
          </p>
        </footer>
      </div>
    </>
  );
}
