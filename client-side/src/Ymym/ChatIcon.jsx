import messageCircleIcon from "./MessageCircle-icon.png";

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
