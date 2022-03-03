import * as data from './data.js';

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

function getReplyingTo(text) {
  const regex = /(^|[^\w@/\!?=&])@(\w{1,15})\b/;
  return regex.exec(text);
}

function saveCommentOrReply(commentId, commentObj, text) {
  const comments = data.getComments();

  if (commentId !== undefined) {
    delete commentObj.replies;
    const replyingObj = getReplyingTo(text);

    commentObj.replyingTo = replyingObj === null ? '' : replyingObj['2'];
    comments.forEach(comment => {
      if (comment.id == commentId) comment.replies.push(commentObj);
    });
  } else {
    comments.push(commentObj);
  }

  localStorage.setItem('comments', JSON.stringify(comments));
}

export function saveUpdatedComment(commentId, text) {
  const comments = data.getComments();

  comments.forEach(comment => {
    if (comment.id == commentId) {
      return (comment.content = text);
    }
    comment.replies.forEach(reply => {
      if (reply.id == commentId) {
        reply.content = text;
        const replyingObj = getReplyingTo(text);
        return (reply.replyingTo = replyingObj === null ? '' : replyingObj['2']);
      }
    });
  });

  localStorage.setItem('comments', JSON.stringify(comments));
}

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
    content: textValue,
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
  };

  saveCommentOrReply(commentId, commentObj, textValue);
  localStorage.setItem('availableId', idValue + 1);
  postDiv.setAttribute('data-comment-id', idValue);
  postDiv.setAttribute('data-created-at', creationTime);
  userNameh2.innerHTML = `${userData.username} <span class="user__mark">you</span>`;
  commentedP.innerText = formatCreationTime(creationTime);
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  commentContentP.innerHTML = processCommentText(textValue);
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
export function processCommentText(text) {
  // const regex = /(^|[^\w@/\!?=&])@(\w{1,15})\b/g;
  const regex = /(^|[^\w@/\!?=&])@(\w{1,15})\b/;
  const replace = '$1<strong class="replying-to">@$2</strong>';
  return text.replace(regex, replace);
}

// Will create a new "edit form"
export function addEditForm(commentText) {
  const formUpdateTemplate = document.querySelector('#form-update-template');
  const formUpdateClone = formUpdateTemplate.content.cloneNode(true);
  const textArea = formUpdateClone.querySelector('.form__txtarea');

  textArea.value = commentText;
  return formUpdateClone;
}

/* ***************** TESTS ******************** */
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
  commentContentP.innerHTML = processCommentText(commentData.content);
  rateScoreP.innerText = formatCommentScore(commentData.score);
  rateScoreP.dataset.rateScore = commentData.score;

  // If the comment was made by the currently logged user
  if (isDeepEqual(userData, commentData.user)) {
    setLoggedButtons(userNameh2, optionsDiv);
  } else {
    const replyBtnTemplate = document.querySelector('#reply-btn-template');
    const replyBtnClone = replyBtnTemplate.content.cloneNode(true);
    optionsDiv.appendChild(replyBtnClone);
  }

  // If it is a reply comment, remove your replies section
  if (isReply) {
    postDiv.removeChild(postClone.querySelector('.replies'));
  }
  // Returns the Comment Post Container
  return postClone;
}

// Will set all buttons specific to the current user
function setLoggedButtons(userNameh2, optionsDiv) {
  const userBtnsTemplate = document.querySelector('#logged-user-btns-template');
  const userBtnsClone = userBtnsTemplate.content.cloneNode(true);
  const userMarkSpan = document.createElement('span');

  userMarkSpan.classList.add('user__mark');
  userMarkSpan.innerText = 'you';
  userNameh2.appendChild(userMarkSpan);
  optionsDiv.appendChild(userBtnsClone);
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
