document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('currentYear');
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const STORAGE_KEYS = {
        currentUser: 'studyhub_current_user',
        members: 'studyhub_members',
        guestId: 'studyhub_guest_id',
        selectedProfile: 'studyhub_selected_profile',
        impactDaily: 'studyhub_impact_daily',
        onlineTabs: 'studyhub_online_tabs',
        visitors: 'studyhub_visitors'
    };

    const parseJSON = (value, fallback) => {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const getCurrentUser = () => parseJSON(localStorage.getItem(STORAGE_KEYS.currentUser), null);
    const getMembers = () => {
        const stored = parseJSON(localStorage.getItem(STORAGE_KEYS.members), []);
        return Array.isArray(stored) ? stored : [];
    };

    const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

    const getDateKey = () => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    };

    const getImpactDaily = () => {
        const stored = parseJSON(localStorage.getItem(STORAGE_KEYS.impactDaily), {});
        return stored && typeof stored === 'object' ? stored : {};
    };

    const saveImpactDaily = (daily) => {
        localStorage.setItem(STORAGE_KEYS.impactDaily, JSON.stringify(daily));
    };

    const pruneOldImpactEntries = (daily) => {
        const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 120;
        Object.keys(daily).forEach((key) => {
            const time = new Date(`${key}T00:00:00`).getTime();
            if (!Number.isFinite(time) || time < cutoff) {
                delete daily[key];
            }
        });
    };

    const recordVisit = () => {
        const today = getDateKey();

        const daily = getImpactDaily();
        daily[today] = Number(daily[today] || 0) + 1;
        pruneOldImpactEntries(daily);
        saveImpactDaily(daily);
    };

    const getOrCreateTabId = () => {
        let tabId = sessionStorage.getItem('studyhub_tab_id');
        if (!tabId) {
            tabId = `TAB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
            sessionStorage.setItem('studyhub_tab_id', tabId);
        }
        return tabId;
    };

    const getPresenceUserKey = (user) =>
        user && user.email ? `member:${String(user.email).toLowerCase()}` : `guest:${getGuestId()}`;

    const getOnlineTabs = () => {
        const stored = parseJSON(localStorage.getItem(STORAGE_KEYS.onlineTabs), {});
        return stored && typeof stored === 'object' ? stored : {};
    };

    const refreshOnlineTabs = (user, touchCurrentTab = true) => {
        const now = Date.now();
        const online = getOnlineTabs();
        const tabId = getOrCreateTabId();

        // Backward compatibility: old format had numeric timestamps only.
        Object.keys(online).forEach((key) => {
            if (typeof online[key] === 'number') {
                online[key] = {
                    userKey: `legacy:${key}`,
                    ts: Number(online[key])
                };
            }
        });

        if (touchCurrentTab) {
            online[tabId] = {
                userKey: getPresenceUserKey(user),
                ts: now
            };
        }

        Object.keys(online).forEach((key) => {
            const lastSeen = Number((online[key] && online[key].ts) || 0);
            if (now - lastSeen > 45000) {
                delete online[key];
            }
        });

        localStorage.setItem(STORAGE_KEYS.onlineTabs, JSON.stringify(online));
        const activeUsers = new Set();
        Object.values(online).forEach((session) => {
            if (session && session.userKey) {
                activeUsers.add(session.userKey);
            }
        });
        return activeUsers.size;
    };

    const removeCurrentTabFromOnline = () => {
        const tabId = sessionStorage.getItem('studyhub_tab_id');
        if (!tabId) return;
        const online = getOnlineTabs();
        delete online[tabId];
        localStorage.setItem(STORAGE_KEYS.onlineTabs, JSON.stringify(online));
    };

    const getVisitors = () => {
        const stored = parseJSON(localStorage.getItem(STORAGE_KEYS.visitors), {});
        return stored && typeof stored === 'object' ? stored : {};
    };

    const registerVisitor = (user) => {
        const visitors = getVisitors();
        const visitorKey = user && user.email
            ? `member:${String(user.email).toLowerCase()}`
            : `guest:${getGuestId()}`;
        visitors[visitorKey] = Date.now();
        localStorage.setItem(STORAGE_KEYS.visitors, JSON.stringify(visitors));
    };

    const renderImpactStats = () => {
        const monthlyEl = document.getElementById('impactMonthlyReach');
        const onlineEl = document.getElementById('impactOnlineNow');
        const totalUsersEl = document.getElementById('impactTotalUsers');
        if (!monthlyEl || !onlineEl || !totalUsersEl) return;

        const totalReach = Object.keys(getVisitors()).length;
        const onlineNow = refreshOnlineTabs(getCurrentUser(), false);
        const totalUsers = getMembers().length;

        monthlyEl.textContent = formatCount(totalReach);
        onlineEl.textContent = formatCount(onlineNow);
        totalUsersEl.textContent = formatCount(totalUsers);
    };
    const getGuestId = () => {
        let guestId = localStorage.getItem(STORAGE_KEYS.guestId);
        if (!guestId) {
            guestId = `GUEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            localStorage.setItem(STORAGE_KEYS.guestId, guestId);
        }
        return guestId;
    };

    const renderHeaderUser = (user) => {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        const userAvatar = document.querySelector('#headerUser .user-avatar');
        const userActionBtn = document.getElementById('userActionBtn');

        if (!userName || !userId || !userAvatar) return;
        userAvatar.innerHTML = '';

        if (user) {
            userName.textContent = user.fullName || 'Community Member';
            userId.textContent = user.collegeName || 'Study Hub Community';
            if (userActionBtn) {
                userActionBtn.hidden = false;
                userActionBtn.textContent = 'Logout / Reset';
            }
            if (user.photoData) {
                const image = document.createElement('img');
                image.src = user.photoData;
                image.alt = 'Profile';
                userAvatar.appendChild(image);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-user-check';
                userAvatar.appendChild(icon);
            }
            return;
        }

        userName.textContent = 'Guest User';
        userId.textContent = `Guest ID: ${getGuestId()}`;
        if (userActionBtn) {
            userActionBtn.hidden = true;
        }
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-user';
        userAvatar.appendChild(icon);
    };

    const bindUserAction = (user) => {
        const userActionBtn = document.getElementById('userActionBtn');
        if (!userActionBtn || !user) return;

        userActionBtn.addEventListener('click', () => {
            const shouldReset = window.confirm('Logout karke guest mode me jana hai?');
            if (!shouldReset) return;

            const members = getMembers();
            if (user.email) {
                const updatedMembers = members.filter(
                    (member) => (member.email || '').toLowerCase() !== user.email.toLowerCase()
                );
                localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(updatedMembers));
            }

            const selectedProfile = parseJSON(localStorage.getItem(STORAGE_KEYS.selectedProfile), null);
            if (selectedProfile && user.email && (selectedProfile.email || '').toLowerCase() === user.email.toLowerCase()) {
                localStorage.removeItem(STORAGE_KEYS.selectedProfile);
            }

            localStorage.removeItem(STORAGE_KEYS.currentUser);
            localStorage.removeItem(STORAGE_KEYS.guestId);
            window.location.reload();
        });
    };

    const renderJoinSection = (user) => {
        const ctaLink = document.getElementById('joinCommunityCta');
        const ctaText = document.getElementById('joinCommunityCtaText');
        const ctaIcon = ctaLink ? ctaLink.querySelector('i') : null;
        const sectionTitle = document.getElementById('joinSectionTitle');
        const sectionNote = document.getElementById('joinCommunityNote');

        if (!ctaLink || !ctaText || !ctaIcon || !sectionTitle || !sectionNote) return;

        if (user) {
            sectionTitle.textContent = 'Our Community';
            ctaLink.href = 'our-community.html';
            ctaText.textContent = 'Visit Our Community';
            ctaIcon.className = 'fa-solid fa-users';
            sectionNote.textContent = `Welcome ${user.fullName}. You are already a community member.`;
            return;
        }

        sectionTitle.textContent = 'Join Our Community';
        ctaLink.href = 'join-community.html';
        ctaText.textContent = 'Join Community Now';
        ctaIcon.className = 'fa-solid fa-user-plus';
        sectionNote.textContent = 'Free forever - No credit card required';
    };

    const setSelectedProfile = (member) => {
        localStorage.setItem(STORAGE_KEYS.selectedProfile, JSON.stringify(member));
    };

    const renderVisitedProfile = () => {
        const avatarWrap = document.getElementById('visitProfileAvatar');
        const name = document.getElementById('visitProfileName');
        const college = document.getElementById('visitProfileCollege');
        const email = document.getElementById('visitProfileEmail');
        if (!avatarWrap || !name || !college || !email) return;

        const selected = parseJSON(localStorage.getItem(STORAGE_KEYS.selectedProfile), null);
        if (!selected) {
            name.textContent = 'No profile selected';
            college.textContent = '-';
            email.textContent = '-';
            return;
        }

        avatarWrap.innerHTML = '';
        if (selected.photoData) {
            const image = document.createElement('img');
            image.src = selected.photoData;
            image.alt = `${selected.fullName || 'Member'} photo`;
            avatarWrap.appendChild(image);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user';
            avatarWrap.appendChild(icon);
        }

        name.textContent = selected.fullName || 'Community Member';
        college.textContent = selected.collegeName || 'College not set';
        email.textContent = selected.email || 'Not available';
    };

    const renderCommunityMembers = (currentUser) => {
        const grid = document.getElementById('communityGrid');
        const emptyState = document.getElementById('communityEmpty');
        if (!grid) return;

        const members = getMembers().filter((member) =>
            member && (member.fullName || member.email || member.collegeName)
        );
        grid.innerHTML = '';

        if (!members.length) {
            if (emptyState) emptyState.hidden = false;
            return;
        }

        if (emptyState) emptyState.hidden = true;

        members.forEach((member) => {
            const card = document.createElement('article');
            card.className = 'community-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View ${member.fullName || 'member'} profile`);
            card.addEventListener('click', () => {
                setSelectedProfile(member);
                window.location.href = 'profile-visit.html';
            });
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProfile(member);
                    window.location.href = 'profile-visit.html';
                }
            });

            const avatar = document.createElement('div');
            avatar.className = 'community-avatar';
            if (member.photoData) {
                const image = document.createElement('img');
                image.src = member.photoData;
                image.alt = `${member.fullName || 'Member'} photo`;
                avatar.appendChild(image);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-user';
                avatar.appendChild(icon);
            }

            const name = document.createElement('h3');
            name.textContent = member.fullName || 'Community Member';

            const hint = document.createElement('p');
            hint.className = 'tap-hint';
            hint.textContent = 'Tap to view profile';

            card.appendChild(avatar);
            card.appendChild(name);
            card.appendChild(hint);

            if (currentUser && currentUser.email && member.email === currentUser.email) {
                const badge = document.createElement('span');
                badge.className = 'community-badge';
                badge.textContent = 'You';
                card.appendChild(badge);
            }

            grid.appendChild(card);
        });
    };

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    const subjectDirectory = [
        {
            label: 'Maths-1',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/1Qc11EA77BHqczkth0I1QkkaEDwiy_YkK?usp=drive_link',
            aliases: ['maths 1', 'math 1', 'maths-1', 'math-1', 'm1', 'engineering maths 1', 'mathematics 1']
        },
        {
            label: 'Physics',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/1qQsBD9wLbwxuiO1-fhP-ITHXZY2GU4yx?usp=drive_link',
            aliases: ['physics', 'phy']
        },
        {
            label: 'FOP',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/1l78aaeReTGkYM8NoP7zyHZuEP08e6wlw?usp=drive_link',
            aliases: ['fop', 'fundamentals of programming', 'programming fundamentals']
        },
        {
            label: 'BEEE',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/19_7x8z6zLagnKyh4UwgN-hizJLHg9T8W?usp=drive_link',
            aliases: ['beee', 'basic electrical', 'electrical']
        },
        {
            label: 'BCPS',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/1l_3FGdDaToXxD_pwQ7ps1kn7c3ei0E3w?usp=drive_link',
            aliases: ['bcps']
        },
        {
            label: 'FME',
            semester: 1,
            page: 'web-1st-sem.html',
            link: 'https://drive.google.com/drive/folders/1gv5b0iVHtscBcZ4m58tuOCDByNMmaqOC?usp=drive_link',
            aliases: ['fme', 'mechanical']
        },
        {
            label: 'Maths-2',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1QOw5x86Q6-qjhCJwTAwKMcwa1ZfKqnrB?usp=drive_link',
            aliases: ['maths 2', 'math 2', 'maths-2', 'math-2', 'm2', 'engineering maths 2', 'mathematics 2']
        },
        {
            label: 'EVS',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1uHBbdkwfInDG-7wBodn_zA7RwbMUA58N?usp=drive_link',
            aliases: ['evs', 'environment', 'environmental studies']
        },
        {
            label: 'EG',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1uGalcQoun3FP8OiMs2Kux955c1RiFdnA?usp=drive_link',
            aliases: ['eg', 'engineering graphics', 'graphics']
        },
        {
            label: 'OOPC',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1YuQqdYFnehRVid_QvCMHxQpxVYWdoCPD?usp=drive_link',
            aliases: ['oopc', 'oops', 'oop', 'object oriented programming']
        },
        {
            label: 'CIVIL',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1lv3xSsVR-rIsI8U-6i-I2WFCxyAxc8ht?usp=drive_link',
            aliases: ['civil', 'civil engineering']
        },
        {
            label: 'IICT',
            semester: 2,
            page: 'web-2nd-sem.html',
            link: 'https://drive.google.com/drive/folders/1a_2F2ulIOVX-OcQU4eeHk3RcJZe-zj68?usp=drive_link',
            aliases: ['iict', 'ict']
        },
        {
            label: 'D.M',
            semester: 3,
            page: 'web-3rd-sem.html',
            link: 'https://drive.google.com/drive/folders/1iQtzHyz7-UM79qekVINNq-AF3wxdbkc3?usp=drive_link',
            aliases: ['d.m', 'dm', 'discrete maths', 'discrete mathematics']
        },
        {
            label: 'I.T.W',
            semester: 3,
            page: 'web-3rd-sem.html',
            link: 'https://drive.google.com/drive/folders/1ndckuWvA7qFvBjh5I_JoVkBnOmo69SJM?usp=drive_link',
            aliases: ['i.t.w', 'itw', 'it workshop']
        },
        {
            label: 'D.B.M.S',
            semester: 3,
            page: 'web-3rd-sem.html',
            link: 'https://drive.google.com/drive/folders/147dSsz2YJREDEW9gZ_yONaKtbu2S7Kuq?usp=drive_link',
            aliases: ['d.b.m.s', 'dbms', 'database', 'database management system']
        },
        {
            label: 'D.E',
            semester: 3,
            page: 'web-3rd-sem.html',
            link: 'https://drive.google.com/drive/folders/1YMX0PoOb4FfYDu4TDU3z8phqcz28sXmm?usp=drive_link',
            aliases: ['d.e', 'de', 'digital electronics']
        },
        {
            label: 'D.S.A',
            semester: 3,
            page: 'web-3rd-sem.html',
            link: 'https://drive.google.com/drive/folders/1EjYMkjiixFBJF9F2WtseVlP0-JySFuKe?usp=drive_link',
            aliases: ['d.s.a', 'dsa', 'data structures', 'data structure and algorithms']
        }
    ];

    const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    const findSubject = (query) => {
        const normalizedQuery = normalize(query);
        return subjectDirectory.find((subject) =>
            subject.aliases.some((alias) => normalizedQuery.includes(normalize(alias)))
        );
    };

    const semesterSuffix = (semester) => (semester === 1 ? 'st' : semester === 2 ? 'nd' : 'rd');

    const addMessage = (content, role) => {
        if (!chatMessages) return;
        const article = document.createElement('article');
        article.className = `chat-bubble ${role}`;
        article.innerHTML = content;
        chatMessages.appendChild(article);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getBotResponse = (query) => {
        const subject = findSubject(query);

        if (subject) {
            return `
                <p><strong>${subject.label}</strong> mil gaya ✅</p>
                <p>Direct steps follow karo:</p>
                <ol>
                    <li><strong>${subject.semester}${semesterSuffix(subject.semester)} Semester</strong> page kholo: <a href="${subject.page}" target="_blank" rel="noopener">${subject.page}</a></li>
                    <li>Subject card <strong>${subject.label}</strong> pe click karo.</li>
                    <li>Direct Drive folder kholo: <a href="${subject.link}" target="_blank" rel="noopener">${subject.label} Material Link</a></li>
                </ol>
            `;
        }

        return `
            <p><strong>Ye AI Location Chat hai.</strong></p>
            <p>Ye sirf subject material ka location/link hi de sakta hai, aur kuch nahi.</p>
            <p>Example try karo: <strong>"DBMS"</strong>, <strong>"Maths-2"</strong>, <strong>"Physics"</strong>.</p>
        `;
    };

    const currentUser = getCurrentUser();
    recordVisit();
    registerVisitor(currentUser);
    refreshOnlineTabs(currentUser, true);
    renderHeaderUser(currentUser);
    bindUserAction(currentUser);
    renderJoinSection(currentUser);
    renderVisitedProfile();
    renderCommunityMembers(currentUser);
    renderImpactStats();

    setInterval(() => {
        if (document.visibilityState === 'visible') {
            refreshOnlineTabs(getCurrentUser(), true);
        }
        renderImpactStats();
    }, 12000);

    window.addEventListener('beforeunload', () => {
        removeCurrentTabFromOnline();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refreshOnlineTabs(getCurrentUser(), true);
            renderImpactStats();
        } else {
            removeCurrentTabFromOnline();
            renderImpactStats();
        }
    });

    window.addEventListener('storage', (event) => {
        if (
            event.key === STORAGE_KEYS.members ||
            event.key === STORAGE_KEYS.impactDaily ||
            event.key === STORAGE_KEYS.onlineTabs
        ) {
            renderImpactStats();
            renderCommunityMembers(getCurrentUser());
        }
    });

    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = chatInput.value.trim();
            if (!query) return;

            addMessage(`<p>${query}</p>`, 'user');
            addMessage(getBotResponse(query), 'bot');
            chatInput.value = '';
        });
    }
});
