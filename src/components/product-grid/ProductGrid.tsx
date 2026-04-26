import { memo, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Coffee, Search, Sparkles } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "./ProductCard"
import { SkeletonCard } from "./SkeletonCard"
import { cn } from "@/utils/utils"

const PREFERRED_CATEGORIES = ["Coffee", "Tea", "Bakery"] as const

const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export const ProductGrid = memo(() => {
  const { loading, products, fetchProducts } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const debouncedSearch = useDebouncedValue(searchTerm, 300)

  useEffect(() => {
    fetchProducts({ page: 1, limit: 200 }).catch(() => undefined)
  }, [fetchProducts])

  const availableCategories = useMemo(() => {
    const normalized = new Set(
      products
        .map((item) => item.categoryName?.trim())
        .filter(Boolean)
        .map((value) => String(value)),
    )

    const preferred = PREFERRED_CATEGORIES.filter((item) => normalized.has(item))
    const rest = Array.from(normalized).filter(
      (item) => !PREFERRED_CATEGORIES.includes(item as (typeof PREFERRED_CATEGORIES)[number]),
    )
    return ["All", ...preferred, ...rest]
  }, [products])

  const filteredProducts = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase()
    return products.filter((product) => {
      const byCategory = activeCategory === "All" || product.categoryName === activeCategory
      if (!byCategory) return false
      if (!search) return true
      return (
        product.name.toLowerCase().includes(search) || product.categoryName.toLowerCase().includes(search)
      )
    })
  }, [products, activeCategory, debouncedSearch])

  const filterKey = `${activeCategory}-${debouncedSearch}`

  return (
    <section className="min-h-full bg-[#f8f7f4] p-4 dark:bg-[#121212] md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        <div className="space-y-2">
          <h2
            className="text-3xl text-stone-800 dark:text-stone-100"
            style={{ fontFamily: "ui-serif, Georgia, Cambria, serif" }}
          >
            Curated Menu
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Discover premium drinks and bakery favorites with smooth, app-like interactions.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search coffee, tea, bakery..."
              className="h-10 w-full rounded-full border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-orange-300 dark:border-stone-700 dark:bg-[#1e1e1e] dark:text-stone-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition duration-300",
                  activeCategory === category
                    ? "bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filterKey}
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants} layout>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    categoryName={product.categoryName}
                    price={product.price}
                    imageUrl={product.imageUrl}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/80 p-10 text-center dark:border-stone-700 dark:bg-[#1e1e1e]">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <h3 className="mt-3 text-lg text-stone-800 dark:text-stone-200">Nothing found</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Try a different keyword or clear your current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setActiveCategory("All")
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-800 transition hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-900/60"
            >
              <Coffee className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        ) : null}
      </motion.div>
    </section>
  )
})
