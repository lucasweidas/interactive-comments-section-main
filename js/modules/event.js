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

export async function createNewPostComment(evt) {
  const allCommentCon = document.querySelector('#comments-con');
  const textArea = evt.currentTarget.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const postContainer = form.newPostComment(userData, textArea.value, true);

  allCommentCon.appendChild(postContainer);
  textArea.value = '';
}

export async function createNewReplyComment(evt) {
  const repliesCon = getPostContainer(evt).querySelector('.replies');
  const formCon = [...repliesCon.children].find(ele => ele.matches('.form-container'));
  const textArea = formCon.querySelector('.form__txtarea');
  const userData = await data.getCurrentUserData();
  const postContainer = form.newPostComment(userData, textArea.value);

  repliesCon.removeChild(formCon);
  repliesCon.appendChild(postContainer);
}

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

export function postUpdatedComment(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');
  const textareaValue = formUpdate.querySelector('.form__txtarea').value;
  const newCommentText = form.processCommentText(textareaValue);

  commentParagraph.innerHTML = newCommentText;
  commentContentCon.removeChild(formUpdate);
  commentParagraph.style.display = 'block';
}

export function cancelUpdateComment(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  const formUpdate = commentContentCon.querySelector('.form-container');
  const commentParagraph = commentContentCon.querySelector('p');

  commentContentCon.removeChild(formUpdate);
  commentParagraph.style.display = 'block';
}

export function createNewEditForm(evt) {
  const commentContentCon = getPostContainer(evt).querySelector('.comment-content');
  // If the Comment Content Container does not have an Edit Form
  if (getDirectChild(commentContentCon, '.form-container') === undefined) {
    const commentParagraph = commentContentCon.querySelector('p');
    const commentText = commentParagraph.innerText;
    const updateFormCon = form.addEditForm(commentText);

    commentParagraph.style.display = 'none';
    commentContentCon.appendChild(updateFormCon);
  }
}

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

export function registerUpVote(evt) {
  const rateCon = evt.target.closest('.rate');
  const rateScoreCon = rateCon.querySelector('.rate__score');
  const actualScore = parseInt(rateScoreCon.innerText);
  
  rateScoreCon.innerText = actualScore + 1;
}

export function registerDownVote(evt) {
  const rateCon = evt.target.closest('.rate');
  const rateScoreCon = rateCon.querySelector('.rate__score');
  const actualScore = parseInt(rateScoreCon.innerText);
  
  if (actualScore > 0) {
    rateScoreCon.innerText = actualScore - 1;
  }
}