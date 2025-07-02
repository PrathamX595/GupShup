interface FrndMsgProps {
  message: string;
}

export default function FrndMsg({ message }: FrndMsgProps) {
  return (
    <div className="flex w-full">
      <div className="bg-[#F2F2F2] w-fit max-w-md break-words py-3 px-5 rounded-xl my-2 text-lg">
        {message}
      </div>
    </div>
  );
}
