import * as data from './modules/data.js';
import * as form from './modules/form.js';
import * as event from './modules/event.js';

const allCommentCon = document.querySelector('#comments-con');
const formPost = document.querySelector('#form-post');
const deleteCommentCon = document.querySelector('.del-comment-con');
const del = {},
  post = {};

function getPostContainer(evt) {
  return evt.target.parentElement.parentElement.parentElement;
}

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
    const postCon = getPostContainer(evt);
    const repliesCon = postCon.querySelector('.replies');
    const replyingTo = postCon.querySelector('.user-text__name').innerText;

    if (repliesCon == null) {
      post.reply = form.newReplyComment(replyingTo, true);
      return postCon.appendChild(post.reply.repliesSection);
    }

    const hasForm = [...repliesCon.children].find(ele => ele.matches('.form-container'));
    if (hasForm) return;

    post.reply = form.newReplyComment(replyingTo, false);
    return repliesCon.appendChild(post.reply.containerDiv);
  }
});

allCommentCon.addEventListener('submit', evt => {
  evt.preventDefault();

  const postCon = getPostContainer(evt);
  const repliesCon = postCon.querySelector('.replies');

  // Post Reply Button
  const isPostReplyBtn = evt.submitter.dataset.postReply;
  if (isPostReplyBtn !== undefined) {
    const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
    const textArea = formCon.querySelector('.form__txtarea');
    // const text = "@RayFranco is answering to @AnPel, this is a real '@username83' but this is an@email.com, and this is a @probablyfaketwitterusername";

    (async () => {
      const allData = await data.getCurrentUserData();
      const postContainer = form.newPostComment(allData.currentUser, textArea.value);
      repliesCon.removeChild(formCon);
      repliesCon.appendChild(postContainer);
    })();
    return;
  }

  // Cancel Reply Button
  const isCancelReplyBtn = evt.submitter.dataset.cancelReply;
  if (isCancelReplyBtn !== undefined) {
    // const postCon = getPostContainer(evt);
    // const repliesCon = postCon.querySelector('.replies');
    const hasReplies = repliesCon.querySelector('.replies > .post-con');

    if (hasReplies) {
      const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
      return repliesCon.removeChild(formCon);
    }
    return postCon.removeChild(repliesCon);
  }
});

formPost.addEventListener('submit', evt => {
  evt.preventDefault();

  const textArea = document.querySelector('.form__txtarea');

  (async () => {
    const allData = await data.getCurrentUserData();
    const postContainer = form.newPostComment(allData.currentUser, textArea.value);
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
