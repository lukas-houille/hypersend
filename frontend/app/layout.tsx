import './globals.css'

export default function Layout({
                                   children,
                               }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full bg-white">
        <body className="h-full">
        {children}
        </body>
        </html>
    )
}