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

// Will get "replies" child or the closest "replies" Section
function getRepliesSection(postCon) {
  const repliesCon = postCon.querySelector('.replies');
  if (repliesCon === null) {
    return postCon.closest('.replies');
  }
  return repliesCon;
}

// It gets the Comment Id value from the attribute in the Comment Container
function getCommentId(element) {
  return element.closest('.post-con').dataset.commentId;
}

// Will create a NEW comment and add it to the root of the comments container
export function createNewPostComment(evt) {
  const allCommentCon = document.querySelector('#comments-con');
  const formCon = evt.currentTarget.querySelector('#form-post');
  const textArea = formCon.querySelector('.form__txtarea');
  const userData = data.getCurrentUser();
  const postContainer = form.newComment(userData, textArea.value);

  allCommentCon.appendChild(postContainer);
  textArea.value = '';
}

// It will create and add a new reply comment to the comment and remove the "reply form"
export function createNewReplyComment(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = getRepliesSection(postContainer);
  const commentId = getCommentId(repliesCon);
  const formCon = getDirectChild(postContainer, '.form-container');
  const textArea = formCon.querySelector('.form__txtarea');
  const userData = data.getCurrentUser();
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
  const { replying: replyingTo, text: text } = form.saveUpdatedComment(commentId, textareaValue);

  commentParagraph.innerText = text;
  if (replyingTo !== '') form.addReplyingToMark(commentParagraph, replyingTo);
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
    const textArea = updateFormCon.querySelector('.form__txtarea');

    commentParagraph.classList.add('hidden');
    commentContentCon.appendChild(updateFormCon);
    textArea.focus();
  }
}

// Will add a "reply form" if the comment does not already have one
export function createNewReplyForm(evt) {
  const postContainer = getPostContainer(evt);
  const repliesCon = postContainer.querySelector('.replies');
  const replyingTo = postContainer.querySelector('.user-text__name').innerText;
  const userData = data.getCurrentUser();

  // If the Replies Section does not have an Reply Form
  if (getDirectChild(postContainer, '.form-container') === undefined) {
    const formReplyClone = form.addFormReplyComment(userData, replyingTo);
    const textArea = formReplyClone.querySelector('.form__txtarea');

    postContainer.insertBefore(formReplyClone, repliesCon);
    textArea.focus();
  }
}

// This will register UP votes
export function registerUpVote(evt) {
  const currentUser = data.getCurrentUser();
  const comments = data.getComments();
  const correctComment = getCorrectComment(comments, getCommentId(evt.target));
  const rateCon = evt.target.closest('.rate');
  const upVoteBtn = rateCon.querySelector('.up-vote-btn');
  const downVoteBtn = rateCon.querySelector('.down-vote-btn');
  const rateScore = rateCon.querySelector('.rate__score');
  const actualScore = parseInt(correctComment.score);

  // If the current user has already down voted, it will add "two" votes:
  // The first vote will "reset" the user vote,
  // and the second is to actually add the UP vote
  if (isAlreadyVoted(currentUser, correctComment.usersDownVoted)) {
    const position = correctComment.usersDownVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersDownVoted.splice(position, 1);
    correctComment.usersUpVoted.push(currentUser.username);
    correctComment.score = actualScore + 2;
    localStorage.setItem('comments', JSON.stringify(comments));
    rateScore.innerText = form.formatCommentScore(correctComment.score);
    downVoteBtn.classList.remove('voted');
    return upVoteBtn.classList.add('voted');
  }

  // If the current user has already up voted, it will remove this vote
  if (isAlreadyVoted(currentUser, correctComment.usersUpVoted)) {
    const position = correctComment.usersUpVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersUpVoted.splice(position, 1);
    correctComment.score = actualScore - 1;
    upVoteBtn.classList.remove('voted');
  } else {
    // Else, it will add one UP vote
    const position = correctComment.usersDownVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersDownVoted.splice(position, 1);
    correctComment.usersUpVoted.push(currentUser.username);
    correctComment.score = actualScore + 1;
    upVoteBtn.classList.add('voted');
  }

  // Will save the new data value
  localStorage.setItem('comments', JSON.stringify(comments));

  // Sets the new formatted score value that will be displayed
  rateScore.innerText = form.formatCommentScore(correctComment.score);
}

