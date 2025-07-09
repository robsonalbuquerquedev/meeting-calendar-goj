"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "@/firebase/config";
import { get, ref, update } from "firebase/database";
import { FaUserShield, FaUserMinus } from "react-icons/fa";

interface Usuario {
    uid: string;
    name: string;
    email: string;
    role: string;
}

export default function PainelAdmin() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            const roleRef = ref(database, `usuarios_web/${user.uid}/role`);
            const nameRef = ref(database, `usuarios_web/${user.uid}/name`);

            const [roleSnap, nameSnap] = await Promise.all([
                get(roleRef),
                get(nameRef),
            ]);

            if (nameSnap.exists()) setUserName(nameSnap.val());

            if (roleSnap.exists() && roleSnap.val() === "admin") {
                setIsAdmin(true);
                fetchUsuarios();
            } else {
                router.push("/");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchUsuarios = async () => {
        const usersRef = ref(database, "usuarios_web");
        const snap = await get(usersRef);

        if (snap.exists()) {
            const data = snap.val();
            const lista: Usuario[] = Object.entries(data).map(
                ([uid, valor]: any) => ({
                    uid,
                    name: valor.name || "(sem nome)",
                    email: valor.email,
                    role: valor.role || "usuario",
                })
            );

            setUsuarios(lista);
        }
        setLoading(false);
    };

    const mudarRole = async (uid: string, novaRole: string) => {
        await update(ref(database, `usuarios_web/${uid}`), {
            role: novaRole,
        });
        fetchUsuarios();
    };

    if (!isAdmin) return null;

    return (
        <main className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-[#264D73]">
                    👑 Painel do Administrador
                </h1>
                {userName && (
                    <p className="text-sm text-gray-600 mt-2 md:mt-0">
                        Olá, <span className="font-semibold">{userName}</span>!
                    </p>
                )}
            </div>

            {loading ? (
                <p>Carregando usuários...</p>
            ) : (
                <div className="overflow-x-auto rounded-md">
                    <table className="w-full min-w-[600px] table-auto border border-gray-200 bg-white text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border text-left">Nome</th>
                                <th className="p-3 border text-left">Email</th>
                                <th className="p-3 border text-left">Papel</th>
                                <th className="p-3 border text-left">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((user) => (
                                <tr key={user.uid} className="border-t">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 capitalize">{user.role}</td>
                                    <td className="p-3 flex space-x-2">
                                        {user.role === "usuario" && (
                                            <button
                                                onClick={() => mudarRole(user.uid, "moderador")}
                                                title="Tornar Moderador"
                                                className="text-green-600 hover:text-green-800 cursor-pointer"
                                            >
                                                <FaUserShield size={20} />
                                            </button>
                                        )}
                                        {user.role === "moderador" && (
                                            <button
                                                onClick={() => mudarRole(user.uid, "usuario")}
                                                title="Rebaixar para Usuário"
                                                className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                                            >
                                                <FaUserMinus size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
