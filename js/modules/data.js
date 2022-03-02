export async function getCurrentUserData() {
  const response = await fetch('data.json');
  const data = await response.json();
  return data.currentUser;
}

export async function getCommentsData() {
  const response = await fetch('data.json');
  const data = await response.json();
  return data.comments;
}