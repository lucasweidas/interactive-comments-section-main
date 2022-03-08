const checkbox = document.querySelector('#switch-input');
const isDarkMode = localStorage.getItem('dark-mode');

if (isDarkMode === 'true') {
  checkbox.checked = true;
  document.body.classList.add('dark-mode');
} else {
  document.body.classList.remove('dark-mode');
}
