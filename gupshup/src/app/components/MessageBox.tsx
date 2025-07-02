import FrndMsg from "./FrndMsg";
import SelfMsg from "./SelfMsg";

interface messages {
  message: string;
  type: "self" | "friend";
}
const MessageBox = ({ data }: { data: messages[] }) => {
  return (
    <div>
      {data.map((msg, index) => {
        if (msg.type == "self") {
          return <SelfMsg message={msg.message} key={index} />;
        } else {
          return <FrndMsg message={msg.message} key={index} />;
        }
      })}
    </div>
  );
};

export default MessageBox;
