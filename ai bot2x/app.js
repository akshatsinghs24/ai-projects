// app.js - UniBot Interactive Client Logic

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const chatViewport = document.getElementById("chat-viewport");
  const messagesList = document.getElementById("messages-list");
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const clearChatBtn = document.getElementById("clear-chat-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const settingsOpenBtn = document.getElementById("settings-open-btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");
  const settingsModal = document.getElementById("settings-modal");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const apiKeyInput = document.getElementById("api-key-input");
  const modelSelect = document.getElementById("model-select");
  const personaSelect = document.getElementById("persona-select");
  const aiStatusBadge = document.getElementById("ai-status-badge");
  const statusText = document.getElementById("status-text");
  const chipButtons = document.querySelectorAll(".chip");

  // State
  let conversationHistory = [];
  let isGenerating = false;

  // Load Settings
  const savedApiKey = localStorage.getItem("unibot_api_key") || "";
  const savedModel = localStorage.getItem("unibot_model") || "gemini-2.5-flash";
  const savedPersona = localStorage.getItem("unibot_persona") || "balanced";
  const savedTheme = localStorage.getItem("unibot_theme") || "theme-dark";

  apiKeyInput.value = savedApiKey;
  modelSelect.value = savedModel;
  personaSelect.value = savedPersona;
  document.body.className = savedTheme;
  themeToggleBtn.textContent = savedTheme === "theme-light" ? "☀️" : "🌙";

  updateStatusBadge();

  // Auto-resize textarea
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
  });

  // Enter to send (Shift+Enter for newline)
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  // Quick Action Chips
  chipButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      if (prompt && !isGenerating) {
        userInput.value = prompt;
        chatForm.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.contains("theme-light");
    if (isLight) {
      document.body.className = "theme-dark";
      themeToggleBtn.textContent = "🌙";
      localStorage.setItem("unibot_theme", "theme-dark");
    } else {
      document.body.className = "theme-light";
      themeToggleBtn.textContent = "☀️";
      localStorage.setItem("unibot_theme", "theme-light");
    }
  });

  // Settings Modal Open/Close
  settingsOpenBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  settingsCloseBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  // Save Settings
  saveSettingsBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const persona = personaSelect.value;

    localStorage.setItem("unibot_api_key", key);
    localStorage.setItem("unibot_model", model);
    localStorage.setItem("unibot_persona", persona);

    updateStatusBadge();
    settingsModal.classList.add("hidden");

    appendAssistantMessage(`⚙️ Settings saved! Active AI Mode: **${key ? "Google Gemini (" + model + ")" : "Offline Campus Engine"}**.`);
  });

  // Clear Chat
  clearChatBtn.addEventListener("click", () => {
    if (confirm("Clear all conversation messages?")) {
      messagesList.innerHTML = "";
      conversationHistory = [];
      appendAssistantMessage("Chat history cleared. How can I assist your studies today?");
    }
  });

  // Submit Handler
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text || isGenerating) return;

    // Reset input
    userInput.value = "";
    userInput.style.height = "auto";

    // Append User Message
    appendUserMessage(text);
    conversationHistory.push({ role: "user", parts: [{ text }] });

    // Show Typing Indicator
    const typingRow = appendTypingIndicator();
    isGenerating = true;
    sendBtn.disabled = true;

    try {
      const apiKey = localStorage.getItem("unibot_api_key") || "";
      const persona = localStorage.getItem("unibot_persona") || "balanced";
      let responseText = "";

      // 1. First attempt: LangGraph backend if running on HTTP server
      let usedLangGraph = false;
      if (window.location.protocol.startsWith("http")) {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              history: conversationHistory.map(m => ({
                role: m.role === "user" ? "user" : "model",
                text: m.parts ? m.parts[0]?.text : ""
              })),
              persona: persona,
              apiKey: apiKey
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.reply) {
              responseText = data.reply;
              usedLangGraph = true;
            }
          }
        } catch (e) {
          // Backend not reachable, fall through to client methods
        }
      }

      // 2. Client-side fallback if LangGraph server wasn't used
      if (!usedLangGraph) {
        if (apiKey) {
          responseText = await callGeminiAPI(text, apiKey);
        } else {
          // Built-in offline university assistant
          await new Promise((r) => setTimeout(r, 450)); // natural micro-delay
          responseText = CampusAI.getOfflineResponse(text);
        }
      }

      // Remove typing indicator and show assistant message
      typingRow.remove();
      appendAssistantMessage(responseText);
      conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
    } catch (err) {
      typingRow.remove();
      console.error(err);
      appendAssistantMessage(`⚠️ **Error:** ${err.message || "Failed to get response."}\n\n*Falling back to offline campus engine:* \n\n` + CampusAI.getOfflineResponse(text));
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      userInput.focus();
    }
  });

  // Call Gemini API
  async function callGeminiAPI(prompt, apiKey) {
    const model = localStorage.getItem("unibot_model") || "gemini-2.5-flash";
    const persona = localStorage.getItem("unibot_persona") || "balanced";

    let personaInstruction = "You are UniBot, an encouraging and expert AI assistant for university and college students.";
    if (persona === "concise") {
      personaInstruction += " Keep answers crisp, structured in bullet points, and highly direct for quick study revision.";
    } else if (persona === "eli5") {
      personaInstruction += " Use the Feynman technique: explain complex academic ideas in very simple terms with clear, relatable analogies.";
    } else {
      personaInstruction += " Provide balanced, supportive, comprehensive explanations with clear formatting, examples, and study tips.";
    }

    const systemInstruction = `${personaInstruction} Always format responses in clean Markdown. Uphold academic integrity: guide students through logic rather than providing honor-code violating exam answers.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Format previous history (last 8 turns for context efficiency)
    const contextHistory = conversationHistory.slice(-8);

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: contextHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textResult = candidate?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("No answer generated from API.");
    }

    return textResult;
  }

  // UI Helpers
  function updateStatusBadge() {
    const apiKey = localStorage.getItem("unibot_api_key");
    if (apiKey) {
      aiStatusBadge.className = "status-indicator online";
      statusText.textContent = "Gemini AI";
    } else {
      aiStatusBadge.className = "status-indicator offline";
      statusText.textContent = "Campus Engine";
    }
  }

  function appendUserMessage(text) {
    const row = document.createElement("div");
    row.className = "message-row user";
    row.innerHTML = `
      <div class="msg-avatar">👤</div>
      <div class="msg-content">
        <div class="msg-author">You <span class="msg-time">${getTimeStr()}</span></div>
        <div class="msg-body">${escapeHtml(text).replace(/\n/g, "<br>")}</div>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendAssistantMessage(markdownText) {
    const row = document.createElement("div");
    row.className = "message-row assistant";
    row.innerHTML = `
      <div class="msg-avatar">🎓</div>
      <div class="msg-content">
        <div class="msg-author">UniBot <span class="msg-time">${getTimeStr()}</span></div>
        <div class="msg-body">${simpleMarkdownToHtml(markdownText)}</div>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const row = document.createElement("div");
    row.className = "message-row assistant";
    row.innerHTML = `
      <div class="msg-avatar">🎓</div>
      <div class="msg-content">
        <div class="msg-author">UniBot <span class="msg-time">Thinking...</span></div>
        <div class="msg-body">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
    return row;
  }

  function scrollToBottom() {
    chatViewport.scrollTop = chatViewport.scrollHeight;
  }

  function getTimeStr() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Lightweight custom markdown parser for clean display
  function simpleMarkdownToHtml(md) {
    if (!md) return "";

    let html = md;

    // Code blocks with syntax copy button
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${escapeHtml(code)}</code>`;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Markdown tables
    html = html.replace(/(\|.+\|\n)+/g, (tableText) => {
      const lines = tableText.trim().split("\n");
      if (lines.length < 2) return tableText;

      let tableHtml = "<table>";
      let hasHeader = false;

      lines.forEach((line, idx) => {
        if (line.includes("---")) {
          hasHeader = true;
          return;
        }
        const cells = line.split("|").slice(1, -1).map(c => c.trim());
        const tag = (idx === 0 || !hasHeader && idx === 0) ? "th" : "td";
        tableHtml += "<tr>" + cells.map(c => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
      });

      tableHtml += "</table>";
      return tableHtml;
    });

    // Unordered lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    html = html.replace(/<\/ul>\s*<ul>/g, "");

    // Line breaks to paragraphs
    const paragraphs = html.split(/\n{2,}/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<ul") || p.startsWith("<blockquote") || p.startsWith("<table")) {
        return p;
      }
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    }).join("\n");

    return html;
  }
});
