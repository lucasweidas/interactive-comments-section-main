export function newPostComment(userData, textValue, isLoggedUser) {
  const createdAt = 'today';
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
  userNameh2.innerHTML = `${userData.username} <span class="user__mark">you</span>`;
  commentedP.innerText = createdAt;
  sourceElement.srcset = userData.image.png;
  userAvatarImg.src = userData.image.webp;
  userAvatarImg.alt = userData.username;
  commentContentP.innerHTML = processCommentText(textValue);
  optionsDiv.removeChild(btnReply);
  optionsDiv.appendChild(optionsBtnsClone);

  return postClone;
}

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

  if (isfirstReply) {
    const repliesSection = document.createElement('section');

    repliesSection.classList.add('replies');
    repliesSection.appendChild(formReplyClone);
    return { repliesSection, textArea };
  }

  return { formReplyClone, textArea };
}

export function processCommentText(text) {
  const regex = /(^|[^\w@/\!?=&])@(\w{1,15})\b/g;
  const replace = '$1<strong class="replying-to">@$2</strong>';

  text = text.replace(regex, replace);
  return text;
}

export function addEditForm(commentText) {
  const formUpdateTemplate = document.querySelector('#form-update-template');
  const formUpdateClone = formUpdateTemplate.content.cloneNode(true);
  const textArea = formUpdateClone.querySelector('.form__txtarea');

  textArea.value = commentText;
  
  return formUpdateClone;
}
