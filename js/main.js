const formPost = document.querySelector('.form-post');
const btnsDeleteComment = document.querySelectorAll('.options__del-btn');
const deleteCommentCon = document.querySelector('.del-comment-con');

formPost.addEventListener('submit', evt => {
  evt.preventDefault();
});

btnsDeleteComment.forEach(button => {
  button.addEventListener('click', () => {
    deleteCommentCon.style.display = 'flex';
  });
});

deleteCommentCon.addEventListener('click', evt => {
  if (evt.target === deleteCommentCon || evt.target.id === 'cancel-del-comment') {
    deleteCommentCon.style.display = 'none';
  }
});
