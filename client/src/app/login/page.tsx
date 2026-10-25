import React from 'react'
import Navbar from '@/components/Navbar'
import AuthPanel from '@/components/AuthPanel'
import ProductPreview from '@/components/ProductPreview'

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="min-h-[calc(100vh-76px)] flex items-center">
        <div className="container-page w-full flex">
          <AuthPanel />
          <ProductPreview src="/product-shot.png" alt="Sana AI Product Screenshot" />
        </div>
      </main>
    </div>
  )
}
