document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('currentYear');
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    const semesterLinks = {
        1: 'web-1st-sem.html',
        2: 'web-2nd-sem.html',
        3: 'web-3rd-sem.html'
    };

    const detectSemester = (text) => {
        const input = text.toLowerCase();

        if (/(1st|first|1 sem|1st sem|semester 1|sem 1|1 semester)/.test(input)) return 1;
        if (/(2nd|second|2 sem|2nd sem|semester 2|sem 2|2 semester)/.test(input)) return 2;
        if (/(3rd|third|3 sem|3rd sem|semester 3|sem 3|3 semester)/.test(input)) return 3;
        return null;
    };

    const addMessage = (content, role) => {
        if (!chatMessages) return;
        const article = document.createElement('article');
        article.className = `chat-bubble ${role}`;
        article.innerHTML = content;
        chatMessages.appendChild(article);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getBotResponse = (query) => {
        const semester = detectSemester(query);

        if (!semester) {
            return `
                <p>Please mention your semester number so I can guide exactly.</p>
                <p>Example: "2nd sem material location" or "Where is 3rd semester notes folder?"</p>
            `;
        }

        const target = semesterLinks[semester];
        return `
            <p>Great! Follow these steps to collect your <strong>${semester}${semester === 1 ? 'st' : semester === 2 ? 'nd' : 'rd'} semester</strong> material:</p>
            <ol>
                <li>Go to <strong>Semester Resources</strong> section on this page.</li>
                <li>Click the <strong>${semester}${semester === 1 ? 'st' : semester === 2 ? 'nd' : 'rd'} Semester</strong> card.</li>
                <li>It opens the materials page: <a href="${target}" target="_blank" rel="noopener">${target}</a>.</li>
                <li>Open the subject folder, then download notes/PDFs you need.</li>
                <li>If folder is missing, use <strong>Contact Team</strong> to request upload.</li>
            </ol>
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
