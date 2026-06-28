import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage, googleProvider } from "./firebase";

import introImg from "@assets/Intro_Nyxara_1782602425752.jpeg";
import logoImg from "@assets/Logo_Nyxara_1782602425752.jpeg";
import womenImg from "@assets/Foto_Atraer_Mujeres_1782602425751.jpg";
import menImg from "@assets/Foto_Atraer_Hombres_1782602425751.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoDoc {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbUrl?: string;
  uploadedBy: string;
  displayName: string;
  views: number;
  createdAt: { seconds: number } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
  return `hace ${Math.floor(diff / 604800)} semanas`;
}

const GRADIENTS = [
  "from-red-900 via-black to-red-950",
  "from-rose-900 via-black to-gray-900",
  "from-red-800 via-gray-900 to-black",
  "from-gray-900 via-red-900 to-black",
  "from-black via-red-950 to-rose-900",
  "from-red-950 via-black to-gray-900",
];

// ─── Nav Links ────────────────────────────────────────────────────────────────

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
        <img
          src={introImg}
          alt="Nyxara"
          className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-2 border-red-700"
        />
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

type AuthMode = "login" | "register";

interface AuthErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  showToggle,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;
  return (
    <div>
      <label className="block text-xs text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-[#050505] border rounded text-white text-sm outline-none focus:border-red-600 transition-colors pr-${showToggle ? "10" : "3"} ${error ? "border-red-500" : "border-[#444]"}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs transition-colors select-none"
          >
            {visible ? "Ocultar" : "Ver"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function AuthModal({ onClose, defaultMode = "login" }: { onClose: () => void; defaultMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<AuthErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function switchMode(m: AuthMode) {
    setMode(m);
    setErrors({});
    setSuccess(false);
  }

  function validate(): AuthErrors {
    const e: AuthErrors = {};
    if (mode === "register") {
      if (!username.trim()) e.username = "El nombre de usuario es obligatorio.";
      else if (username.trim().length < 3) e.username = "Mínimo 3 caracteres.";
      else if (username.trim().length > 30) e.username = "Máximo 30 caracteres.";
    }
    if (!email.trim()) e.email = "El correo es obligatorio.";
    else if (!email.includes("@") || !email.includes(".")) e.email = "Introduce un correo válido.";
    if (!password) e.password = "La contraseña es obligatoria.";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (mode === "register") {
      if (!confirm) e.confirm = "Confirma tu contraseña.";
      else if (confirm !== password) e.confirm = "Las contraseñas no coinciden.";
    }
    return e;
  }

  function firebaseError(code: string): string {
    switch (code) {
      case "auth/user-not-found": return "No existe una cuenta con ese correo.";
      case "auth/wrong-password": return "Contraseña incorrecta.";
      case "auth/invalid-credential": return "Correo o contraseña incorrectos.";
      case "auth/email-already-in-use": return "Ese correo ya tiene una cuenta. Inicia sesión.";
      case "auth/weak-password": return "La contraseña es demasiado débil.";
      case "auth/too-many-requests": return "Demasiados intentos. Espera un momento.";
      case "auth/network-request-failed": return "Error de red. Comprueba tu conexión.";
      default: return "Ocurrió un error. Inténtalo de nuevo.";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onClose();
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: username.trim() });
        setSuccess(true);
        setTimeout(onClose, 1800);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setErrors({ general: firebaseError(code) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setErrors({});
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setErrors({ general: code === "auth/popup-closed-by-user" ? "Cerraste la ventana de Google." : "No se pudo iniciar sesión con Google." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[900] bg-black/85 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#111] rounded-lg p-6 animate-modal-in relative my-auto">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-700 text-white rounded-full w-7 h-7 text-lg flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          ×
        </button>

        {/* Logo */}
        <div className="text-center mb-4">
          <span className="text-red-600 font-bold text-xl tracking-widest uppercase">Nyxara</span>
          <p className="text-gray-500 text-xs mt-0.5">
            {mode === "login" ? "Bienvenido/a de vuelta" : "Crea tu cuenta gratuita"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0a0a0a] rounded-lg p-0.5 mb-5">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === "login" ? "bg-red-700 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === "register" ? "bg-red-700 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2 px-4 rounded border border-[#444] bg-[#0a0a0a] text-white text-sm hover:border-red-700 hover:bg-red-700/10 transition-all mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative text-center text-xs text-gray-600 my-4">
          <span className="bg-[#111] px-3 relative z-10">o con correo electrónico</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#2a2a2a]" />
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2 mb-3">
            {errors.general}
          </div>
        )}

        {/* Éxito registro */}
        {success && (
          <div className="text-xs text-green-400 bg-green-900/20 border border-green-800 rounded px-3 py-2 mb-3 text-center">
            ✓ ¡Cuenta creada! Bienvenido/a a Nyxara.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {mode === "register" && (
            <InputField
              label="Nombre de usuario"
              value={username}
              onChange={setUsername}
              placeholder="Tu nombre en Nyxara"
              error={errors.username}
            />
          )}

          <InputField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tucorreo@example.com"
            error={errors.email}
          />

          <InputField
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            showToggle
          />

          {mode === "register" && (
            <InputField
              label="Confirmar contraseña"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repite tu contraseña"
              error={errors.confirm}
              showToggle
            />
          )}

          {mode === "register" && (
            <p className="text-xs text-gray-500 leading-relaxed">
              Al crear una cuenta aceptas nuestros{" "}
              <a href="#legal" onClick={onClose} className="text-red-500 hover:underline">términos de uso</a>
              {" "}y confirmas que eres mayor de 18 años.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-sm transition-all hover:-translate-y-0.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading
              ? (mode === "login" ? "Entrando…" : "Creando cuenta…")
              : (mode === "login" ? "Entrar" : "Crear cuenta")}
          </button>

          {mode === "login" && (
            <p className="text-center text-xs text-gray-500">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-red-500 hover:underline font-medium"
              >
                Regístrate gratis
              </button>
            </p>
          )}
          {mode === "register" && (
            <p className="text-center text-xs text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-red-500 hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
          )}
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

// ─── Video Player Modal ───────────────────────────────────────────────────────

function VideoModal({ video, onClose }: { video: VideoDoc; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[900] bg-black/90 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl animate-modal-in">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-700 text-white rounded-full w-7 h-7 text-lg flex items-center justify-center hover:bg-red-600 transition-colors z-10"
        >
          ×
        </button>
        <video
          src={video.url}
          controls
          autoPlay
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: "70vh" }}
        />
        <div className="mt-3 px-1">
          <h3 className="text-white font-semibold">{video.title}</h3>
          {video.description && (
            <p className="text-gray-400 text-sm mt-1">{video.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Subido por {video.displayName}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────

function UploadForm({ user }: { user: User | null }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<{ title?: string; desc?: string; file?: string; auth?: string }>({});
  const [progress, setProgress] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setErrors({ auth: "Debes iniciar sesión para subir videos." });
      return;
    }

    const newErrors: typeof errors = {};
    const file = fileRef.current?.files?.[0];
    if (!title.trim()) newErrors.title = "El título es obligatorio.";
    if (desc.length > 500) newErrors.desc = "Máximo 500 caracteres.";
    if (!file) {
      newErrors.file = "Selecciona un archivo de video.";
    } else {
      const allowed = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowed.includes(file.type)) newErrors.file = "Formato no permitido. Usa MP4, WEBM u OGG.";
      else if (file.size > 500 * 1024 * 1024) newErrors.file = "Demasiado grande (máx. 500 MB).";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length || !file) return;

    setProgress(0);
    setSuccess(false);

    try {
      // Subir video a Storage
      const videoRef = ref(storage, `videos/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(videoRef, file);

      uploadTask.on(
        "state_changed",
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          console.error(err);
          setErrors({ file: "Error al subir el archivo. Inténtalo de nuevo." });
          setProgress(null);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Subir miniatura si hay
          let thumbUrl = "";
          const thumbFile = thumbRef.current?.files?.[0];
          if (thumbFile) {
            const tRef = ref(storage, `thumbs/${Date.now()}_${thumbFile.name}`);
            const tSnap = await new Promise<{ ref: typeof tRef }>((res, rej) =>
              uploadBytesResumable(tRef, thumbFile).on("state_changed", () => {}, rej, () => res({ ref: tRef }))
            );
            thumbUrl = await getDownloadURL(tSnap.ref);
          }

          // Guardar metadata en Firestore
          await addDoc(collection(db, "videos"), {
            title: title.trim(),
            description: desc.trim(),
            url,
            thumbUrl,
            uploadedBy: user.uid,
            displayName: user.displayName ?? user.email ?? "Usuario",
            views: 0,
            createdAt: serverTimestamp(),
          });

          setProgress(null);
          setSuccess(true);
          setTitle("");
          setDesc("");
          if (fileRef.current) fileRef.current.value = "";
          if (thumbRef.current) thumbRef.current.value = "";
        }
      );
    } catch (err) {
      console.error(err);
      setErrors({ file: "Error al subir. Inténtalo de nuevo." });
      setProgress(null);
    }
  }

  return (
    <section id="subir" className="px-4 py-8 border-t border-red-950 bg-black">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-red-600 mb-5 uppercase tracking-wide">Subir Video</h2>

        {errors.auth && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2 mb-4">
            {errors.auth}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded px-3 py-2 mb-4">
            ✓ Video subido correctamente. Aparecerá en el feed en breve.
          </p>
        )}

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
            <label className="block text-sm text-gray-300 mb-1">Archivo de video (MP4, WEBM u OGG)</label>
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
              ref={thumbRef}
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#333] file:text-white file:text-sm file:cursor-pointer hover:file:bg-[#444]"
            />
          </div>

          {progress !== null && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Subiendo…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#222] rounded overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={progress !== null}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded text-sm transition-all hover:-translate-y-0.5 border border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {progress !== null ? `Subiendo ${progress}%…` : "Subir video"}
            </button>
            {!user && (
              <p className="text-xs text-gray-500 mt-2">Debes iniciar sesión para subir videos.</p>
            )}
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
  const [videoModal, setVideoModal] = useState<VideoDoc | null>(null);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Firestore listener — videos en tiempo real
  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setVideos(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VideoDoc, "id">) }))
      );
      setLoadingVideos(false);
    }, () => setLoadingVideos(false));
    return unsub;
  }, []);

  const filtered = search.trim()
    ? videos.filter((v) => v.title.toLowerCase().includes(search.trim().toLowerCase()))
    : videos;

  const year = new Date().getFullYear();

  return (
    <>
      {!entered && <AgeGate onEnter={() => setEntered(true)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {imageModal && (
        <ImageModal src={imageModal.src} alt={imageModal.alt} onClose={() => setImageModal(null)} />
      )}
      {videoModal && (
        <VideoModal video={videoModal} onClose={() => setVideoModal(null)} />
      )}

      <div
        className={`min-h-screen flex flex-col transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* ── Topbar ── */}
        <header className="flex items-center justify-between px-4 py-2 bg-black border-b-2 border-red-700 sticky top-0 z-50">
          <a href="#inicio" className="flex-shrink-0">
            <img
              src={introImg}
              alt="Nyxara"
              className="h-10 w-10 rounded-full object-cover border border-red-700"
            />
          </a>

          <form className="flex flex-1 max-w-lg mx-4" onSubmit={(e) => e.preventDefault()}>
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

          {user ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[120px]">
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-white text-xs font-semibold rounded transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex-shrink-0 px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded transition-colors"
            >
              Iniciar sesión
            </button>
          )}
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

          {/* ── Feed de Videos ── */}
          <section id="mejor" className="px-4 pb-8">
            <h2 className="text-lg font-bold text-red-600 mb-4 uppercase tracking-wide">
              {search.trim() ? `Resultados para "${search}"` : "Videos recomendados"}
            </h2>

            {loadingVideos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#111] rounded overflow-hidden animate-pulse">
                    <div className="h-28 bg-[#1a1a1a]" />
                    <div className="p-2">
                      <div className="h-3 bg-[#222] rounded mb-2 w-4/5" />
                      <div className="h-2 bg-[#1a1a1a] rounded w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 text-sm py-12 text-center">
                {videos.length === 0
                  ? "Todavía no hay videos. ¡Sube el primero!"
                  : "No se encontraron videos."}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map((video, i) => (
                  <article
                    key={video.id}
                    onClick={() => setVideoModal(video)}
                    className="bg-[#111] rounded overflow-hidden cursor-pointer group transition-all hover:-translate-y-1"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 14px rgba(204,0,0,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div className={`relative h-28 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                      {video.thumbUrl && (
                        <img
                          src={video.thumbUrl}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-black/70 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {video.views.toLocaleString()} vistas ·{" "}
                        {video.createdAt ? timeAgo(video.createdAt.seconds) : "reciente"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Image CTA ── */}
          <section id="imagenes" className="text-center px-4 py-8 border-t border-red-950">
            <h2 className="text-lg font-bold text-red-600 mb-5 uppercase tracking-wide">
              Explora tus deseos
            </h2>
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
          <UploadForm user={user} />

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
