const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const toast = (message) => {
  const element = $('.toast');
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => element.classList.remove('show'), 2400);
};

const storageKey = 'bhagva-you-posts';
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const savedPosts = () => {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
};
const persistPosts = (posts) => localStorage.setItem(storageKey, JSON.stringify(posts));
const postMarkup = (post) => `<section class="post-card user-post" data-post-id="${post.id}">
  <div class="post-top"><span class="avatar mini">VK</span><div><strong>Vinod Kumar</strong><p>@vinodbuilds · just now</p></div><button class="more" aria-label="Post options" data-options>•••</button></div>
  <p class="post-copy">${escapeHtml(post.text).replace(/#([\w]+)/g, '<a href="#explore">#$1</a>')}</p>
  <div class="post-actions"><button data-like>♡ <span>Like</span></button><button data-comment>◌ <span>Comment</span></button><button data-share>↗ <span>Share</span></button><button data-save>⌑ <span>Save</span></button></div>
  <div class="comment-box hidden"><input aria-label="Add comment" placeholder="Write a thoughtful reply..." /><button>Send</button></div></section>`;
function renderSavedPosts() {
  const container = $('#user-posts');
  container.innerHTML = savedPosts().map(postMarkup).join('');
  bindDynamicActions(container);
  bindCommentForms(container);
}

const pages = {
  explore: {
    eyebrow: 'DISCOVER WHAT MOVES YOU', title: 'Explore the spark',
    body: `<div class="discover-search">⌕ <input aria-label="Search content" placeholder="Search people, topics, communities" /></div>
      <h3 class="section-title">Trending today</h3><div class="trend-grid"><article class="trend-card warm"><span>01</span><h3>#MindfulMaking</h3><p>18.4k sparks this week</p></article><article class="trend-card violet"><span>02</span><h3>#CodeForGood</h3><p>9.2k creators building</p></article><article class="trend-card sky"><span>03</span><h3>#SmallJoy</h3><p>7.8k moments shared</p></article></div>
      <h3 class="section-title">Communities growing now</h3><div class="community-list"><article><b>◈</b><div><strong>Weekend Wanderers</strong><p>Slow travel, local stories, and new horizons.</p><small>24.6k members</small></div><button class="follow">Join</button></article><article><b>⌘</b><div><strong>Design Room</strong><p>A welcoming place to share work in progress.</p><small>18.1k members</small></div><button class="follow">Join</button></article></div>`
  },
  shorts: {
    eyebrow: 'SHORTS', title: 'A minute of wonder',
    body: `<div class="short-view"><img src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85" alt="Mountains under a night sky" /><div class="short-gradient"></div><button class="play" aria-label="Play short">▶</button><div class="short-copy"><p>@neiltravels · following</p><h2>The quietest place I have ever slept.</h2><small>♬ Distant lights — Neil Thomas</small></div><div class="short-actions"><button data-like>♡<small>8.4k</small></button><button data-comment>◌<small>426</small></button><button data-share>↗<small>Share</small></button></div></div>`
  },
  communities: {
    eyebrow: 'YOUR CORNERS OF THE INTERNET', title: 'Communities',
    body: `<div class="community-hero"><span>◎</span><div><h3>Find people who get it.</h3><p>Join conversations around the things you care about.</p></div><button class="publish" data-open-composer>Start a community</button></div><div class="community-list spacious"><article><b class="orange">⌘</b><div><strong>Code Circle</strong><p>Thoughtful coding, shipping, and learning out loud.</p><small>12.8k members · 342 online</small></div><button class="follow">Joined</button></article><article><b class="purple">◉</b><div><strong>Photo Walks</strong><p>See your neighbourhood through a new lens.</p><small>8.3k members · 118 online</small></div><button class="follow">Join</button></article><article><b class="blue">♫</b><div><strong>Music Makers</strong><p>Share demos, discover sounds, make noise together.</p><small>6.1k members · 74 online</small></div><button class="follow">Join</button></article></div>`
  },
  messages: {
    eyebrow: 'KEEP THE CONVERSATION GOING', title: 'Messages',
    body: `<div class="messages-layout"><aside><div class="discover-search">⌕ <input aria-label="Search conversations" placeholder="Search messages" /></div><button class="conversation active"><span class="avatar mini">ZK</span><span><strong>Zoya Khan</strong><small>That sounds perfect — 2m</small></span></button><button class="conversation"><span class="avatar mini">CC</span><span><strong>Code Circle</strong><small>Arjun: shipping notes are up</small></span></button><button class="conversation"><span class="avatar mini">MT</span><span><strong>Neil Thomas</strong><small>Shared a photo</small></span></button></aside><article class="chat"><header><span class="avatar mini">ZK</span><div><strong>Zoya Khan</strong><small>Active now</small></div></header><div class="bubbles"><p>Have you seen today’s challenge?</p><p class="mine">Yes! I’m going to take a walk with my camera after lunch.</p><p>That sounds perfect ✦</p></div><form class="message-form"><input aria-label="Message Zoya" placeholder="Write a message" /><button>Send</button></form></article></div>`
  },
  notifications: {
    eyebrow: 'YOUR ACTIVITY', title: 'Notifications',
    body: `<div class="notification-list"><button><span class="avatar mini">MS</span><p><strong>Maya Singh</strong> liked your reply on <em>#CreativeProcess</em><small>12 minutes ago</small></p><b class="unread"></b></button><button><span class="avatar mini">CC</span><p><strong>Code Circle</strong> pinned a new welcome post.<small>1 hour ago</small></p><b class="unread"></b></button><button><span class="avatar mini">NT</span><p><strong>Neil Thomas</strong> started following you.<small>Yesterday</small></p><span class="follow follow-back" role="button" tabindex="0">Follow back</span></button></div>`
  },
  profile: {
    eyebrow: 'CREATOR PROFILE', title: 'Vinod Kumar',
    body: `<div class="profile-hero"><span class="profile-avatar">VK</span><div><h2>Vinod Kumar <em>✦</em></h2><p>@vinodbuilds</p><p class="bio">Designing warm digital spaces, one thoughtful detail at a time.</p><div><strong>248</strong> following <strong>1.8k</strong> followers</div></div><button class="follow">Edit profile</button></div><div class="feed-tabs"><button class="tab active">Posts</button><button class="tab">Shorts</button><button class="tab">Media</button></div><div class="empty-state"><span>✦</span><h3>Your next spark starts here.</h3><p>Share an idea, a photo, or a small win with your people.</p><button class="publish" data-open-composer>Create your first post</button></div>`
  }
};

