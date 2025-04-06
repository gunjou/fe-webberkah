export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // true jika token ada
};
