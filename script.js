
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const apiKeyInput = document.getElementById("apiKey");
const sendBtn = document.getElementById("sendBtn");
const chatForm = document.getElementById("chatForm");

const history = [];

function addMessage(text, type) {
  const div = document.createElement("div");

  div.className = "message " + type;
  div.textContent = text;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  return div;
}

async function sendMessage() {
  const message = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!message || sendBtn.disabled) return;

  if (!apiKey) {
    alert("Please enter your Gemini API Key!");
    return;
  }

  addMessage(message, "user");
  userInput.value = "";

  sendBtn.disabled = true;
  const loading = addMessage("Thinking...", "bot");

  const contents = [
    ...history,
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Gemini API error"
      );
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      throw new Error("No response received.");
    }

    loading.textContent = reply;

    history.push(
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: reply }] }
    );

  } catch (error) {
    loading.textContent = "Error: " + error.message;
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

chatForm.addEventListener("submit", function(event) {
  event.preventDefault();
  sendMessage();
});
