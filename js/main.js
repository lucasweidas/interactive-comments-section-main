import * as event from './modules/event.js';

const allCommentCon = document.querySelector('#comments-con');
const formPost = document.querySelector('#form-post');
const deleteCommentCon = document.querySelector('.del-comment-con');
const del = {};

// Will be called if any clicks occur within it
allCommentCon.addEventListener('click', evt => {
  const isDeleteBtn = evt.target.matches('.options__del-btn');
  // If it's a Delete Comment Button
  if (isDeleteBtn) {
    del.postCon = evt.target.closest('.post-con');
    del.postConParent = del.postCon.parentElement;
    return deleteCommentCon.classList.add('active');
  }

  const isEditBtn = evt.target.matches('.options__edit-btn');
  // If it's a Edit Comment Button
  if (isEditBtn) return event.createNewEditForm(evt);

  const isReplyBtn = evt.target.matches('.options__reply-btn');
  // If it's a Reply Comment Button
  if (isReplyBtn) return event.createNewReplyForm(evt);

  const isUpVoteBtn = evt.target.matches('.up-vote-btn');
  if (isUpVoteBtn) return event.registerUpVote(evt);

  const isDownVoteBtn = evt.target.matches('.down-vote-btn');
  if (isDownVoteBtn) return event.registerDownVote(evt);
});

// It will be called if any FORM within it is "submitted"
allCommentCon.addEventListener('submit', evt => {
  evt.preventDefault();

  const isPostReplyBtn = evt.submitter.hasAttribute('data-post-reply');
  // If it's a Post Reply Comment Button
  if (isPostReplyBtn) return event.createNewReplyComment(evt);

  const isCancelReplyBtn = evt.submitter.hasAttribute('data-cancel-reply');
  // If it's a Cancel Reply Comment Button
  if (isCancelReplyBtn) return event.cancelNewReplyComment(evt);

  const isPostUpdateBtn = evt.submitter.hasAttribute('data-post-update');
  // If it's a Post Updated Comment Button
  if (isPostUpdateBtn) return event.postUpdatedComment(evt);

  const isCancelUpdateBtn = evt.submitter.hasAttribute('data-cancel-update');
  // If it's a Cancel Update Comment Button
  if (isCancelUpdateBtn) return event.cancelUpdateComment(evt);
});

// Form "Send" New Comment
formPost.addEventListener('submit', evt => {
  evt.preventDefault();
  event.createNewPostComment(evt);
});

// The Confirm Delete Comment Overlay Container
deleteCommentCon.addEventListener('click', evt => {
  // If it is the Overlay Container or the Button Cancel Delete Comment
  if (evt.target === deleteCommentCon || evt.target.id === 'cancel-del-comment') {
    return deleteCommentCon.classList.remove('active');
  }

  // If it is the Button Confirm Delete Comment
  if (evt.target.id === 'confirm-del-comment') {
    del.postConParent.removeChild(del.postCon);
    return deleteCommentCon.classList.remove('active');
  }
});
