// app/perfil/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, database } from "@/firebase/config";

export default function PerfilPage() {
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // 🔒 Protege a rota e carrega os dados do usuário
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/login"); // Redireciona se não estiver logado
            } else {
                setUser(firebaseUser);

                const userRef = ref(database, `usuarios_web/${firebaseUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setDisplayName(data.nome || "");
                }

                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSave = async () => {
        if (!user) return;

        const userRef = ref(database, `usuarios_web/${user.uid}`);
        await set(userRef, {
            name: displayName,
            email: user.email,
            role: "usuario" // mantém o papel atual
        });

        await updateProfile(user, { displayName });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    if (loading) return <p className="p-4">Carregando...</p>;

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold text-[#264D73] mb-4">👤 Meu Perfil</h2>

                <label className="block mb-4">
                    <span className="text-gray-700">Nome:</span>
                    <input
                        type="text"
                        className="mt-1 w-full border rounded px-3 py-2"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </label>

                <label className="block mb-6">
                    <span className="text-gray-700">Email (não editável):</span>
                    <input
                        type="email"
                        className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                        value={user?.email}
                        disabled
                    />
                </label>

                <button
                    onClick={handleSave}
                    className="bg-[#264D73] text-white px-4 py-2 rounded hover:bg-[#1b3552] w-full cursor-pointer"
                >
                    Salvar Alterações
                </button>

                {success && (
                    <p className="text-green-600 mt-4 font-semibold text-center">
                        ✅ Perfil atualizado com sucesso!
                    </p>
                )}
            </div>
        </main>
    );
}
