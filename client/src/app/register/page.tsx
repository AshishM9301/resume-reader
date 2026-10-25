import React from 'react'
import Navbar from '@/components/Navbar'
import RegisterPanel from '@/components/RegisterPanel'
import ProductPreview from '@/components/ProductPreview'

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="min-h-[calc(100vh-76px)] flex items-center">
        <div className="container-page w-full flex">
          <RegisterPanel />
          <ProductPreview src="/product-shot.png" alt="Sana AI Product Screenshot" />
        </div>
      </main>
    </div>
  )
}
