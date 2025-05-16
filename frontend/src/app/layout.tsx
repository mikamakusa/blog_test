import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
    title: "Multilingual Blog",
    description: "A blog with multiple language support",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}