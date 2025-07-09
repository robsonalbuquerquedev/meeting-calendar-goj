"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await set(ref(database, `usuarios_web/${user.uid}`), {
                name,
                email,
                role: "user",
            });

            router.push("/");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro ao criar conta");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4"
            >
                <h1 className="text-2xl font-bold text-[#264D73] mb-4">Criar Conta</h1>

                {error && <p className="text-red-600 font-semibold">{error}</p>}

                <label>
                    Nome:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </label>

                <label className="relative">
                    Senha:
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border px-3 py-2 rounded pr-10"
                        required
                        minLength={6}
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
                    disabled={loading}
                    className="bg-[#264D73] text-white py-2 rounded hover:bg-[#1b3552] cursor-pointer"
                >
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>

                <p className="mt-4 text-center text-gray-600">
                    Já tem conta?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Faça login aqui
                    </button>
                </p>
            </form>
        </main>
    );
}
