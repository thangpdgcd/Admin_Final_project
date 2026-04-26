import { memo, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useCartUiStore } from "@/store/cartUiStore"
import { ProductBadge } from "./ProductBadge"

interface ProductCardProps {
  id: string
  name: string
  categoryName: string
  price: number
  imageUrl?: string
}

const getProductBadgeType = (name: string, price: number): "bestSeller" | "new" | null => {
  if (name.trim().toLowerCase() === "butter croissant") {
    return "new"
  }
  if (price > 35000) {
    return "bestSeller"
  }
  return null
}

const animateFlyToCart = (imageEl: HTMLImageElement | null, targetEl: HTMLElement | null) => {
  if (!imageEl || !targetEl) return

  const from = imageEl.getBoundingClientRect()
  const to = targetEl.getBoundingClientRect()
  const clone = imageEl.cloneNode(true) as HTMLImageElement

  clone.style.position = "fixed"
  clone.style.left = `${from.left}px`
  clone.style.top = `${from.top}px`
  clone.style.width = `${from.width}px`
  clone.style.height = `${from.height}px`
  clone.style.borderRadius = "14px"
  clone.style.pointerEvents = "none"
  clone.style.zIndex = "9999"
  clone.style.objectFit = "cover"
  clone.style.willChange = "transform, opacity"

  document.body.appendChild(clone)

  const deltaX = to.left + to.width / 2 - (from.left + from.width / 2)
  const deltaY = to.top + to.height / 2 - (from.top + from.height / 2)

  const animation = clone.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
      { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.35)`, opacity: 0.1 },
    ],
    {
      duration: 600,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  )

  animation.onfinish = () => {
    clone.remove()
  }
}

export const ProductCard = memo(({ id, name, categoryName, price, imageUrl }: ProductCardProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const addOne = useCartUiStore((state) => state.addOne)
  const badgeType = getProductBadgeType(name, price)

  const handleAddToCart = useCallback(() => {
    const cartTarget = document.getElementById("header-cart-target")
    animateFlyToCart(imageRef.current, cartTarget)
    addOne()
  }, [addOne])

  return (
    <motion.article
      layout
      key={id}
      whileHover={{ y: -6, boxShadow: "0 14px 35px rgba(28, 25, 23, 0.12)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#1e1e1e]"
    >
      <div className="relative overflow-hidden rounded-xl">
        {badgeType ? (
          <div className="absolute left-3 top-3 z-10">
            <ProductBadge type={badgeType} />
          </div>
        ) : null}
        <img
          ref={imageRef}
          src={imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"}
          alt={name}
          className="aspect-square w-full rounded-xl object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {categoryName || "Uncategorized"}
        </p>
        <h3
          className="line-clamp-2 text-lg text-stone-800 dark:text-stone-200"
          style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
        >
          {name}
        </h3>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-semibold text-orange-700 dark:text-orange-300">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(price)}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleAddToCart}
          className="rounded-full bg-orange-100 p-2 text-orange-800 transition duration-300 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-900/60"
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingBag className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  )
})
