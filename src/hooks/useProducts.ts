import { useCallback, useState } from "react";
import { productService, type ProductEntity, type ProductPayload, type ProductQueryParams } from "@/services/product.service";
import { getErrorMessage } from "@/lib/errorUtils";

export interface ProductRow {
  key: string;
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl?: string;
  imageCandidates: string[];
  createdAt: string;
  raw: ProductEntity;
}

function extractStringImageValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim().replace(/\\/g, "/");
    return normalized || undefined;
  }

  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const objectValue =
      candidate.url ||
      candidate.secure_url ||
      candidate.path ||
      candidate.image ||
      candidate.imageUrl ||
      candidate.imageCover;
    if (typeof objectValue === "string") {
      const normalized = objectValue.trim().replace(/\\/g, "/");
      return normalized || undefined;
    }
  }

  return undefined;
}

function resolveProductImageCandidates(product: ProductEntity): string[] {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const origin = apiBase.replace(/\/api$/i, "");

  const rawCandidates: unknown[] = [
    product.image,
    product.imageCover,
    product.imageUrl,
    ...(Array.isArray(product.images) ? product.images : []),
  ];

  const resolved = new Set<string>();

  for (const rawCandidate of rawCandidates) {
    const image = extractStringImageValue(rawCandidate);
    if (!image) continue;

    const looksLikeRawBase64 = /^[A-Za-z0-9+/=]+$/.test(image) && image.length > 80;
    if (looksLikeRawBase64) {
      resolved.add(`data:image/jpeg;base64,${image}`);
      continue;
    }

    if (/^https?:\/\//i.test(image) || image.startsWith("data:")) {
      resolved.add(image);
      continue;
    }

    const normalizedPath = image.startsWith("/") ? image : `/${image}`;
    if (origin) resolved.add(`${origin}${normalizedPath}`);
    if (apiBase) resolved.add(`${apiBase}${normalizedPath}`);

    const looksLikeFilename = !image.includes("/") && /\.[a-z0-9]+$/i.test(image);
    if (looksLikeFilename && origin) {
      resolved.add(`${origin}/uploads/${image}`);
      resolved.add(`${origin}/uploads/products/${image}`);
    }
  }

  return Array.from(resolved);
}

function mapProductToRow(product: ProductEntity): ProductRow {
  const id = String(
    (product as ProductEntity & { id?: string; productId?: string | number; productsId?: string | number })._id ||
      (product as ProductEntity & { id?: string; productId?: string | number; productsId?: string | number }).id ||
      (product as ProductEntity & { id?: string; productId?: string | number; productsId?: string | number }).productId ||
      (product as ProductEntity & { id?: string; productId?: string | number; productsId?: string | number }).productsId ||
      ""
  );
  const name = product.name || product.title || "";
  const stock = product.stock ?? product.quantity ?? 0;
  const imageCandidates = resolveProductImageCandidates(product);
  return {
    key: id || `product-${name}-${product.createdAt || Date.now()}`,
    id,
    name,
    categoryName: product.category?.name || "",
    price: product.price || 0,
    stock,
    imageUrl: imageCandidates[0],
    imageCandidates,
    createdAt: product.createdAt,
    raw: product,
  };
}

export function useProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (params: ProductQueryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getAll(params);
      setProducts(result.items.map(mapProductToRow));
      setTotal(result.total);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload: ProductPayload) => {
    await productService.create(payload);
  }, []);

  const updateProduct = useCallback(async (id: string, payload: ProductPayload) => {
    await productService.update(id, payload);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await productService.remove(id);
  }, []);

  return {
    loading,
    error,
    products,
    total,
    refetch: fetchProducts,
    actions: {
      fetch: fetchProducts,
      create: createProduct,
      update: updateProduct,
      delete: deleteProduct,
    },
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
