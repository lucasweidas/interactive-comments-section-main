import * as data from './modules/data.js';
import * as form from './modules/form.js';
import * as event from './modules/event.js';

const allCommentCon = document.querySelector('#comments-con');
const formPost = document.querySelector('#form-post');
const deleteCommentCon = document.querySelector('.del-comment-con');
const del = {};
const post = {};

// Get the direct (closest) Post Container ancestor of the "target"
function getPostContainer(evt) {
  return evt.target.closest('.post-con');
}

// Checks if the "element" has any Form Container as a direct child
function hasForm(element) {
  return [...element.children].find(ele => ele.matches('.form-container'));
}

// Will be called if any clicks occur within it
allCommentCon.addEventListener('click', async evt => {
  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');

  const isDeleteBtn = evt.target.matches('.options__del-btn');
  // If it's a Delete Button
  if (isDeleteBtn) {
    del.comment = postContainer;
    del.commentParent = del.comment.parentElement;
    return deleteCommentCon.classList.add('active');
  }

  const isEditBtn = evt.target.matches('.options__edit-btn');
  // If it's a Edit Button
  if (isEditBtn) {
    const commentContentCon = postContainer.querySelector('.comment-content');
    // If the Comment Content Container does not have an Edit Form
    if (hasForm(commentContentCon) === undefined) {
      const commentParagraph = commentContentCon.querySelector('p');
      const commentText = commentParagraph.innerText;
      const updateFormCon = form.addEditForm(commentText);

      commentParagraph.style.display = 'none';
      return commentContentCon.appendChild(updateFormCon);
    }
  }

  const isReplyBtn = evt.target.matches('.options__reply-btn');
  // If it's a Reply Button
  if (isReplyBtn) {
    // const repliesCon = postContainer.querySelector('.replies');
    const replyingTo = postContainer.querySelector('.user-text__name').innerText;
    const userData = await data.getCurrentUserData();

    // If the Comment does not have any Reply Comment
    if (repliesCon == null) {
      post.reply = form.addFormReplyComment(userData, replyingTo, true);
      return postContainer.appendChild(post.reply.repliesSection);
    }

    // If the Replies Section does not have an Reply Form
    if (hasForm(repliesCon) === undefined) {
      post.reply = form.addFormReplyComment(userData, replyingTo, false);
      return repliesCon.appendChild(post.reply.formReplyClone);
    }
  }
});

// It will be called if any FORM within it is "submitted"
allCommentCon.addEventListener('submit', async evt => {
  evt.preventDefault();

  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');

  const isPostReplyBtn = evt.submitter.dataset.postReply;
  // If it's a Post Reply Button
  if (isPostReplyBtn !== undefined) {
    const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
    const textArea = formCon.querySelector('.form__txtarea');
    const userData = await data.getCurrentUserData();
    const postContainer = form.newPostComment(userData, textArea.value);

    repliesCon.removeChild(formCon);
    return repliesCon.appendChild(postContainer);
  }

  const isCancelReplyBtn = evt.submitter.dataset.cancelReply;
  // If it's a Cancel Reply Comment Button
  if (isCancelReplyBtn !== undefined) {
    const hasReplies = repliesCon.querySelector('.post-con');
    // If the Replies Section has at least one Reply Comment
    if (hasReplies) {
      const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
      return repliesCon.removeChild(formCon);
    }

    // If the Replies Section does not have any Reply Comment
    return postContainer.removeChild(repliesCon);
  }

  const commentContentCon = postContainer.querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');

  const isPostUpdateBtn = evt.submitter.dataset.postUpdate;
  // If it's a Post Update Comment Button
  if (isPostUpdateBtn !== undefined) {
    const textareaValue = formUpdate.querySelector('.form__txtarea').value;
    const newCommentText = form.processCommentText(textareaValue);

    commentParagraph.innerHTML = newCommentText;
  }

  const isCancelUpdateBtn = evt.submitter.dataset.cancelUpdate;
  // If it's a Cancel Update Comment Button or an Post Update Comment Button
  if (isCancelUpdateBtn !== undefined || isPostUpdateBtn !== undefined) {
    commentContentCon.removeChild(formUpdate);
    return (commentParagraph.style.display = 'block');
  }
});

// Form "Send" New Comment
formPost.addEventListener('submit', async evt => {
  evt.preventDefault();

  const textArea = formPost.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const postContainer = form.newPostComment(userData, textArea.value, true);

  allCommentCon.appendChild(postContainer);
  textArea.value = '';
});

deleteCommentCon.addEventListener('click', evt => {
  // If it is the Overlay Container or the Button Cancel Delete Comment
  if (evt.target === deleteCommentCon || evt.target.id === 'cancel-del-comment') {
    return deleteCommentCon.classList.remove('active');
  }

  // If it is the Button Confirm Delete Comment
  if (evt.target.id === 'confirm-del-comment') {
    del.commentParent.removeChild(del.comment);
    return deleteCommentCon.classList.remove('active');
  }
});
