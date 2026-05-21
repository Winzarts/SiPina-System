export function hitungStatus(jumlah, kondisi = "baik") {
  const k = kondisi ? kondisi.toLowerCase() : "baik";
  if (k === "rusak" || k === "hilang") {
    return "dipinjam";
  }
  if (jumlah <= 0) {
    return "dipinjam";
  }
  return "tersedia";
}