const composer = $('.composer');
function bindDynamicActions(scope = document) {
  $$('[data-open-composer]', scope).forEach(button => button.addEventListener('click', () => composer.showModal()));
  $$('[data-like]', scope).forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('liked');
    button.firstChild.textContent = button.classList.contains('liked') ? '♥' : '♡';
    toast(button.classList.contains('liked') ? 'Added to your likes' : 'Removed from your likes');
  }));
  $$('[data-save]', scope).forEach(button => button.addEventListener('click', () => { button.classList.toggle('liked'); toast(button.classList.contains('liked') ? 'Saved for later' : 'Removed from saved'); }));
  $$('[data-comment]', scope).forEach(button => button.addEventListener('click', () => {
    const box = $('.comment-box', button.closest('.post-card'));
    if (box) { box.classList.toggle('hidden'); if (!box.classList.contains('hidden')) $('input', box).focus(); }
    else toast('Comments opened');
  }));
  $$('[data-share]', scope).forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Post link copied to clipboard'); } catch { toast('Share link is ready'); }
  }));
  $$('.follow', scope).forEach(button => button.addEventListener('click', () => {
    const isJoined = button.textContent.trim() === 'Joined';
    const following = button.textContent.trim() === 'Following';
    button.textContent = (following || isJoined) ? (isJoined ? 'Join' : 'Follow') : (button.textContent.trim() === 'Join' ? 'Joined' : 'Following');
    toast(button.textContent.trim() === 'Follow' || button.textContent.trim() === 'Join' ? 'Preference updated' : 'You are now connected');
  }));
  $$('[data-options]', scope).forEach(button => button.addEventListener('click', () => {
    const post = button.closest('.post-card');
    if (post?.classList.contains('user-post') && window.confirm('Delete this post?')) {
      persistPosts(savedPosts().filter(item => String(item.id) !== post.dataset.postId));
      post.remove();
      toast('Post deleted');
    } else if (!post?.classList.contains('user-post')) {
      toast('Post options: report, hide, or mute are available in the full app.');
    }
  }));
  $$('.play', scope).forEach(button => button.addEventListener('click', () => {
    button.textContent = button.textContent === '▶' ? 'Ⅱ' : '▶';
    toast(button.textContent === 'Ⅱ' ? 'Short playing' : 'Short paused');
  }));
  $$('.message-form', scope).forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const input = $('input', form);
    const message = input.value.trim();
    if (!message) return;
    const bubble = document.createElement('p');
    bubble.className = 'mine';
    bubble.textContent = message;
    $('.bubbles', form.closest('.chat')).append(bubble);
    input.value = '';
  }));
}

function bindCommentForms(scope = document) {
  $$('.comment-box button', scope).forEach(button => button.addEventListener('click', () => {
    const input = $('input', button.parentElement);
    const message = input.value.trim();
    if (!message) return;
    const reply = document.createElement('p');
    reply.className = 'posted-comment';
    reply.textContent = `You: ${message}`;
    button.parentElement.after(reply);
    input.value = '';
    toast('Comment posted');
  }));
}

function showPage(name) {
  if (name === 'home') {
    $('#home').classList.remove('hidden');
    $('.right-rail').classList.remove('hidden');
    $('#secondary-view').classList.add('hidden');
  } else {
    const page = pages[name] || pages.explore;
    $('#home').classList.add('hidden');
    $('.right-rail').classList.add('hidden');
    const view = $('#secondary-view');
    view.innerHTML = `<header class="view-heading"><p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1></header>${page.body}`;
    view.classList.remove('hidden');
    bindDynamicActions(view);
  }
  $$('.nav-link, .bottom-nav a').forEach(link => link.classList.toggle('active', link.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('[data-view]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); showPage(link.dataset.view); }));
bindDynamicActions();
renderSavedPosts();
composer.addEventListener('close', () => {
  if (composer.returnValue === 'default') {
    const text = $('#post-text').value.trim();
    if (!text) return;
    const posts = savedPosts();
    posts.unshift({ id: Date.now(), text });
    persistPosts(posts);
    renderSavedPosts();
    $('#post-text').value = '';
    toast('Your spark is published to the community.');
  }
});
$('.composer form').addEventListener('submit', event => {
  if (!$('#post-text').value.trim()) {
    event.preventDefault();
    toast('Write a little something before publishing.');
  }
});
$$('.theme-toggle').forEach(button => button.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  $$('.theme-toggle').forEach(toggle => { toggle.textContent = document.body.classList.contains('dark') ? '☀' : '☾'; });
}));
$$('[data-attachment]').forEach(button => button.addEventListener('click', () => toast(`${button.dataset.attachment} picker ready for your upload`)));
$('.add-story').addEventListener('click', () => toast('Story composer opened'));
bindCommentForms();
