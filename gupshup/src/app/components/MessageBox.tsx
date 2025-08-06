import FrndMsg from "./FrndMsg";
import SelfMsg from "./SelfMsg";
import SystemMsg from "./SystemMsg";

interface messages {
  message: string;
  type: "self" | "friend" | "system";
}

const MessageBox = ({ data }: { data: messages[] }) => {
  return (
    <div className="pb-2">
      {data.map((msg, index) => {
        if (msg.type == "self") {
          return <SelfMsg message={msg.message} key={index} />;
        } else if(msg.type == "system"){
          return <SystemMsg message={msg.message} key={index} />;
        }else{
          return <FrndMsg message={msg.message} key={index} />;
        }
      })}
    </div>
  );
};

export default MessageBox;