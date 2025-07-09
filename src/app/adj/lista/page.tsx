"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "@/firebase/config";
import { get, ref, remove, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Inscricao {
    id: string;
    nome: string;
    idade: number;
    telefone: string;
    cidade: string;
    papel: string;
    equipe: string;
    caravana: string;
    caravanaConfirmado?: boolean;
}

export default function ListaInscricoesPage() {
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            const roleSnap = await get(ref(database, `usuarios_web/${user.uid}/role`));
            if (roleSnap.exists()) setUserRole(roleSnap.val());

            const snap = await get(ref(database, "inscricoes_adj"));
            if (snap.exists()) {
                const data = snap.val();
                const lista = Object.entries(data).map(([id, valor]) => ({
                    id,
                    ...(valor as Omit<Inscricao, "id">),
                }));
                setInscricoes(lista);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const excluirInscricao = async (id: string) => {
        const confirmar = confirm("Tem certeza que deseja excluir esta inscrição?");
        if (!confirmar) return;

        await remove(ref(database, `inscricoes_adj/${id}`));
        setInscricoes((prev) => prev.filter((item) => item.id !== id));
    };

    const gerarPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Lista de Inscritos – Desperta Jovem", 14, 20);

        const data = inscricoes.map((item, index) => [
            index + 1,
            item.nome,
            item.idade,
            item.telefone,
            item.cidade,
            item.papel,
            item.equipe,
            item.caravana === "sim" ? (item.caravanaConfirmado ? "Sim - OK" : "Sim") : "Não",
        ]);

        autoTable(doc, {
            head: [["#", "Nome", "Idade", "Telefone", "Cidade", "Papel", "Equipe", "Caravana"]],
            body: data,
            startY: 30,
        });

        doc.save("inscritos_desperta_jovem.pdf");
    };

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-xl md:text-2xl font-bold text-[#264D73] mb-2">
                📋 Lista de Inscritos – Desperta Jovem
            </h1>

            {(userRole === "admin" || userRole === "moderador") && (
                <button
                    onClick={gerarPDF}
                    className="mb-4 bg-[#264D73] text-white px-4 py-2 rounded hover:bg-[#1b3552] cursor-pointer"
                >
                    📄 Gerar PDF da Lista
                </button>
            )}

            {!loading && inscricoes.length > 0 && (
                <p className="mb-4 text-sm text-gray-600">
                    Total de inscritos: <span className="font-semibold">{inscricoes.length}</span>
                </p>
            )}

            {loading ? (
                <p>Carregando...</p>
            ) : inscricoes.length === 0 ? (
                <p>Nenhuma inscrição encontrada.</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full table-auto text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Nome</th>
                                <th className="p-2 border">Idade</th>
                                <th className="p-2 border">Telefone</th>
                                <th className="p-2 border">Cidade</th>
                                <th className="p-2 border">Papel</th>
                                <th className="p-2 border">Equipe</th>
                                <th className="p-2 border">Caravana</th>
                                {(userRole === "admin" || userRole === "moderador") && (
                                    <th className="p-2 border">Ações</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {inscricoes.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-2">{item.nome}</td>
                                    <td className="p-2">{item.idade}</td>
                                    <td className="p-2">{item.telefone}</td>
                                    <td className="p-2">{item.cidade}</td>
                                    <td className="p-2 capitalize">{item.papel}</td>
                                    <td className="p-2 capitalize">{item.equipe}</td>
                                    <td className="p-2">
                                        {item.caravana === "sim" ? (
                                            <div className="flex flex-col gap-1">
                                                <span>
                                                    Sim –{" "}
                                                    <a
                                                        href="https://chat.whatsapp.com/IQqrzH8l6bR2W1DE13JuOG?mode=ac_t"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        Entrar no grupo
                                                    </a>
                                                </span>

                                                {(userRole === "admin" || userRole === "moderador") && (
                                                    <button
                                                        onClick={async () => {
                                                            const novoValor = !item.caravanaConfirmado;
                                                            await update(ref(database, `inscricoes_adj/${item.id}`), {
                                                                caravanaConfirmado: novoValor,
                                                            });
                                                            setInscricoes((prev) =>
                                                                prev.map((i) =>
                                                                    i.id === item.id ? { ...i, caravanaConfirmado: novoValor } : i
                                                                )
                                                            );
                                                        }}
                                                        className={`text-xs px-2 py-1 rounded font-semibold ${item.caravanaConfirmado
                                                            ? "bg-green-100 text-green-700 border border-green-300 cursor-pointer"
                                                            : "bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-pointer"
                                                            }`}
                                                    >
                                                        {item.caravanaConfirmado ? "✅ Confirmado" : "Marcar OK"}
                                                    </button>
                                                )}

                                                {item.caravanaConfirmado && (
                                                    <span className="text-green-600 text-xs">💰 Pagamento confirmado</span>
                                                )}
                                            </div>
                                        ) : (
                                            "Não"
                                        )}
                                    </td>
                                    {(userRole === "admin" || userRole === "moderador") && (
                                        <td className="p-2 flex gap-3 justify-start text-gray-600">
                                            <FaEdit
                                                title="Editar"
                                                className="cursor-pointer hover:text-yellow-600"
                                                onClick={() => router.push(`/adj/editar/${item.id}`)}
                                            />
                                            <FaTrash
                                                title="Excluir"
                                                className="cursor-pointer hover:text-red-600"
                                                onClick={() => excluirInscricao(item.id)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
