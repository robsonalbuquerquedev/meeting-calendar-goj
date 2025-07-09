"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, database } from "@/firebase/config";
import { get, ref, onValue } from "firebase/database";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModerator, setIsModerator] = useState(false);
    const [userName, setUserName] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const roleRef = ref(database, `usuarios_web/${user.uid}/role`);
                const nameRef = ref(database, `usuarios_web/${user.uid}/name`);

                onValue(nameRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserName(snapshot.val());
                    } else {
                        setUserName("");
                    }
                });

                const roleSnap = await get(roleRef);
                if (roleSnap.exists()) {
                    const role = roleSnap.val();
                    setIsAdmin(role === "admin");
                    setIsModerator(role === "moderador");
                }
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
                setIsModerator(false);
                setUserName("");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const navLinkClass = (path: string) =>
        pathname === path ? "text-blue-600 font-semibold underline" : "";

    return (
        <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-lg font-bold text-[#264D73]">
                🗓️ Encontros Jovens
            </Link>

            <div className="md:hidden">
                <button onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
                </button>
            </div>

            <nav
                className={`flex-col md:flex md:flex-row items-start md:items-center gap-4 text-sm
  ${menuOpen ? "flex" : "hidden"} 
  md:flex 
  absolute md:static top-[70px] left-0 w-full md:w-auto 
  bg-white md:bg-transparent 
  px-6 py-4 md:p-0 
  shadow md:shadow-none z-10`}
            >
                <Link href="/" className={navLinkClass("/")}>🏠 Início</Link>

                {!isLoggedIn && (
                    <>
                        <Link href="/login" className={`${navLinkClass("/login")} block py-2`}>Login</Link>
                        <Link href="/cadastro" className={`${navLinkClass("/cadastro")} block py-2`}>Cadastro</Link>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <Link
                            href="https://galeria-dos-santos.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            Galeria dos Santos
                        </Link>
                        <Link href="/encontros/lista" className={navLinkClass("/encontros/lista")} title="Encontros">
                            📅 Ver Encontros
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                className={`${navLinkClass("/adj")} px-2 py-1 text-[#264D73] hover:bg-gray-100 rounded flex items-center gap-1 cursor-pointer`}
                                onClick={() => router.push("/adj")}
                                title="Área ADJ"
                            >
                                🙋 ADJ
                            </button>
                            <Link
                                href="/adj/lista"
                                className="p-2 rounded hover:bg-gray-100 text-[#264D73]"
                                title="Ver Inscritos"
                            >
                                📋 ver Inscritos
                            </Link>
                        </div>
                        <Link href="/perfil" className={navLinkClass("/perfil")} title="Perfil">👤 Perfil</Link>
                        {(isAdmin || isModerator) && (
                            <Link href="/admin" className={navLinkClass("/admin")} title="Adicionar Encontro">
                                ➕ Salvar Evento
                            </Link>
                        )}
                        {isAdmin && (
                            <Link href="/painelAdmin" className={navLinkClass("/painelAdmin")} title="Painel Admin">
                                🛠️ Painel Admin
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-red-600 hover:underline cursor-pointer"
                            title="Sair"
                        >
                            🚪 Sair
                        </button>
                    </>
                )}
            </nav>

            {isLoggedIn && (
                <div className="hidden md:block text-sm text-[#264D73] ml-4">
                    👋 Olá, {userName || "usuário"}!
                </div>
            )}
        </header>
    );
}
