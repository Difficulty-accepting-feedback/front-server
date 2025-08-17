'use client'

import React from 'react'
import SideNav from '@/components/ui/SideNav'

export default function MeLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="fixed inset-0 -z-10 bg-grow pointer-events-none" aria-hidden />
            <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                <aside className="md:sticky md:top-20 h-max">
                    <SideNav />
                </aside>
                <section className="min-h-[60vh]">
                    {children}
                </section>
            </div>
        </>
    )
}