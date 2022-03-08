import * as data from './data.js';
import * as event from './event.js';

// Will format the time in milliseconds into a timestamp string with the time elapsed between the creation of the comment and the present
function formatCreationTime(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  // Year Condition
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''}`;

  // Month Condition
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''}`;

  // Week Condition
  interval = Math.floor(seconds / 604800);
  if (interval >= 1) return `${interval} week${interval > 1 ? 's' : ''}`;

  // Day Conditions
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days`;
  if (interval === 1) return 'yesterday';
  if (interval === 0) return 'today';
}

// It will check if the user "@mention" is the first string of the comment. If "true", this string will be returned, otherwise an empty string
function getReplyingTo(text) {
  const regex = /^(^|[^\w@/\!?=&])@(\w{1,15})\b/;
  const replyingTo = regex.exec(text.trim());
  return replyingTo === null ? '' : replyingTo['2'];
}

// Will Save the User Comment or Reply in the "LocalStorage"
function saveCommentOrReply(commentId, commentObj, text) {
  const comments = data.getComments();
  const replyingTo = getReplyingTo(text);
  const result = { text: text, replying: '' };

  if (commentId !== undefined) {
    delete commentObj.replies;
    commentObj.replyingTo = replyingTo;
    comments.forEach(comment => {
      if (comment.id == commentId) {
        result.text = processCommentText(text);
        result.replying = replyingTo;
        commentObj.content = result.text;
        return comment.replies.push(commentObj);
      }
    });
  } else {
    commentObj.content = text;
    comments.push(commentObj);
  }

  localStorage.setItem('comments', JSON.stringify(comments));
  return result;
}

// It will Update the User Comment or Reply and Save these changes in the "LocalStorage"
export function saveUpdatedComment(commentId, text) {
  const comments = data.getComments();
  const replyingTo = getReplyingTo(text);
  const result = { text: text, replying: '' };

  comments.forEach(comment => {
    if (comment.id == commentId) {
      return (comment.content = text);
    }
    comment.replies.forEach(reply => {
      if (reply.id == commentId) {
        result.text = processCommentText(text);
        reply.content = result.text;
        result.replying = replyingTo;
        return (reply.replyingTo = replyingTo);
      }
    });
  });

  localStorage.setItem('comments', JSON.stringify(comments));
  return result;
}

// Will format the Comment Score and return into an string
// Prevents large numbers from breaking the layout and is user friendly
export function formatCommentScore(actualScore) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    compactDisplay: 'short',
  }).format(actualScore);
}

// Will create a NEW comment or REPLY comment
export function newComment(userData, textValue, commentId) {
  const creationTime = new Date().getTime();
  const postTemplate = document.querySelector('#post-con-template');
  const userBtnsTemplate = document.querySelector('#logged-user-btns-template');
  const postClone = postTemplate.content.cloneNode(true);
  const userBtnsClone = userBtnsTemplate.content.cloneNode(true);
  const postDiv = postClone.querySelector('.post-con');
  const userNameh2 = postClone.querySelector('.user-text__name');
  const commentedP = postClone.querySelector('.user-text__commented');
  const sourceElement = postClone.querySelector('.backup-avatar');
  const userAvatarImg = postClone.querySelector('.user__avatar');
  const commentContentP = postClone.querySelector('.comment-content p');
  const optionsDiv = postClone.querySelector('.options');
  const idValue = parseInt(localStorage.getItem('availableId'));
  // Creating the comment Object that will be saved to localStorage
  const commentObj = {
    id: idValue,
    content: '',
    createdAt: creationTime,
    score: 0,
    user: {
      image: {
        png: userData.image.png,
        webp: userData.image.webp,
      },
      username: userData.username,
    },
    replies: [],
    usersUpVoted: [],
    usersDownVoted: [],
  };
  const { replying: replyingTo, text: text } = saveCommentOrReply(commentId, commentObj, textValue);

  localStorage.setItem('availableId', idValue + 1);
  postDiv.setAttribute('data-comment-id', idValue);
  userNameh2.innerText = userData.username;
  userNameh2.insertAdjacentHTML('beforeend', '<span class="user__mark">you</span>');
  commentedP.innerText = formatCreationTime(creationTime);
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  commentContentP.innerText = text;
  if (replyingTo !== '') addReplyingToMark(commentContentP, replyingTo);
  optionsDiv.appendChild(userBtnsClone);
  // Returns the Comment Post Container
  return postClone;
}

// Will create a new "reply form"
export function addFormReplyComment(userData, replyingTo) {
  const formReplyTemplate = document.querySelector('#form-reply-template');
  const formReplyClone = formReplyTemplate.content.cloneNode(true);
  const textArea = formReplyClone.querySelector('.form__txtarea');
  const sourceElement = formReplyClone.querySelector('.backup-avatar');
  const userAvatarImg = formReplyClone.querySelector('.user__avatar');

  textArea.value = `@${replyingTo} `;
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  // Returns the Reply Form Container
  return formReplyClone;
}

// It will process the comment text and add tag to all valid "@" mentions
export function processCommentText(textValue) {
  const regex = /^(^|[^\w@/\!?=&])@(\w{1,15})\b/;
  return textValue.replace(regex, '');
}

// Will create a new "edit form"
export function addEditForm(commentText) {
  const formUpdateTemplate = document.querySelector('#form-update-template');
  const formUpdateClone = formUpdateTemplate.content.cloneNode(true);
  const textArea = formUpdateClone.querySelector('.form__txtarea');

  textArea.value = commentText;
  return formUpdateClone;
}

// It will create all needed Login Cards and put them into the Cards Container
export function createLoginCard(currentUser, user) {
  const loginCardsCon = document.querySelector('#login-cards');
  const loginCardTemplate = document.querySelector('#login-card-template');
  const loginCardClone = loginCardTemplate.content.cloneNode(true);
  const loginCon = loginCardClone.querySelector('.login');
  const backupAvatarImg = loginCardClone.querySelector('.backup-avatar');
  const userAvatarImg = loginCardClone.querySelector('.user__avatar');
  const userNameH3 = loginCardClone.querySelector('.login-user__name');
  const statusP = loginCardClone.querySelector('.login-user__status');

  backupAvatarImg.srcset = user.image.png;
  userAvatarImg.src = user.image.webp;
  userAvatarImg.alt = user.username;
  userNameH3.innerText = user.username;

  if (isDeepEqual(currentUser, user)) {
    loginCon.setAttribute('data-logged', '');
    statusP.innerText = 'Logged';
    return loginCardsCon.prepend(loginCardClone);
  }

  loginCardsCon.appendChild(loginCardClone);
}

// It will Create All Comments Container saved in the "LocalStorage"
export function loadCreatedComments(userData, commentData, isReply) {
  const postTemplate = document.querySelector('#post-con-template');
  const postClone = postTemplate.content.cloneNode(true);
  const postDiv = postClone.querySelector('.post-con');
  const userNameh2 = postClone.querySelector('.user-text__name');
  const commentedP = postClone.querySelector('.user-text__commented');
  const sourceElement = postClone.querySelector('.backup-avatar');
  const userAvatarImg = postClone.querySelector('.user__avatar');
  const commentContentP = postClone.querySelector('.comment-content p');
  const rateScoreP = postClone.querySelector('.rate__score');
  const optionsDiv = postClone.querySelector('.options');
  const creationTime = commentData.createdAt;

  postDiv.setAttribute('data-comment-id', commentData.id);
  userNameh2.innerText = commentData.user.username;
  commentedP.innerText = typeof creationTime === 'string' ? creationTime : formatCreationTime(creationTime);
  sourceElement.srcset = commentData.user.image.png;
  userAvatarImg.src = commentData.user.image.webp;
  userAvatarImg.alt = commentData.user.username;
  commentContentP.innerText = commentData.content;
  rateScoreP.innerText = formatCommentScore(commentData.score);

  // If the comment was made by the currently logged user
  if (isDeepEqual(userData, commentData.user)) {
    const userBtnsTemplate = document.querySelector('#logged-user-btns-template');
    const userBtnsClone = userBtnsTemplate.content.cloneNode(true);

    userNameh2.insertAdjacentHTML('beforeend', '<span class="user__mark">you</span>');
    optionsDiv.appendChild(userBtnsClone);
  } else {
    const replyBtnTemplate = document.querySelector('#reply-btn-template');
    const replyBtnClone = replyBtnTemplate.content.cloneNode(true);

    optionsDiv.appendChild(replyBtnClone);
  }

  // It will prevent the second "if" statement from making its logic if the first "if" statement is true. (is just a way to avoid wasting time)
  alreadyVoted: {
    if (event.isAlreadyVoted(userData, commentData.usersUpVoted)) {
      const upVoteBtn = postClone.querySelector('.up-vote-btn');
      upVoteBtn.classList.add('voted');
      break alreadyVoted;
    }
    if (event.isAlreadyVoted(userData, commentData.usersDownVoted)) {
      const downVoteBtn = postClone.querySelector('.down-vote-btn');
      downVoteBtn.classList.add('voted');
    }
  }

  // If it is a reply comment, remove your replies section
  if (isReply) {
    postDiv.removeChild(postClone.querySelector('.replies'));
    if (commentData.replyingTo !== '') {
      addReplyingToMark(commentContentP, commentData.replyingTo);
    }
  }
  // Returns the Comment Post Container
  return postClone;
}

// Will create a Form Post Container
export function createFormPost(currentUser) {
  const mainCon = document.querySelector('#main');
  const formTemplate = document.querySelector('#form-post-template');
  const formClone = formTemplate.content.cloneNode(true);
  const backupAvatarImg = formClone.querySelector('.backup-avatar');
  const userAvatarImg = formClone.querySelector('.user__avatar');

  backupAvatarImg.srcset = currentUser.image.png;
  userAvatarImg.src = currentUser.image.webp;
  userAvatarImg.alt = currentUser.username;
  mainCon.insertBefore(formClone, mainCon.lastElementChild);
}

// It will add the element that "@marks" the user to the comment container
export function addReplyingToMark(element, replyingTo) {
  element.insertAdjacentHTML('afterbegin', `<strong class="replying-to">@${replyingTo}</strong>`);
}

// Will check if the comment was made by the current user
// All this is needed because of how JavaScript Objects works
// It will check if the "value" of both keys are equal
function isDeepEqual(currentUser, commentUser) {
  const userKeys = Object.keys(currentUser);

  for (const key of userKeys) {
    const val1 = currentUser[key];
    const val2 = commentUser[key];
    const areObjects = isObject(val1) && isObject(val2);

    if ((areObjects && !isDeepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }
  return true;
}

// Will check if it is an object
function isObject(object) {
  return object != null && typeof object === 'object';
}
