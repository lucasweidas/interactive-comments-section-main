import * as form from './form.js';
import * as data from './data.js';

// Will get the direct (closest) Post Container ancestor of the "target"
function getPostContainer(evt) {
  return evt.target.closest('.post-con');
}

// Checks if the "element" has a direct "child" with the specified "selector" and returns it
function getDirectChild(element, selector) {
  return [...element.children].find(child => child.matches(selector));
}

function getRepliesSection(postCon) {
  const repliesCon = postCon.querySelector('.replies');
  if (repliesCon === null) {
    return postCon.closest('.replies');
  }
  return repliesCon;
}

function getCommentId(element) {
  return element.closest('.post-con').dataset.commentId;
}

// Will create a NEW comment and add it to the root of the comments container
export async function createNewPostComment(evt) {
  const allCommentCon = document.querySelector('#comments-con');
  const textArea = evt.currentTarget.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const postContainer = form.newComment(userData, textArea.value);

  allCommentCon.appendChild(postContainer);
  textArea.value = '';
}

// It will create and add a new reply comment to the comment and remove the "reply form"
export async function createNewReplyComment(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = getRepliesSection(postContainer);
  const commentId = getCommentId(repliesCon);
  const formCon = getDirectChild(postContainer, '.form-container');
  const textArea = formCon.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const newPostContainer = form.newComment(userData, textArea.value, commentId);

  postContainer.removeChild(formCon);
  repliesCon.appendChild(newPostContainer);
  repliesCon.classList.remove('hidden');
}

// Will remove the "reply form" and the reply comment will not be saved
export function cancelNewReplyComment(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = getRepliesSection(postContainer);
  const formCon = getDirectChild(postContainer, '.form-container');

  postContainer.removeChild(formCon);
  // If the Replies Section has no children, hide it
  if (repliesCon.children.length === 0) repliesCon.classList.add('hidden');
}

// Will change the previous comment text to the new text and remove the "edit form"
export function postUpdatedComment(evt) {
  const postContainer = getPostContainer(evt);
  const commentId = postContainer.dataset.commentId;
  const commentContentCon = postContainer.querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');
  const textareaValue = formUpdate.querySelector('.form__txtarea').value;
  const newCommentText = form.processCommentText(textareaValue);

  form.saveUpdatedComment(commentId, textareaValue);
  commentParagraph.innerHTML = newCommentText;
  commentContentCon.removeChild(formUpdate);
  commentParagraph.classList.remove('hidden');
}

// Will remove the "edit form" and discard all changes to the comment text
export function cancelUpdateComment(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');

  commentContentCon.removeChild(formUpdate);
  commentParagraph.classList.remove('hidden');
}

// Will add a "edit form" if the comment does not already have one
export function createNewEditForm(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');

  // If the Comment Content Container does not have an Edit Form
  if (getDirectChild(commentContentCon, '.form-container') === undefined) {
    const commentParagraph = commentContentCon.querySelector('p');
    const commentText = commentParagraph.innerText;
    const updateFormCon = form.addEditForm(commentText);

    commentParagraph.classList.add('hidden');
    commentContentCon.appendChild(updateFormCon);
  }
}

// Will add a "reply form" if the comment does not already have one
export async function createNewReplyForm(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');
  const replyingTo = postContainer.querySelector('.user-text__name').innerText;
  const userData = await data.getCurrentUserData();

  // If the Replies Section does not have an Reply Form
  if (getDirectChild(postContainer, '.form-container') === undefined) {
    const formReplyClone = form.addFormReplyComment(userData, replyingTo);

    postContainer.insertBefore(formReplyClone, repliesCon);
  }
}

// This will register both "Up" or "Down" Votes
export function registerVote(evt, isUpVote) {
  const comments = data.getComments();
  const correctComment = getCorrectComment(comments, getCommentId(evt.target));
  const rateCon = evt.target.closest('.rate');
  const rateScore = rateCon.querySelector('.rate__score');
  let actualScore = parseInt(correctComment.score);

  // Set the new score value for the comment and save it
  correctComment.score = isUpVote ? ++actualScore : --actualScore;
  localStorage.setItem('comments', JSON.stringify(comments));

  // Sets the new formatted score value that will be displayed
  rateScore.innerText = form.formatCommentScore(correctComment.score);
}

export async function loadComments() {
  // If "localStorage" doesn't have any data about "currentUser" and "commnets", then create it
  if (!localStorage.getItem('currentUser') && !localStorage.getItem('comments')) {
    const userData = await data.getCurrentUserData();
    const commentsData = await data.getCommentsData();
    createLocalStorage(userData, commentsData);
  }

  const allCommentCon = document.querySelector('#comments-con');
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  const commentsData = JSON.parse(localStorage.getItem('comments'));

  commentsData.forEach(commentData => {
    const postContainer = form.loadCreatedComments(userData, commentData);
    const repliesCon = postContainer.querySelector('.replies');

    if (commentData.replies.length > 0) {
      commentData.replies.forEach(replyData => {
        repliesCon.appendChild(form.loadCreatedComments(userData, replyData, true));
      });
      repliesCon.classList.remove('hidden');
    }
    allCommentCon.appendChild(postContainer);
  });
}

// Will create a new space and store the datas on the "localStorage"
function createLocalStorage(userData, commentsData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('availableId', 5);
  localStorage.setItem('comments', JSON.stringify(commentsData));
}

function getCorrectComment(comments, commentId) {
  let correctComment;

  comments.forEach(comment => {
    if (comment.id == commentId) {
      correctComment = comment;
    }
    comment.replies.forEach(reply => {
      if (reply.id == commentId) {
        correctComment = reply;
      }
    });
  });
  return correctComment;
}
