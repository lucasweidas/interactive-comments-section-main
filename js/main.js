import * as event from './modules/event.js';

const mainCon = document.querySelector('#main');
const deleteCommentCon = document.querySelector('.del-comment-con');
const headerCon = document.querySelector('#header');
const del = {};

// When the HTML parsing is done, do this
document.addEventListener('DOMContentLoaded', async () => {
  const hasUser = localStorage.getItem('currentUser');
  const hasUsers = localStorage.getItem('users');
  const hasId = localStorage.getItem('availableId');
  const hasComments = localStorage.getItem('comments');
  // If the "LocalStorage" does not have one of the data
  if (!hasUser && !hasUsers && !hasId && !hasComments) {
    await event.createLocalStorage();
  }

  event.changeTheme(localStorage.darkMode);
  event.loadLoginCards();
  event.loadComments();
  event.loadFormPost();
});

// Main Container
// "Click" Event Delegation
mainCon.addEventListener('click', evt => {
  // If it's a Delete Comment Button
  const isDeleteBtn = evt.target.matches('.options__del-btn');
  if (isDeleteBtn) {
    del.postCon = evt.target.closest('.post-con');
    del.postConParent = del.postCon.parentElement;
    return deleteCommentCon.classList.add('active');
  }

  // If it's a Edit Comment Button
  const isEditBtn = evt.target.matches('.options__edit-btn');
  if (isEditBtn) return event.createNewEditForm(evt);

  // If it's a Reply Comment Button
  const isReplyBtn = evt.target.matches('.options__reply-btn');
  if (isReplyBtn) return event.createNewReplyForm(evt);

  // If it's a Up Vote Button
  const isUpVoteBtn = evt.target.matches('.up-vote-btn');
  if (isUpVoteBtn) return event.registerUpVote(evt);

  // If it's a Down Vote Button
  const isDownVoteBtn = evt.target.matches('.down-vote-btn');
  if (isDownVoteBtn) return event.registerDownVote(evt);
});

// Main Container
// "Submit" Event Delegation
mainCon.addEventListener('submit', evt => {
  evt.preventDefault();

  // If it's a Post Reply Comment Button
  const isPostReplyBtn = evt.submitter.hasAttribute('data-post-reply');
  if (isPostReplyBtn) return event.createNewReplyComment(evt);

  // If it's a Cancel Reply Comment Button
  const isCancelReplyBtn = evt.submitter.hasAttribute('data-cancel-reply');
  if (isCancelReplyBtn) return event.cancelNewReplyComment(evt);

  // If it's a Post Updated Comment Button
  const isPostUpdateBtn = evt.submitter.hasAttribute('data-post-update');
  if (isPostUpdateBtn) return event.postUpdatedComment(evt);

  // If it's a Cancel Update Comment Button
  const isCancelUpdateBtn = evt.submitter.hasAttribute('data-cancel-update');
  if (isCancelUpdateBtn) return event.cancelUpdateComment(evt);

  // If it is the Send Comment Button
  const isSendBtn = evt.submitter.hasAttribute('data-send');
  if (isSendBtn) return event.createNewPostComment(evt);
});

// Confirm Delete Comment Overlay Container
// "Click" Event Delegation
deleteCommentCon.addEventListener('click', evt => {
  // If it is the Overlay Container or the Button Cancel Delete Comment
  if (evt.target === deleteCommentCon || evt.target.id === 'cancel-del-comment') {
    return deleteCommentCon.classList.remove('active');
  }

  // If it is the Button Confirm Delete Comment
  if (evt.target.id === 'confirm-del-comment') {
    event.deleteComment(del.postCon);
    del.postConParent.removeChild(del.postCon);
    const containerLength = del.postConParent.children.length;

    if (del.postConParent.matches('.replies') && containerLength === 0) {
      del.postConParent.classList.add('hidden');
    }
    return deleteCommentCon.classList.remove('active');
  }
});

// Header Container
// "Click" Event Delegation
headerCon.addEventListener('click', evt => {
  if (evt.target.matches('#switch-input')) {
    event.changeTheme(evt.target.checked.toString());
  }

  // If it is the Menu Button
  if (evt.target.matches('#menu-btn')) {
    headerCon.classList.toggle('active');

    const isActive = headerCon.classList.contains('active');
    evt.target.ariaExpanded = isActive;

    if (isActive) return (evt.target.ariaLabel = 'Close User Menu');
    return (evt.target.ariaLabel = 'Open User Menu');
  }

  // If it is a Login Button that is "not" that of the Current User
  if (evt.target.matches('.login:not([data-logged]) .login-button')) {
    return event.changeCurrentUser(evt);
  }
});
