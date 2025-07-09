"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, push } from "firebase/database";

export default function AdjFormPage() {
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        nome: "",
        idade: "",
        telefone: "",
        cidade: "Ribeirão",
        papel: "participante",
        equipe: "nenhuma",
        caravana: "nao",
    });
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/login");
            } else {
                setUser(firebaseUser);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        await push(ref(database, "inscricoes_adj"), {
            ...formData,
            uid: user.uid,
            email: user.email,
        });

        setSuccess(true);
        setFormData({
            nome: "",
            idade: "",
            telefone: "",
            cidade: "Ribeirão",
            papel: "participante",
            equipe: "nenhuma",
            caravana: "nao",
        });
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <main className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
            <h1 className="text-xl font-bold text-[#264D73] mb-4">Acampamento Desperta Jovem</h1>
            <p className="mb-4 text-gray-600">
                Se você já confirmou sua inscrição, preencha os dados abaixo para completar sua participação no Acampamento Desperta Jovem.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="nome" placeholder="Nome completo" value={formData.nome} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                <input type="number" name="idade" placeholder="Idade" value={formData.idade} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
                <input type="tel" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />

                <input type="text" name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />

                <select name="papel" value={formData.papel} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                    <option value="participante">Participante</option>
                    <option value="servo">Servo</option>
                </select>

                <select name="equipe" value={formData.equipe} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                    <option value="vermelha">Equipe Vermelha</option>
                    <option value="azul">Equipe Azul</option>
                    <option value="verde">Equipe Verde</option>
                    <option value="laranja">Equipe Laranja</option>
                    <option value="nenhuma">Sem equipe</option>
                </select>

                <select name="caravana" value={formData.caravana} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                    <option value="sim">Vai com a caravana do GOJ</option>
                    <option value="nao">Não vai com a caravana</option>
                </select>

                <button type="submit" className="bg-[#264D73] text-white px-4 py-2 rounded w-full hover:bg-[#1b3552] cursor-pointer">
                    Enviar Inscrição
                </button>
            </form>
            {success && <p className="text-green-600 mt-4 font-semibold text-center">✅ Inscrição enviada com sucesso!</p>}
        </main>
    );
}
