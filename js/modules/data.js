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

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export function getComments() {
  return JSON.parse(localStorage.getItem('comments'));
}

export function getUsers() {
  return JSON.parse(localStorage.getItem('users'));
}
