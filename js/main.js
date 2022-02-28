import * as data from './modules/data.js';
import * as form from './modules/form.js';
import * as event from './modules/event.js';

const allCommentCon = document.querySelector('#comments-con');
const formPost = document.querySelector('#form-post');
const deleteCommentCon = document.querySelector('.del-comment-con');
const del = {};
const post = {};

function getPostContainer(evt) {
  // return evt.target.parentElement.parentElement.parentElement;
  return evt.target.closest('.post-con');
}

// const currentUserData = (async () => {
//   return await data.getCurrentUserData();
// })();

// document.addEventListener('DOMContentLoaded', () => {
//   if ('content' in document.createElement('template')) {
//     console.log('sim');
//   } else {
//     console.log('não');
//   }
// });

allCommentCon.addEventListener('click', evt => {
  // Delete Button
  const isDeleteBtn = evt.target.classList.contains('options__del-btn');
  if (isDeleteBtn) {
    del.comment = getPostContainer(evt);
    del.commentParent = del.comment.parentElement;
    return deleteCommentCon.classList.add('active');
  }

  // Reply Button
  const isReplyBtn = evt.target.classList.contains('options__reply-btn');
  if (isReplyBtn) {
    const postContainer = getPostContainer(evt);
    const repliesCon = postContainer.querySelector('.replies');
    const replyingTo = postContainer.querySelector('.user-text__name').innerText;

    if (repliesCon == null) {
      (async () => {
        const userData = await data.getCurrentUserData();
        post.reply = form.addFormReplyComment(userData, replyingTo, true);
        postContainer.appendChild(post.reply.repliesSection);
      })();
      return;
    }

    const hasForm = [...repliesCon.children].find(ele => ele.matches('.form-container'));
    if (hasForm) return;

    (async () => {
      const userData = await data.getCurrentUserData();
      post.reply = form.addFormReplyComment(userData, replyingTo, false);
      repliesCon.appendChild(post.reply.formReplyClone);
    })();
    return;
  }
});

allCommentCon.addEventListener('submit', evt => {
  evt.preventDefault();

  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');

  // Post Reply Button
  const isPostReplyBtn = evt.submitter.dataset.postReply;
  if (isPostReplyBtn !== undefined) {
    const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
    const textArea = formCon.querySelector('.form__txtarea');

    (async () => {
      const userData = await data.getCurrentUserData();
      const postContainer = form.newPostComment(userData, textArea.value);
      repliesCon.removeChild(formCon);
      repliesCon.appendChild(postContainer);
    })();
    return;
  }

  // Cancel Reply Button
  const isCancelReplyBtn = evt.submitter.dataset.cancelReply;
  if (isCancelReplyBtn !== undefined) {
    const hasReplies = repliesCon.querySelector('.replies > .post-con');

    if (hasReplies) {
      const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
      return repliesCon.removeChild(formCon);
    }
    return postContainer.removeChild(repliesCon);
  }
});

formPost.addEventListener('submit', evt => {
  evt.preventDefault();

  const textArea = formPost.querySelector('.form__txtarea');

  (async () => {
    const userData = await data.getCurrentUserData();
    const postContainer = form.newPostComment(userData, textArea.value, true);
    allCommentCon.appendChild(postContainer);
    textArea.value = '';
  })();
});

deleteCommentCon.addEventListener('click', evt => {
  if (evt.target === deleteCommentCon || evt.target.id === 'cancel-del-comment') {
    return deleteCommentCon.classList.remove('active');
  }

  if (evt.target.id === 'confirm-del-comment') {
    del.commentParent.removeChild(del.comment);
    return deleteCommentCon.classList.remove('active');
  }
});
