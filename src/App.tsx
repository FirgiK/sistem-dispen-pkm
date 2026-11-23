import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkConnection() {
      try {
        // Melakukan ping autentikasi ringan ke Supabase
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setStatus("connected");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Gagal terhubung");
      }
    }
    checkConnection();
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-900 text-white flex
        items-center justify-center p-4"
    >
      <div
        className="bg-slate-800 p-6 rounded-xl shadow-lg
          max-w-md w-full border border-slate-700 text-center"
      >
        <h1 className="text-xl font-bold mb-4">Status Koneksi Supabase</h1>

        {status === "checking" && (
          <p className="text-yellow-400 font-medium">
            Sedang mencoba menghubungkan...
          </p>
        )}

        {status === "connected" && (
          <div
            className="p-3 bg-emerald-950/60 border
              border-emerald-500/50 rounded-lg text-emerald-400"
          >
            ✅ <strong>Terhubung Sempurna!</strong>
            <p className="text-xs mt-1 text-slate-300">
              URL dan Anon Key valid.
            </p>
          </div>
        )}

        {status === "error" && (
          <div
            className="p-3 bg-rose-950/60 border
              border-rose-500/50 rounded-lg text-rose-400"
          >
            ❌ <strong>Gagal Terhubung</strong>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
