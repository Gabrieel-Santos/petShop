export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getUserRole = (): number | null => {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.autoridade;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem("token");
};
