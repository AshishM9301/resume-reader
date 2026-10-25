import React from 'react'

interface ProductPreviewProps {
  src?: string
  alt: string
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  src = '/product-shot.png',
  alt
}) => {
  return (
    <div className="flex-1 flex items-center">
      <div className="w-full h-[520px] rounded-[16px] bg-[var(--panel)] relative overflow-hidden border border-white/[0.06]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default ProductPreview