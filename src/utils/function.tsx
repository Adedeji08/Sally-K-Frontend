export function signOut() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("referralCode");
  localStorage.removeItem("userDetails");
}