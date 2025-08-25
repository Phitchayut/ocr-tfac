import "./globals.css";
export const metadata = {
title: 'Thai ID OCR',
description: 'Next14 + Vision OCR (TH)',
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="th">
<body className="min-h-dvh bg-gray-50 text-gray-900">
{children}
</body>
</html>
)
}