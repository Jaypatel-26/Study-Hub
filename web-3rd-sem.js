// client-side PDF manager with subject-wise storage using localStorage

(function () {
    const GOOGLE_DRIVE_FOLDER_ID = '1iQtzHyz7-UM79qekVINNq-AF3wxdbkc3';
    const API_KEY = 'YOUR_GOOGLE_API_KEY'; // आपकी API key यहाँ डालें
    const subjects = ['D.M', 'I.T.W', 'D.B.M.S', 'D.E', 'D.S.A'];
    
    let currentSubject = subjects[0];
    let selectedFolderHandle = null;
    let currentPdfIndex = null;

    const input = document.getElementById('pdfInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const listEl = document.getElementById('pdfList');
    const pageTitle = document.getElementById('pageTitle');
    const subjectLinks = document.querySelectorAll('.subject-link');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const uploadSection = document.getElementById('uploadSection');
    const selectedFolderName = document.getElementById('selectedFolderName');
    const pdfViewer = document.getElementById('pdfViewer');
    const noViewerMsg = document.getElementById('noViewerMsg');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Google Drive में folder बनाएँ (या ID प्राप्त करें)
    async function getOrCreateSubjectFolder() {
        try {
            // Check if folder exists
            const query = `name='${currentSubject}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${API_KEY}&spaces=drive&fields=files(id,name)`);
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            
            // Create new folder if doesn't exist
            const metadata = {
                name: currentSubject,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [GOOGLE_DRIVE_FOLDER_ID]
            };
            
            const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?key=' + API_KEY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + await getAccessToken()
                },
                body: JSON.stringify(metadata)
            });
            
            const newFolder = await createResponse.json();
            return newFolder.id;
        } catch (err) {
            console.error('Folder error:', err);
            return null;
        }
    }

    // Access token प्राप्त करें (OAuth 2.0 से)
    async function getAccessToken() {
        // यह manually से या backend से आना चाहिए
        return localStorage.getItem('google_access_token') || '';
    }

    // PDF को Google Drive में upload करें
    async function uploadToGoogleDrive(file) {
        try {
            const folderId = await getOrCreateSubjectFolder();
            if (!folderId) {
                alert('Could not access Google Drive folder');
                return false;
            }

            const metadata = {
                name: file.name,
                parents: [folderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=' + API_KEY, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + await getAccessToken()
                },
                body: form
            });

            if (response.ok) {
                const result = await response.json();
                return result.id;
            } else {
                console.error('Upload failed:', response.status);
                return false;
            }
        } catch (err) {
            console.error('Upload error:', err);
            return false;
        }
    }

    // Get PDFs from Google Drive
    async function loadPdfsFromGoogleDrive() {
        try {
            const folderId = await getOrCreateSubjectFolder();
            if (!folderId) return [];

            const query = `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`;
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${API_KEY}&spaces=drive&fields=files(id,name,size,webViewLink,webContentLink)`);
            const data = await response.json();
            
            return data.files || [];
        } catch (err) {
            console.error('Load error:', err);
            return [];
        }
    }

    // Folder selection handler
    selectFolderBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            selectedFolderHandle = await window.showDirectoryPicker();
            selectedFolderName.textContent = '✓ Folder selected: ' + selectedFolderHandle.name;
            uploadSection.style.display = 'block';
            await render();
        } catch (err) {
            if (err.name !== 'AbortError') {
                alert('Error selecting folder: ' + err.message);
            }
        }
    });

    // handle subject clicks
    subjectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentSubject = link.getAttribute('data-subject');
            currentPdfIndex = null;
            subjectLinks.forEach(l => l.style.fontWeight = 'normal');
            link.style.fontWeight = 'bold';
            pageTitle.textContent = `3rd Sem - ${currentSubject}`;
            pdfViewer.style.display = 'none';
            noViewerMsg.style.display = 'block';
            pageInfo.textContent = 'No PDF selected';
            downloadBtn.style.display = 'none';
            render();
        });
    });

    subjectLinks[0].style.fontWeight = 'bold';

    async function render() {
        const items = await loadPdfsFromGoogleDrive();
        if (!items.length) {
            listEl.innerHTML = '<p style="color:#999; text-align:center;">No PDFs added yet</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';

        items.forEach((it, idx) => {
            const li = document.createElement('li');
            li.className = 'pdf-item';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'pdf-item-name';
            nameDiv.textContent = (idx + 1) + '. ' + it.name;
            
            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'pdf-item-size';
            sizeDiv.textContent = (it.size/1024).toFixed(1) + ' KB';
            
            const btnDiv = document.createElement('div');
            btnDiv.style.marginTop = '8px';
            btnDiv.style.display = 'flex';
            btnDiv.style.gap = '6px';
            
            const viewBtn = document.createElement('button');
            viewBtn.textContent = '👁 View';
            viewBtn.style.background = '#667eea';
            viewBtn.style.color = '#fff';
            viewBtn.style.border = 'none';
            viewBtn.style.padding = '4px 8px';
            viewBtn.style.borderRadius = '3px';
            viewBtn.style.cursor = 'pointer';
            viewBtn.style.fontSize = '12px';
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentPdfIndex = idx;
                pdfViewer.src = it.webViewLink;
                pdfViewer.style.display = 'block';
                noViewerMsg.style.display = 'none';
                pageInfo.textContent = `Viewing: ${it.name}`;
                downloadBtn.href = it.webContentLink;
                downloadBtn.download = it.name;
                downloadBtn.style.display = 'inline-block';
                document.querySelectorAll('.pdf-item').forEach((el, i) => {
                    el.classList.toggle('active', i === idx);
                });
            });
            
            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑 Delete';
            delBtn.style.background = '#e74c3c';
            delBtn.style.color = '#fff';
            delBtn.style.border = 'none';
            delBtn.style.padding = '4px 8px';
            delBtn.style.borderRadius = '3px';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontSize = '12px';
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Delete this PDF?')) return;
                try {
                    await fetch(`https://www.googleapis.com/drive/v3/files/${it.id}?key=${API_KEY}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + await getAccessToken()
                        }
                    });
                    currentPdfIndex = null;
                    pdfViewer.style.display = 'none';
                    noViewerMsg.style.display = 'block';
                    await render();
                } catch (err) {
                    console.error('Delete error:', err);
                }
            });
            
            btnDiv.appendChild(viewBtn);
            btnDiv.appendChild(delBtn);
            
            li.appendChild(nameDiv);
            li.appendChild(sizeDiv);
            li.appendChild(btnDiv);
            
            ul.appendChild(li);
        });

        listEl.innerHTML = '';
        listEl.appendChild(ul);
    }

    uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!selectedFolderHandle) {
            alert('Please select a folder first');
            return;
        }
        const files = input.files;
        if (!files || files.length === 0) {
            alert('Please select at least one PDF file');
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        for (let file of files) {
            if (file.type !== 'application/pdf') {
                alert(file.name + ' is not a PDF. Skipping...');
                continue;
            }
            
            try {
                await uploadToGoogleDrive(file);
            } catch (err) {
                console.error('Upload error:', err);
            }
        }

        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Add PDF(s)';
        input.value = '';
        alert('PDF(s) uploaded to Google Drive!');
        await render();
    });

    clearAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('To clear all PDFs, please use Google Drive directly');
    });

    // initial render
    render();
})();