function buildNotificationMessage(senderName, type) {
  const cleanName = String(senderName || "").trim();

  if (type === "reply") {
    return cleanName
      ? `${cleanName} replied to your comment`
      : "Someone replied to your comment";
  }

  return cleanName
    ? `${cleanName} commented on your post`
    : "Someone commented on your post";
}

function buildNotificationLink(postId) {
  const numericId = Number(postId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return "/student";
  }

  return `/student?post=${numericId}`;
}

module.exports = {
  buildNotificationMessage,
  buildNotificationLink,
};
