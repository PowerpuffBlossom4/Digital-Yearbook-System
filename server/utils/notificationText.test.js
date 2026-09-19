const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildNotificationMessage,
  buildNotificationLink,
} = require('./notificationText');

test('reply notification includes the sender name', () => {
  assert.equal(
    buildNotificationMessage('Juna Burgos', 'reply'),
    'Juna Burgos replied to your comment'
  );
});

test('comment notification includes the sender name', () => {
  assert.equal(
    buildNotificationMessage('Maria Santos', 'comment'),
    'Maria Santos commented on your post'
  );
});

test('notification links point to the student dashboard post modal', () => {
  assert.equal(
    buildNotificationLink(42),
    '/student?post=42'
  );
});
