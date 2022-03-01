import * as form from './form.js';
import * as data from './data.js';

// Will get the direct (closest) Post Container ancestor of the "target"
function getPostContainer(evt) {
  return evt.target.closest('.post-con');
}

// Checks if the "element" has the container element with the specified "selector" as a direct child and returns it
function getDirectChild(element, selector) {
  return [...element.children].find(ele => ele.matches(selector));
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
  const hasReplies = getDirectChild(repliesCon, '.post-con');

  // If the Replies Section has at least one Reply Comment
  if (hasReplies) {
    const formCon = getDirectChild(repliesCon, '.form-container');
    return repliesCon.removeChild(formCon);
  }

  // If the Replies Section does not have any Reply Comment
  postContainer.removeChild(repliesCon);
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
  commentParagraph.classList.remove('hide');
}

// Will remove the "edit form" and discard all changes to the comment text
export function cancelUpdateComment(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');

  commentContentCon.removeChild(formUpdate);
  commentParagraph.classList.remove('hide');
}

// Will add a "edit form" if the comment does not already have one
export function createNewEditForm(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  // If the Comment Content Container does not have an Edit Form
  if (getDirectChild(commentContentCon, '.form-container') === undefined) {
    const commentParagraph = commentContentCon.querySelector('p');
    const commentText = commentParagraph.innerText;
    const updateFormCon = form.addEditForm(commentText);

    // commentParagraph.style.display = 'none';
    commentParagraph.classList.add('hide');
    commentContentCon.appendChild(updateFormCon);
  }
}

// Will add a "reply form" if the comment does not already have one
// And if comment does not have a replies section, it will add one
export async function createNewReplyForm(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');
  const replyingTo = postContainer.querySelector('.user-text__name').innerText;
  const userData = await data.getCurrentUserData();

  // If the Post Comment does not have any Reply Comment
  if (repliesCon == null) {
    const repliesSection = form.addFormReplyComment(userData, replyingTo, true);
    return postContainer.appendChild(repliesSection);
  }

  // If the Replies Section does not have an Reply Form
  if (getDirectChild(repliesCon, '.form-container') === undefined) {
    const formReplyClone = form.addFormReplyComment(userData, replyingTo, false);
    repliesCon.appendChild(formReplyClone);
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
  rateScore.innerText = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    compactDisplay: 'short',
  }).format(actualScore);
}

export async function loadComment() {
  const userData = await data.getCurrentUserData();
  form.loadCreatedComment(userData, '@cudecavalo mama minha pica!');
}