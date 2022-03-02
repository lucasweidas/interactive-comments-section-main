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
  const repliesCon = getPostContainer(evt).querySelector('.replies');
  const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
  const textArea = formCon.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const postContainer = form.newComment(userData, textArea.value);

  repliesCon.removeChild(formCon);
  repliesCon.appendChild(postContainer);
}

// Will remove the "reply form" and the reply comment will not be saved
export function cancelNewReplyComment(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');
  const formCon = getDirectChild(repliesCon, '.form-container');

  repliesCon.removeChild(formCon);

  // If the Replies Section has no children, hide it
  if (repliesCon.children.length === 0) repliesCon.classList.add('hidden');
}

// Will change the previous comment text to the new text and remove the "edit form"
export function postUpdatedComment(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');
  const textareaValue = formUpdate.querySelector('.form__txtarea').value;
  const newCommentText = form.processCommentText(textareaValue);

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
  if (getDirectChild(repliesCon, '.form-container') === undefined) {
    const formReplyClone = form.addFormReplyComment(userData, replyingTo);

    repliesCon.appendChild(formReplyClone);
    repliesCon.classList.remove('hidden');
  }
}

// This will register both "Up" or "Down" Votes
export function registerVote(evt, isUpVote) {
  const rateCon = evt.target.closest('.rate');
  const rateScore = rateCon.querySelector('.rate__score');
  let actualScore = parseInt(rateScore.dataset.rateScore);

  // Setting the new "integer" value for the attribute [data-rate-score]
  rateScore.dataset.rateScore = isUpVote ? ++actualScore : --actualScore;
  // Setting the new formated value that will be displayed
  rateScore.innerText = form.formatCommentScore(actualScore);
}

export async function loadComments() {
  const allCommentCon = document.querySelector('#comments-con');
  const userData = await data.getCurrentUserData();
  const commentsData = await data.getCommentsData();

  // If "localStorage" doesn't have any data about "currentUser" and "commnets", then create it
  if (!localStorage.getItem('currentUser') && !localStorage.getItem('comments')) {
    createLocalStorage(userData, commentsData);
  }

  commentsData.forEach(commentData => {
    const parent = form.loadCreatedComments(userData, commentData);
    const repliesCon = parent.querySelector('.replies');

    if (commentData.replies.length > 0) {
      commentData.replies.forEach(replyData => {
        repliesCon.appendChild(form.loadCreatedComments(userData, replyData, true));
      });
      repliesCon.classList.remove('hidden');
    }

    allCommentCon.appendChild(parent);
  });
}

// Will create a new space and store the datas on the "localStorage"
function createLocalStorage(userData, commentsData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('comments', JSON.stringify(commentsData));
}