// This will register DOWN votes
export function registerDownVote(evt) {
  const currentUser = data.getCurrentUser();
  const comments = data.getComments();
  const correctComment = getCorrectComment(comments, getCommentId(evt.target));
  const rateCon = evt.target.closest('.rate');
  const upVoteBtn = rateCon.querySelector('.up-vote-btn');
  const downVoteBtn = rateCon.querySelector('.down-vote-btn');
  const rateScore = rateCon.querySelector('.rate__score');
  const actualScore = parseInt(correctComment.score);

  // If the current user has already up voted, it will add "two" votes:
  // The first vote will "reset" the user vote,
  // and the second is to actually add the DOWN vote
  if (isAlreadyVoted(currentUser, correctComment.usersUpVoted)) {
    const position = correctComment.usersUpVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersUpVoted.splice(position, 1);
    correctComment.usersDownVoted.push(currentUser.username);
    correctComment.score = actualScore - 2;
    localStorage.setItem('comments', JSON.stringify(comments));
    rateScore.innerText = form.formatCommentScore(correctComment.score);
    upVoteBtn.classList.remove('voted');
    return downVoteBtn.classList.add('voted');
  }

  // If the current user has already DOWN voted, it will remove this vote
  if (isAlreadyVoted(currentUser, correctComment.usersDownVoted)) {
    const position = correctComment.usersDownVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersDownVoted.splice(position, 1);
    correctComment.score = actualScore + 1;
    downVoteBtn.classList.remove('voted');
  } else {
    // Else, it will add one DOWN vote
    const position = correctComment.usersUpVoted.indexOf(currentUser.username);
    // If the user's name is in the list
    if (position > -1) correctComment.usersUpVoted.splice(position, 1);
    correctComment.usersDownVoted.push(currentUser.username);
    correctComment.score = actualScore - 1;
    downVoteBtn.classList.add('voted');
  }

  // Will save the new data value
  localStorage.setItem('comments', JSON.stringify(comments));

  // Sets the new formatted score value that will be displayed
  rateScore.innerText = form.formatCommentScore(correctComment.score);
}

// It will check if the current user has already voted on the comment
export function isAlreadyVoted(currentUser, users) {
  return users.find(user => user === currentUser.username) ? true : false;
}

// It will delete the comment from "localStorage"
export function deleteComment(postContainer) {
  const comments = data.getComments();
  const commentId = postContainer.dataset.commentId;

  comments.forEach((comment, index) => {
    if (comment.id == commentId) {
      comments.splice(index, 1);
    }
    comment.replies.forEach((reply, index) => {
      if (reply.id == commentId) {
        comment.replies.splice(index, 1);
      }
    });
  });

  localStorage.setItem('comments', JSON.stringify(comments));
}

// Every time the page is loaded, it will load all the needed things
export function loadComments() {
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

// Will load all Login Cards
export function loadLoginCards() {
  const currentUser = data.getCurrentUser();
  const allUsers = data.getUsers();

  allUsers.forEach(user => form.createLoginCard(currentUser, user));
}

// It will Load the Form Post Container
export function loadFormPost() {
  const currentUser = data.getCurrentUser();
  form.createFormPost(currentUser);
}

// Every Time the User changes the Current User, it will:
// Remove All Login Cards
// Remove All Comments
// Remove the Form Post Container
// And finally, it will recreate all the deleted elements again
export function changeCurrentUser(evt) {
  const allUsers = data.getUsers();
  const mainCon = document.querySelector('#main');
  const formPost = document.querySelector('[data-form-post]');
  const loginCardsCon = document.querySelector('#login-cards');
  const commentsCon = document.querySelector('#comments-con');
  const loginCon = evt.target.parentElement;
  const loginUser = loginCon.querySelector('.login-user__name').innerText;

  removeAllChildren(loginCardsCon);
  removeAllChildren(commentsCon);
  mainCon.removeChild(formPost);

  allUsers.forEach(user => {
    if (user.username === loginUser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      loadLoginCards();
      loadComments();
      loadFormPost();
    }
  });
}

// Will add or remove the "Dark Mode" theme and save this information to the "LocalStorage"
export function changeTheme(isDarkMode) {
  const checkbox = document.querySelector('#switch-input');
  const label = document.querySelector('#switch-label');
  localStorage.setItem('darkMode', isDarkMode);

  if (isDarkMode === 'true') {
    checkbox.checked = true;
    label.ariaLabel = 'Switch theme to light mode';
    return document.documentElement.setAttribute('data-dark-mode', '');
  }

  label.ariaLabel = 'Switch theme to dark mode';
  document.documentElement.removeAttribute('data-dark-mode');
}

// Will create a new space and store the datas on the "localStorage"
export async function createLocalStorage() {
  const userData = await data.getCurrentUserData();
  const commentsData = await data.getCommentsData();

  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('users', createUsersJSON());
  localStorage.setItem('availableId', 5);
  localStorage.setItem('comments', JSON.stringify(commentsData));
  localStorage.setItem('darkMode', false);
}

// Creates an Array of User Objects and converts it to JSON
function createUsersJSON() {
  return JSON.stringify([
    {
      image: {
        png: './images/avatars/image-juliusomo.png',
        webp: './images/avatars/image-juliusomo.webp',
      },
      username: 'juliusomo',
    },
    {
      image: {
        png: './images/avatars/image-amyrobson.png',
        webp: './images/avatars/image-amyrobson.webp',
      },
      username: 'amyrobson',
    },
    {
      image: {
        png: './images/avatars/image-maxblagun.png',
        webp: './images/avatars/image-maxblagun.webp',
      },
      username: 'maxblagun',
    },
    {
      image: {
        png: './images/avatars/image-ramsesmiron.png',
        webp: './images/avatars/image-ramsesmiron.webp',
      },
      username: 'ramsesmiron',
    },
  ]);
}

// It will get the correct comment from the localStorage, based on the "commentId"
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

// It will remove ALL child elements from a parent element
function removeAllChildren(element) {
  while (element.firstElementChild) {
    element.removeChild(element.firstElementChild);
  }
}
