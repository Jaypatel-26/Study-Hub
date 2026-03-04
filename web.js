document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('currentYear');
    if (year) {
        year.textContent = new Date().getFullYear();
    }

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
