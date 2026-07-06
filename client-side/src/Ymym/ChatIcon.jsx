import messageCircleIcon from "./MessageCircle-icon.webp";

const ChatIcon = ({ className = "" }) => {
  return (
    <img
      src={messageCircleIcon}
      alt="Chat"
      className={className}
      draggable={false}
    />
  );
};

export default ChatIcon;
