/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

let messages = [
  {
    role : "system",
    content : "You are a helpful and precise assistant for L'Oréal customers wanting information about L'Oréal products, routines, and recommendations. "+
    "If the question is unclear, kindly ask for clarification. If the question is unrelated to L'Oréal, politely refuse and kindly explain you can only answer loreal questions."
  }];

//Cloudflare Worker URL
const workerURL = "https://newloreal.elipantoine.workers.dev/";

// Set initial message
chatWindow.textContent = "Hello! How can the L'Oréal advisor assist you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  chatWindow.textContent = 'Thinking...'; // Display a loading message
  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
  messages.push({ role: 'user', content: userInput.value });

  try{
    // Send a POST request to your Cloudflare Worker
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    // Check if the response is not ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response from the Cloudflare Worker
    const result = await response.json();

    // Get the reply from OpenAI's response structure
    const replyText = result?.choices?.[0]?.message?.content;

    // Add the Worker's response to the conversation history
    messages.push({ role: 'assistant', content: replyText });

    // Display the response on the page
    chatWindow.textContent = replyText;
  } catch (error) {
    console.error('Error:', error); // Log the error
      // Show error message to the user
    chatWindow.textContent = 'Sorry, something went wrong. Please try again later.'; 
  }

  // Clear the input field
  userInput.value = '';
});
