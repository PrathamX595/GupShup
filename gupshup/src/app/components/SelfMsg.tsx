interface SelfMsgProps {
  message: string;
}

export default function SelfMsg({ message }: SelfMsgProps) {
  return (
    <div className="flex w-full flex-row-reverse">
      <div className="bg-[#FDC62E] w-fit max-w-md break-words py-3 px-5 rounded-xl my-2 text-lg">
        {message}
      </div>
    </div>
  );
}
