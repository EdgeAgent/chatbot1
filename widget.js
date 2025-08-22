
(function(){
  window.initChatbot = function(config) {
    if (document.getElementById("my-chatbot-button")) return;
    const { botId, color, position, greeting } = config;

    const styles = `
      #my-chatbot-button {
        position: fixed;
        bottom: 20px;
        ${position === "left" ? "left: 20px;" : "right: 20px;"}
        background: ${color};
        color: white;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 999999;
        font-size: 28px;
      }
      #my-chatbot-iframe {
        position: fixed;
        bottom: 90px;
        ${position === "left" ? "left: 20px;" : "right: 20px;"}
        width: 360px;
        height: 520px;
        border: none;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        display: none;
        z-index: 999999;
        background: white;
      }
      @media (max-width: 480px){
        #my-chatbot-iframe { width: 95vw; height: 70vh; ${position === "left" ? "left: 2.5vw;" : "right: 2.5vw;"} }
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    const button = document.createElement("div");
    button.id = "my-chatbot-button";
    button.setAttribute("aria-label", "Open chat");
    button.setAttribute("role", "button");
    button.innerHTML = "💬";
    document.body.appendChild(button);

    const iframe = document.createElement("iframe");
    iframe.id = "my-chatbot-iframe";
    iframe.src = botId; // full URL to your chat page or app
    iframe.title = "Chatbot";
    document.body.appendChild(iframe);

    let open = false;
    button.addEventListener("click", () => {
      open = !open;
      iframe.style.display = open ? "block" : "none";
    });
  };
})();
