import useCartAPI from "../hooks/useCartAPI";

export default function ProductCard({ product }) {
  const { addToCart } = useCartAPI();

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <div className="border p-4 rounded shadow">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.type}</p>
      <p className="font-bold">Rp {product.price.toLocaleString()}</p>
      <button
        onClick={handleAdd}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Tambah ke Keranjang
      </button>
    </div>
  );
}
