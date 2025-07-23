interface SystemMessage {
  message: string;
}

const SystemMsg = ({ message }: SystemMessage) => {
    return (
    <div className="flex w-full text-center">
      <div className="w-fit max-w-md break-words py-3 px-5 rounded-xl my-2 text-md">
        {message}
      </div>
    </div>
  );
};

export default SystemMsg