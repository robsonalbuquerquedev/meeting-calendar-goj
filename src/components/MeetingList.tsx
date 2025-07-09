"use client";

import { useEffect, useState } from "react";
import { ref, get, remove, onValue } from "firebase/database";
import { database } from "@/firebase/config";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";

type Meeting = {
    theme: string;
    preacher?: string;
    location?: string;
};

type MeetingEntry = {
    date: string;
    data: Meeting;
};

export default function MeetingList() {
    const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const roleRef = ref(database, `usuarios_web/${user.uid}/role`);
                onValue(roleRef, (snapshot) => {
                    const role = snapshot.val();
                    setIsAdmin(role === "admin" || role === "moderador");
                });
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        const encontrosRef = ref(database, "encontros");
        const snapshot = await get(encontrosRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const formatted: MeetingEntry[] = Object.keys(data).map((date) => ({
                date,
                data: data[date],
            }));

            formatted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setMeetings(formatted);
        }

        setLoading(false);
    };

    const handleDelete = async (date: string) => {
        const confirmDelete = window.confirm(`Tem certeza que deseja excluir o encontro do dia ${format(new Date(date), "dd/MM/yyyy")}?`);
        if (!confirmDelete) return;

        await remove(ref(database, `encontros/${date}`));
        fetchMeetings();
    };

    const handleEdit = (date: string) => {
        router.push(`/admin?data=${date}`);
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#264D73]">📅 Lista de Encontros</h2>

            {loading ? (
                <p>🔄 Carregando encontros...</p>
            ) : meetings.length === 0 ? (
                <p className="text-gray-600">Nenhum encontro cadastrado até agora.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm sm:text-base">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-2 border-b">Data</th>
                                <th className="p-2 border-b">Tema</th>
                                <th className="p-2 border-b">Pregador</th>
                                <th className="p-2 border-b">Local</th>
                                {isAdmin && <th className="p-2 border-b text-center">Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.map(({ date, data }, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-2 whitespace-nowrap">{format(new Date(date), "dd/MM/yyyy")}</td>
                                    <td className="p-2">{data.theme}</td>
                                    <td className="p-2">{data.preacher || "—"}</td>
                                    <td className="p-2">{data.location || "—"}</td>
                                    {isAdmin && (
                                        <td className="p-2 flex gap-2 justify-center text-lg">
                                            <button
                                                onClick={() => handleEdit(date)}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                title="Editar Encontro"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(date)}
                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                                title="Excluir Encontro"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
