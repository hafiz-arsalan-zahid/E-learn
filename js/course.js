document.addEventListener('DOMContentLoaded', () => {
    // Remove loading overlay immediately when DOM is ready
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }

    // Initialize Ace Editor with enhanced configuration
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");
    editor.setOptions({
        enableLiveAutocompletion: true,
        enableSnippets: true,
        enableBasicAutocompletion: true,
        fontSize: "16px",
        showPrintMargin: false,
        showGutter: true,
        highlightActiveLine: true,
        wrap: true,
        tabSize: 2,
        useSoftTabs: true
    });

    // Custom HTML snippets
    const customSnippets = {
        "html": {
            "prefix": "html5",
            "body": [
                "<!DOCTYPE html>",
                "<html lang=\"en\">",
                "<head>",
                "\t<meta charset=\"UTF-8\">",
                "\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
                "\t<title>${1:Document}</title>",
                "</head>",
                "<body>",
                "\t${2}",
                "</body>",
                "</html>"
            ]
        },
        "div": {
            "prefix": "div",
            "body": ["<div class=\"${1}\">${2}</div>"]
        }
        // Add more snippets as needed
    };

    // Add custom completions
    const langTools = ace.require("ace/ext/language_tools");
    langTools.addCompleter({
        getCompletions: function(editor, session, pos, prefix, callback) {
            const completions = [];
            const htmlTags = [
                'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th',
                'form', 'input', 'button', 'select', 'option', 'textarea'
            ];

            htmlTags.forEach(tag => {
                completions.push({
                    value: `<${tag}></${tag}>`,
                    meta: "HTML Tag",
                    score: 1000
                });
            });

            callback(null, completions);
        }
    });

    // Set initial editor content
    const initialCode = `<!DOCTYPE html>
<html>
<head>
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to HTML learning.</p>
</body>
</html>`;
    
    editor.setValue(initialCode, -1);

    // Create iframe for preview if it doesn't exist
    let previewFrame = document.querySelector('.preview-frame');
    if (!previewFrame) {
        previewFrame = document.createElement('iframe');
        previewFrame.className = 'preview-frame';
        document.querySelector('.preview-container').appendChild(previewFrame);
    }

    // Function to update preview
    function updatePreview(code) {
        const darkStyles = `
            <style>
                body { 
                    background: #1e1e1e; 
                    color: #ffffff; 
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                    margin: 0;
                    line-height: 1.6;
                }
                h1, h2, h3, h4, h5, h6 { color: #00ff00; }
                a { color: #00ff00; }
            </style>
        `;

        // Update iframe content
        const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
        preview.open();
        preview.write(darkStyles + code);
        preview.close();
    }

    // Create output container if it doesn't exist
    let outputContainer = document.querySelector('.output-container');
    if (!outputContainer) {
        outputContainer = document.createElement('div');
        outputContainer.className = 'output-container';
        document.querySelector('.code-playground').appendChild(outputContainer);
    }

    // Create output display
    let outputDisplay = document.createElement('div');
    outputDisplay.className = 'output-display';
    outputContainer.appendChild(outputDisplay);

    // Function to validate HTML
    function validateHTML(code) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/html');
        return doc.documentElement.querySelector('parsererror') === null;
    }

    // Function to update output
    function updateOutput(code) {
        try {
            if (!validateHTML(code)) {
                throw new Error('Invalid HTML');
            }

            outputDisplay.innerHTML = code;
            
            // Add dark theme styles
            const style = document.createElement('style');
            style.textContent = `
                .output-display {
                    background: #1e1e1e;
                    color: #ffffff;
                    padding: 20px;
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                }
                .output-display h1, 
                .output-display h2, 
                .output-display h3, 
                .output-display h4, 
                .output-display h5, 
                .output-display h6 { 
                    color: #00ff00; 
                }
                .output-display a { 
                    color: #00ff00; 
                }
            `;
            outputDisplay.appendChild(style);

            return true;
        } catch (error) {
            outputDisplay.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error: Invalid HTML code
                </div>
            `;
            return false;
        }
    }

    // Run button functionality
    const runBtn = document.querySelector('.run-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const errorBtn = document.querySelector('[data-error]');

    runBtn?.addEventListener('click', () => {
        const code = editor.getValue();
        
        // Add loading state
        runBtn.classList.add('running');
        runBtn.innerHTML = `
            <span class="loading-indicator">
                <i class="fas fa-spinner"></i>
                Running...
            </span>
        `;
        runBtn.disabled = true;

        setTimeout(() => {
            const success = updateOutput(code);

            if (success) {
                // Success state
                runBtn.classList.remove('running');
                runBtn.classList.add('success');
                runBtn.innerHTML = `
                    <i class="fas fa-check"></i>
                    Success!
                `;

                // Hide error button if it exists
                if (errorBtn) errorBtn.style.display = 'none';
            } else {
                // Error state
                runBtn.classList.remove('running');
                runBtn.classList.add('error');
                runBtn.innerHTML = `
                    <i class="fas fa-times"></i>
                    Error
                `;

                // Show error button if it exists
                if (errorBtn) errorBtn.style.display = 'block';
            }

            // Reset button state
            setTimeout(() => {
                runBtn.classList.remove('success', 'error');
                runBtn.innerHTML = `
                    <i class="fas fa-play"></i>
                    Run
                `;
                runBtn.disabled = false;
            }, 1500);
        }, 500);
    });

    // Reset functionality
    resetBtn?.addEventListener('click', () => {
        editor.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to HTML learning.</p>
</body>
</html>`, -1);
        
        // Clear output
        updateOutput('');
        
        // Hide error button if it exists
        if (errorBtn) errorBtn.style.display = 'none';
    });

    // Set initial content
    editor.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to HTML learning.</p>
