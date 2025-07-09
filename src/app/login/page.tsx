"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResetSent(false);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch {
            setError("Credenciais inválidas");
        }
    };

    const handlePasswordReset = async () => {
        setError(null);
        setResetSent(false);
        if (!email) {
            setError("Por favor, insira seu email para resetar a senha.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
        } catch {
            setError("Erro ao enviar email de redefinição.");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-md p-6 rounded-lg flex flex-col gap-4 w-full max-w-sm"
            >
                <h2 className="text-xl font-bold text-[#264D73]">🔐 Login</h2>

                {error && <p className="text-red-600 font-semibold">{error}</p>}
                {resetSent && (
                    <p className="text-green-600 font-semibold">
                        Email de redefinição enviado! Verifique sua caixa de entrada.
                    </p>
                )}

                <label className="flex flex-col">
                    Email:
                    <input
                        type="email"
                        placeholder="Email"
                        className="border px-3 py-2 rounded mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label className="relative flex flex-col">
                    Senha:
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        className="border px-3 py-2 rounded mt-1 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-9 text-gray-600 hover:text-gray-900 cursor-pointer"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </label>

                <button
                    type="submit"
                    className="bg-[#264D73] text-white py-2 rounded hover:bg-[#1b3552] cursor-pointer"
                >
                    Entrar
                </button>

                <div className="flex justify-between items-center text-sm mt-2">
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Esqueci minha senha
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/cadastro")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Não tem conta? Cadastre-se
                    </button>
                </div>
            </form>
        </main>
    );
}
