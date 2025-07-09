"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "@/firebase/config";
import { get, ref, update } from "firebase/database";
import { useCallback } from "react";

interface Inscricao {
    nome: string;
    idade: string;
    telefone: string;
    cidade: string;
    papel: string;
    equipe: string;
    caravana: string;
}

export default function EditarInscricaoPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [dados, setDados] = useState<Inscricao>({
        nome: "",
        idade: "",
        telefone: "",
        cidade: "",
        papel: "",
        equipe: "",
        caravana: "",
    });

    const carregarDados = useCallback(async () => {
        if (!params?.id) return;

        const refInscricao = ref(database, `inscricoes_adj/${params.id}`);
        const snap = await get(refInscricao);

        if (snap.exists()) {
            setDados(snap.val());
        }

        setLoading(false);
    }, [params?.id]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            const roleRef = ref(database, `usuarios_web/${user.uid}/role`);
            const roleSnap = await get(roleRef);
            const role = roleSnap.exists() ? roleSnap.val() : "";

            if (role === "admin" || role === "moderador") {
                setIsAuthorized(true);
                carregarDados(); // agora está seguro usar aqui
            } else {
                router.push("/");
            }
        });

        return () => unsubscribe();
    }, [router, carregarDados]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDados({ ...dados, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const refInscricao = ref(database, `inscricoes_adj/${params.id}`);
        await update(refInscricao, dados);
        router.push("/adj/lista");
    };

    if (loading) return <p className="p-4">Carregando...</p>;
    if (!isAuthorized) return null;

    return (
        <main className="p-6 max-w-xl mx-auto bg-white shadow rounded mt-6">
            <h1 className="text-xl font-bold text-[#264D73] mb-4">✏️ Editar Inscrição</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="nome" value={dados.nome} onChange={handleChange} required className="input" placeholder="Nome completo" />
                <input name="idade" value={dados.idade} onChange={handleChange} required className="input" placeholder="Idade" />
                <input name="telefone" value={dados.telefone} onChange={handleChange} required className="input" placeholder="Telefone" />

                <input name="cidade" value={dados.cidade} onChange={handleChange} required className="input" placeholder="Cidade" />

                <select name="papel" value={dados.papel} onChange={handleChange} className="input" required>
                    <option value="">Selecione o papel</option>
                    <option value="participante">Participante</option>
                    <option value="servo">Servo</option>
                </select>

                <select name="equipe" value={dados.equipe} onChange={handleChange} className="input" required>
                    <option value="">Equipe</option>
                    <option value="vermelha">Vermelha</option>
                    <option value="azul">Azul</option>
                    <option value="verde">Verde</option>
                    <option value="laranja">Laranja</option>
                    <option value="sem_equipe">Não tem</option>
                </select>

                <select name="caravana" value={dados.caravana} onChange={handleChange} className="input" required>
                    <option value="">Vai com a caravana do GOJ?</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                </select>

                <button type="submit" className="bg-[#264D73] text-white px-4 py-2 rounded hover:bg-[#1b3552] cursor-pointer">
                    Salvar Alterações
                </button>
            </form>
        </main>
    );
}