</body>
</html>`, -1);

    // Initial output
    updateOutput(editor.getValue());

    // Sidebar Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.course-sidebar');
    const closeBtn = document.querySelector('.close-sidebar');

    hamburger?.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeBtn?.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Section Expansion
    const sections = document.querySelectorAll('.section-header');
    sections.forEach(section => {
        section.addEventListener('click', () => {
            const parent = section.parentElement;
            parent.classList.toggle('active');
            const icon = section.querySelector('i');
            icon.style.transform = parent.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0)';
        });
    });

    // Lesson Navigation
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    let currentLessonIndex = 0;

    function updateNavigation() {
        // Update buttons state
        prevBtn.disabled = currentLessonIndex === 0;
        nextBtn.disabled = currentLessonIndex === sections.length - 1;

        // Update active section
        sections.forEach((section, index) => {
            if (index === currentLessonIndex) {
                section.classList.add('active');
                // Ensure parent section is expanded
                const parentSection = section.closest('.section');
                parentSection.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Load content for current lesson
        loadLessonContent(currentLessonIndex);
    }

    nextBtn?.addEventListener('click', () => {
        if (currentLessonIndex < sections.length - 1) {
            currentLessonIndex++;
            updateNavigation();
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentLessonIndex > 0) {
            currentLessonIndex--;
            updateNavigation();
        }
    });

    // Section Links Navigation
    sections.forEach((section, index) => {
        section.addEventListener('click', (e) => {
            e.preventDefault();
            currentLessonIndex = index;
            updateNavigation();
        });
    });

    // Lesson content data
    const lessonContent = {
        '1.1': {
            title: 'What is HTML?',
            content: `
                <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications. It provides the basic structure and content of a webpage.</p>
                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    <p>HTML uses tags to define different elements on a webpage. Each tag serves a specific purpose.</p>
                </div>
            `,
            code: `<!DOCTYPE html>
<html>
<head>
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to HTML learning.</p>
</body>
</html>`
        },
        '1.2': {
            title: 'HTML Document Structure',
            content: `
                <p>Every HTML document follows a basic structure that includes DOCTYPE declaration, html, head, and body elements.</p>
                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    <p>The DOCTYPE declaration tells the browser what version of HTML the page is using.</p>
                </div>
            `,
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document Structure</title>
</head>
<body>
    <h1>HTML Structure</h1>
    <p>This is a basic HTML document structure.</p>
</body>
</html>`
        }
        // Add more lessons here
    };

    // Function to load lesson content
    function loadLesson(lessonId) {
        const lesson = lessonContent[lessonId];
        if (!lesson) return;

        // Update content with animations
        document.querySelector('.content-header h1').textContent = lesson.title;
        const lessonText = document.querySelector('.lesson-text');
        lessonText.innerHTML = lesson.content;
        lessonText.classList.remove('animate-slide');
        void lessonText.offsetWidth; // Trigger reflow
        lessonText.classList.add('animate-slide');

        // Update code editor
        editor.setValue(lesson.code, -1);
        
        // Clear preview
        const preview = document.querySelector('#preview');
        preview.srcdoc = '';
    }

    // Initialize first lesson
    loadLesson('1.1');

    // Handle section link clicks
    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lessonId = link.getAttribute('data-lesson');
            loadLesson(lessonId);
            
            // Update active states
            document.querySelector('.section-link.active')?.classList.remove('active');
            link.classList.add('active');
        });
    });

    // Toggle fullscreen preview
    const togglePreviewBtn = document.querySelector('.toggle-preview');
    const previewContainer = document.querySelector('.preview-container');
    
    togglePreviewBtn?.addEventListener('click', () => {
        previewContainer.classList.toggle('fullscreen');
        const icon = togglePreviewBtn.querySelector('i');
        if (previewContainer.classList.contains('fullscreen')) {
            icon.classList.replace('fa-expand', 'fa-compress');
        } else {
            icon.classList.replace('fa-compress', 'fa-expand');
        }
    });

    // Initialize the navigation
    updateNavigation();

    // Track Progress
    const lessonLinks = document.querySelectorAll('.section-link');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    let completedLessons = 0;

    lessonLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active lesson
            document.querySelector('.section-link.active')?.classList.remove('active');
            link.classList.add('active');

            // Update progress
            if (!link.classList.contains('completed')) {
                link.classList.add('completed');
                completedLessons++;
                const progress = (completedLessons / lessonLinks.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}% Complete`;
            }
        });
    });

    // Sidebar Toggle Functionality
    const closeSidebarBtn = document.querySelector('.close-sidebar');
    const mainContent = document.querySelector('.course-content');
    
    closeSidebarBtn?.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        
        // Add button to reopen sidebar
        if (!document.querySelector('.open-sidebar')) {
            const openBtn = document.createElement('button');
            openBtn.className = 'open-sidebar';
            openBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mainContent.appendChild(openBtn);
            
            openBtn.addEventListener('click', () => {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
                openBtn.remove();
            });
        }
    });
});

// Add these styles to your CSS
const styles = `
    .course-sidebar {
        transition: transform 0.3s ease;
    }

    .course-sidebar.collapsed {
        transform: translateX(-100%);
    }

    .course-content {
        transition: margin-left 0.3s ease;
    }

    .course-content.expanded {
        margin-left: 0;
    }

    .open-sidebar {
        position: fixed;
        left: 1rem;
        top: 1rem;
        background: var(--surface);
        border: 1px solid var(--primary);
        color: var(--primary);
        width: 40px;
        height: 40px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 100;
    }

    .open-sidebar:hover {
        background: var(--primary);
        color: var(--surface);
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);