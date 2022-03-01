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

// Will create a NEW comment or REPLY comment
export function newComment(userData, textValue) {
  const creationTime = new Date().getTime();
  const postTemplate = document.querySelector('#post-con-template');
  const optionsBtnsTemplate = document.querySelector('#logged-user-btns-template');
  const postClone = postTemplate.content.cloneNode(true);
  const optionsBtnsClone = optionsBtnsTemplate.content.cloneNode(true);
  const postDiv = postClone.querySelector('.post-con');
  const userNameh2 = postClone.querySelector('.user-text__name');
  const commentedP = postClone.querySelector('.user-text__commented');
  const sourceElement = postClone.querySelector('.backup-avatar');
  const userAvatarImg = postClone.querySelector('.user__avatar');
  const commentContentP = postClone.querySelector('.comment-content p');
  const optionsDiv = postClone.querySelector('.options');
  const btnReply = postClone.querySelector('.options__reply-btn');

  postDiv.setAttribute('data-logged-user', '');
  postDiv.setAttribute('data-created-at', creationTime);
  userNameh2.innerHTML = `${userData.username} <span class="user__mark">you</span>`;
  commentedP.innerText = formatCreationTime(creationTime);
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  commentContentP.innerHTML = processCommentText(textValue);
  optionsDiv.removeChild(btnReply);
  optionsDiv.appendChild(optionsBtnsClone);

  return postClone;
}

// Will create a new "reply form" and, if needed, a replies section
export function addFormReplyComment(userData, replyingTo, isfirstReply) {
  const formReplyTemplate = document.querySelector('#form-reply-template');
  const formReplyClone = formReplyTemplate.content.cloneNode(true);
  const textArea = formReplyClone.querySelector('.form__txtarea');
  const sourceElement = formReplyClone.querySelector('.backup-avatar');
  const userAvatarImg = formReplyClone.querySelector('.user__avatar');

  textArea.value = `@${replyingTo} `;
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;

  // If it is the first Reply Comment of the Post Comment
  if (isfirstReply) {
    const repliesSection = document.createElement('section');

    repliesSection.classList.add('replies');
    repliesSection.appendChild(formReplyClone);
    return repliesSection;
  }

  // If it is just another Reply Comment to the Post Comment
  return formReplyClone;
}

// It will process the comment text and add tag to all valid "@" mentions
export function processCommentText(text) {
  const regex = /(^|[^\w@/\!?=&])@(\w{1,15})\b/g;
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
export function loadCreatedComment(userData, textValue, isLoggedUser) {
  const allCommentCon = document.querySelector('#comments-con');

  const postTemplate = document.querySelector('#post-con-template');
  const postClone = postTemplate.content.cloneNode(true);
  const postDiv = postClone.querySelector('.post-con');
  const userNameh2 = postClone.querySelector('.user-text__name');
  const commentedP = postClone.querySelector('.user-text__commented');
  const sourceElement = postClone.querySelector('.backup-avatar');
  const userAvatarImg = postClone.querySelector('.user__avatar');
  const commentContentP = postClone.querySelector('.comment-content p');
  const creationTime = new Date('2/10/22').getTime();

  postDiv.setAttribute('data-created-at', creationTime);
  userNameh2.innerText = userData.username;
  commentedP.innerText = formatCreationTime(creationTime);
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  commentContentP.innerHTML = processCommentText(textValue);

  if (isLoggedUser) {
    const optionsBtnsTemplate = document.querySelector('#logged-user-btns-template');
    const optionsBtnsClone = optionsBtnsTemplate.content.cloneNode(true);
    const optionsDiv = postClone.querySelector('.options');
    const btnReply = postClone.querySelector('.options__reply-btn');
    const userMarkSpan = document.createElement('span');

    postDiv.setAttribute('data-logged-user', '');
    userMarkSpan.classList.add('user__mark');
    userMarkSpan.innerText = ' you';
    userNameh2.appendChild(userMarkSpan);
    optionsDiv.removeChild(btnReply);
    optionsDiv.appendChild(optionsBtnsClone);
  }

  allCommentCon.appendChild(postClone);
}
