export async function getCurrentUserData() {
  const response = await fetch('data.json');
  const userData = await response.json();
  return userData;
}