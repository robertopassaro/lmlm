/* ==============================================================
   LM² — scroll-spy for the nav
   Marks the nav link of the section currently on screen with
   aria-current="location" (styled in styles.css). Without JS the
   page works the same, just without the marker.
   ============================================================== */

(function () {
  const links = document.querySelectorAll('.site-nav__links a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const lastId = links[links.length - 1].hash.slice(1);
  let sectionInBand = null;

  function setActive(id) {
    links.forEach(function (link) {
      if (link.hash.slice(1) === id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function update() {
    // The last section is usually too short to reach the band, so when the
    // page is scrolled to the very bottom, highlight it directly.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    setActive(atBottom ? lastId : sectionInBand);
  }

  // The rootMargin shrinks the "viewport" the observer watches to a thin
  // horizontal band 40–45% down the screen. Whichever section crosses that
  // band counts as the current one. (The hero has no nav link, so while it's
  // in the band no link is marked.)
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) sectionInBand = entry.target.id;
    });
    update();
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('main > section[id]').forEach(function (section) {
    observer.observe(section);
  });

  window.addEventListener('scroll', update, { passive: true });
})();


/* ==============================================================
   LM² — meetings: split into Upcoming / Past, tag the next one
   Each meeting has <time datetime="YYYY-MM-DD">. Dates in that
   format sort alphabetically in date order, so a plain string
   comparison with today's date is enough — no date library needed.
   A meeting stays "upcoming" for the whole of its own day.
   ============================================================== */

(function () {
  const upcoming = document.getElementById('meetings-upcoming');
  const past = document.getElementById('meetings-past');
  if (!upcoming || !past) return;

  const now = new Date();
  // Build today's date as "YYYY-MM-DD" in the visitor's local time zone.
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  const upcomingList = upcoming.querySelector('.meeting-list');
  const pastList = past.querySelector('.meeting-list');

  upcomingList.querySelectorAll('.meeting').forEach(function (meeting) {
    const date = meeting.querySelector('time').getAttribute('datetime');
    if (date < today) {
      pastList.prepend(meeting);   // prepend = most recent past meeting on top
    }
  });

  upcoming.querySelector('.meetings__label').textContent = 'Upcoming';

  const next = upcomingList.querySelector('.meeting');
  if (next) {
    next.classList.add('meeting--next');
    const tag = document.createElement('span');
    tag.className = 'meeting__next';
    tag.textContent = 'Next';
    next.prepend(tag);
  } else {
    upcoming.hidden = true;        // nothing scheduled: show only the past list
  }

  if (pastList.children.length) past.hidden = false;
})();
